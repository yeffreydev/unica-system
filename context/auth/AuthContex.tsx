"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
import apiClient from "@/config/apiClient";
import { useRouter, usePathname } from "next/navigation";

interface AuthState {
  token: string | null;
  authenticated: boolean;
}

interface AuthContextType {
  loginUser: (token: string) => void;
  logout: () => void;
  auth: AuthState;
  loading: boolean;
}

const initialState: AuthContextType = {
  loginUser: () => {},
  logout: () => {},
  auth: {
    token: null,
    authenticated: false,
  },
  loading: true,
};

export const AuthContext = createContext<AuthContextType>(initialState);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState>(initialState.auth);
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem("auth");
    apiClient.defaults.headers.common["Authorization"] = "";

    setAuth({
      token: null,
      authenticated: false,
    });
    router.push("/login");
  };

  const loginUser = (token: string) => {
    localStorage.setItem("auth", JSON.stringify({ token }));
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setAuth({
      token,
      authenticated: true,
    });
  };

  const loadToken = () => {
    const authData = localStorage.getItem("auth") as string;
    const token = authData ? JSON.parse(authData).token : null;
    
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Simple 401/403 interceptor - just logout on auth errors
      apiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.error("Token inválido o expirado, cerrando sesión...");
            logout();
          }
          return Promise.reject(error);
        }
      );
      
      setAuth({
        token,
        authenticated: true,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("Auth state changed:", auth);
    if (!loading && !auth.authenticated && pathname !== '/login') {
      router.push('/login');
    }
    console.log('path name', pathname);
    if (!loading && auth.authenticated && pathname.startsWith('/login')) {
      router.push('/');
    }
  }, [loading, auth.authenticated, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        loginUser,
        logout,
        auth,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

