import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

type User = {
  cpf: string;
  email: string;
  fullName: string;
  token: string;
  expiresIn: Date;
  idRole: number;
  idUnit: number;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  handleLogin: () => void;
  handleLogout: () => void;
};

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useState<User | null>(null);

  async function handleLogin() {
    return null;
  }

  async function handleLogout() {
    return null;
  }

  function validateAuthentication() {}

  useEffect(() => {
    validateAuthentication();

    setTimeout(() => {}, 500);
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
