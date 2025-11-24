import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, Token } from "../api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    name: string,
    email: string | undefined,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount by calling /user endpoint
    const checkAuth = async () => {
      try {
        await api.getUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      await api.login({ username, password });
      // Cookie is set automatically by the server
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    username: string,
    name: string,
    email: string | undefined,
    password: string,
  ): Promise<void> => {
    try {
      await api.register({ username, name, email, password });
      // Cookie is set automatically by the server
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch (error) {
      // Even if logout fails, clear local state
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
