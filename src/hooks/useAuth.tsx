import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import jwtDecode from "jwt-decode";

import {
  checkSessionStatus,
  signIn,
  signOut,
  signOutExpiredSession,
} from "services/user";
import { useToast } from "@chakra-ui/react";
import { SessionExpirationModal } from "../pages/User/SessionExpirationModal";

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  // eslint-disable-next-line no-unused-vars
  handleLogin: (credentials: {
    cpf: string;
    password: string;
  }) => Promise<Result<User>>;
  handleLogout: () => void;
  getUserData: () => Promise<Result<User & { allowedActions: string[] }>>;
  validateAuthentication: () => void;
};

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isInactivityModalOpen, setIsInactivityModalOpen] =
    useState<boolean>(false);

  const [inactivityModalCounter, setinactivityModalCounter] =
    useState<number>(0);

  const sessionLifespanInSeconds = 20;

  let jwtCheckInterval: any;

  let inactivityTimer: any;

  let inactivityLogoutTimer: any;

  let sessionStatusInterval: any;

  const toast = useToast();

  const localUser = getUserFromLocalStorageDecoded();

  const [user, setUser] = useState<User | null>(
    localUser?.cpf ? localUser : null
  );

  useEffect(() => {
    if (user) {
      addIntervals();
    }
  }, [user]);

  const handleLogin = useCallback(
    async (credentials: {
      cpf: string;
      password: string;
    }): Promise<Result<User>> => {
      const res = await signIn(credentials);
      if (res.type === "success") {
        localStorage.setItem("@CAPJu:jwt_user", JSON.stringify(res.value));
        setUser(getUserFromLocalStorageDecoded());
        return {
          type: res.type,
          value: getUserFromLocalStorageDecoded(),
        } as Result<User>;
      }
      return {
        type: "error",
        error: res.error,
      } as ResultError;
    },
    []
  );

  async function handleLogout(
    logoutInitiator: string = "userRequested",
    afterFnc = () => {}
  ): Promise<void> {
    const result = await signOut(logoutInitiator);
    reactToLogout(result, afterFnc);
  }

  const getUserData = useCallback(async (): Promise<
    Result<User & { allowedActions: string[] }>
  > => {
    if (!user?.cpf) {
      clearLocalUserInfo();
      return {
        type: "error",
        error: new Error("Autenticação inválida."),
        value: undefined,
      };
    }

    return {
      value: { ...user, allowedActions: (user as any).role.allowedActions },
    } as any;
  }, [user]);

  function validateAuthentication() {
    const localStorageUser = getUserFromLocalStorageDecoded();

    if (!localStorageUser.cpf) {
      setUser(null);
      return;
    }

    setUser(localStorageUser);
  }

  function getUserFromLocalStorageDecoded() {
    const jwtToken = localStorage.getItem("@CAPJu:jwt_user") as string;

    if (!jwtToken) return {} as User;

    return getJwtFromLocalStorageDecoded().id as User;
  }

  function clearLocalUserInfo() {
    localStorage.removeItem("@CAPJu:jwt_user");
    setUser(null);
  }

  function getJwtFromLocalStorageDecoded() {
    const jwtToken = localStorage.getItem("@CAPJu:jwt_user") as string;

    if (!jwtToken) return "";

    return jwtDecode(JSON.stringify(jwtToken)) as any;
  }

  async function checkJwtExpiration() {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const tokenExpirationTime = getJwtFromLocalStorageDecoded().exp;
    const oneMinuteBeforeExpiration = tokenExpirationTime - 60;
    if (currentTimeInSeconds >= oneMinuteBeforeExpiration) {
      const res = await signOutExpiredSession();
      reactToLogout(res, () => {
        toast({
          id: "token-expired",
          description: "Token expirado. Realize o login novamente.",
          status: "error",
          isClosable: true,
        });
        removeMouseMoveListener();
        clearTimeoutsAndIntervals();
      });
    }
  }

  async function checkSession() {
    const sessionId = getJwtFromLocalStorageDecoded()?.id?.sessionId;

    if (!sessionId) return;

    const data = (await checkSessionStatus(sessionId)).value as any;

    if (!data.active) {
      clearLocalUserInfo();
      clearTimeoutsAndIntervals();
      removeMouseMoveListener();
      toast({
        id: "token-expired",
        description: data.message || "Sessão encerrada",
        status: "error",
        isClosable: true,
      });
      setTimeout(() => window.location.reload(), 500);
    }
  }

  function addIntervals() {
    clearTimeoutsAndIntervals();

    jwtCheckInterval = setInterval(async () => {
      await checkJwtExpiration();
    }, 10000); // Checked every 10s

    sessionStatusInterval = setInterval(async () => {
      await checkSession();
    }, 80000); // Checked every 1mim 30s

    document.addEventListener("mousemove", handleMouseMove);
  }

  function reactToLogout(result: Result<string>, afterFnc = () => {}) {
    const { type } = result;
    if (type === "success") {
      clearInterval(jwtCheckInterval);
      clearLocalUserInfo();
      clearTimeoutsAndIntervals();
      afterFnc();
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast({
        id: "logou-user-error",
        title: "Erro ao realizar logout",
        status: "error",
        isClosable: true,
      });
    }
  }

  const handleMouseMove = () => {
    setIsInactivityModalOpen(false);
    clearTimeout(inactivityTimer);
    clearTimeout(inactivityLogoutTimer);
    inactivityTimer = setTimeout(() => {
      setinactivityModalCounter(sessionLifespanInSeconds);
      setIsInactivityModalOpen(true);
      inactivityLogoutTimer = setTimeout(async () => {
        await handleLogout("timeoutDueToInactivity", () => {
          toast({
            id: "session-expired",
            description: "Sessão encerrada por inatividade.",
            status: "error",
            isClosable: true,
          });
        });
        setIsInactivityModalOpen(false);
        removeMouseMoveListener();
        clearTimeoutsAndIntervals();
      }, sessionLifespanInSeconds * 1000);
    }, 60 * 5 * 1000); // Checked every 5min
  };

  const clearTimeoutsAndIntervals = () => {
    clearTimeout(inactivityTimer);
    clearTimeout(inactivityLogoutTimer);
    clearInterval(jwtCheckInterval);
    clearInterval(sessionStatusInterval);
  };

  const removeMouseMoveListener = () =>
    document.removeEventListener("mousemove", handleMouseMove);

  useEffect(() => {
    validateAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        handleLogin,
        handleLogout,
        getUserData,
        validateAuthentication,
      }}
    >
      <SessionExpirationModal
        isOpen={isInactivityModalOpen}
        initialCountdown={inactivityModalCounter}
        onClose={() => {}}
      />
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
