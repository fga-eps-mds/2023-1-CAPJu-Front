import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";

import { signIn } from "services/user";

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  // eslint-disable-next-line no-unused-vars
  handleLogin: (credentials: { cpf: string; password: string }) => void;
  handleLogout: () => void;
};

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = useCallback(
    async (credentials: {
      cpf: string;
      password: string;
    }): Promise<Result<User>> => {
      const res = await signIn(credentials);

      if (res.type === "success") {
        localStorage.setItem("@CAPJu:user", JSON.stringify(res.value.data));
        setUser(res.value.data);
      }

      return res;
    },
    []
  );

  function handleLogout() {
    localStorage.removeItem("@CAPJu:user");
    setUser(null);
  }

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
