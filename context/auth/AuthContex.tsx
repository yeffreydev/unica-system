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
  const loadToken = () => {
    const auth = localStorage.getItem("auth") as string;
    const token = auth ? JSON.parse(auth).token : null;
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setAuth({
        token,
        authenticated: true,
      });
    }
    setLoading(false);
  };

  const loginUser = (token: string) => {
    //save token on local storage
    localStorage.setItem("auth", JSON.stringify({ token }));
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setAuth({
      token,
      authenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem("auth");
    apiClient.defaults.headers.common["Authorization"] = "";

    setAuth({
      token: null,
      authenticated: false,
    });
  };

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!auth.authenticated && pathname !== "/login") {
        router.push("/login");
      } else if (auth.authenticated && pathname === "/login") {
        router.push("/");
      }
    }
  }, [loading, auth.authenticated, pathname, router]);
  if (loading) {
    return null;
  }
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
