import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";

import jwtDecode from "jwt-decode";

import { signIn } from "services/user";
import { useToast } from "@chakra-ui/react";

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
  const toast = useToast();

  const localUser = getUserFromLocalStorageDecoded();

  const [user, setUser] = useState<User | null>(
    localUser?.cpf ? localUser : null
  );

  const handleLogin = useCallback(
    async (credentials: {
      cpf: string;
      password: string;
    }): Promise<Result<User>> => {
      const res = await signIn(credentials);
      if (res.type === "success") {
        localStorage.setItem("@CAPJu:jwt_user", JSON.stringify(res.value));
        setUser(getUserFromLocalStorageDecoded());
      }
      return {
        type: res.type,
        value: getUserFromLocalStorageDecoded(),
      } as Result<User>;
    },
    []
  );

  function handleLogout() {
    localStorage.removeItem("@CAPJu:jwt_user");
    setUser(null);
  }

  const getUserData = useCallback(async (): Promise<
    Result<User & { allowedActions: string[] }>
  > => {
    if (!user?.cpf) {
      handleLogout();
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

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    if (getJwtFromLocalStorageDecoded().exp < currentTimeInSeconds) {
      localStorage.removeItem("@CAPJu:jwt_user");
      toast({
        id: "token-expired",
        description: "Sessão expirada. Realize o login novamente",
        status: "error",
        isClosable: true,
      });
    }

    return getJwtFromLocalStorageDecoded().id as User;
  }

  function getJwtFromLocalStorageDecoded() {
    const jwtToken = localStorage.getItem("@CAPJu:jwt_user") as string;

    if (!jwtToken) return "";

    return jwtDecode(JSON.stringify(jwtToken)) as any;
  }

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
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
