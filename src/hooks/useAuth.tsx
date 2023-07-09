import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";

import { signIn, getUserById } from "services/user";
import { roleNameById } from "utils/roles";

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
  const localUser = localStorage.getItem("@CAPJu:user");
  const [user, setUser] = useState<User | null>(
    localUser ? JSON.parse(localUser) : null
  );

  const handleLogin = useCallback(
    async (credentials: {
      cpf: string;
      password: string;
    }): Promise<Result<User>> => {
      const res = await signIn(credentials);
      const role = roleNameById(res.value?.idRole);

      if (res.type === "success") {
        localStorage.setItem(
          "@CAPJu:user",
          JSON.stringify({
            ...res.value,
            role,
          })
        );
        setUser({
          ...res.value,
          role,
        });
      }

      return res;
    },
    []
  );

  function handleLogout() {
    localStorage.removeItem("@CAPJu:user");
    setUser(null);
  }

  const getUserData = async (): Promise<
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

    const res = await getUserById(user?.cpf);
    const role = roleNameById(res.value?.idRole);

    if (res.type === "error" || res.value?.idRole !== user.idRole) {
      handleLogout();
      return {
        type: "error",
        error: new Error("Autenticação inválida."),
        value: undefined,
      };
    }

    setUser({
      ...user,
      ...res.value,
      role,
    });

    localStorage.setItem("@CAPJu:user", JSON.stringify(user));

    return res;
  };

  function validateAuthentication() {
    const currentDate = new Date();
    const localStorageUser = localStorage.getItem("@CAPJu:user");

    if (!localStorageUser) {
      setUser(null);
      return;
    }

    if (
      !JSON.parse(localStorageUser)?.expiresIn ||
      new Date(JSON.parse(localStorageUser)?.expiresIn) < currentDate
    ) {
      setUser(null);
      return;
    }

    setUser(JSON.parse(localStorageUser));
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
