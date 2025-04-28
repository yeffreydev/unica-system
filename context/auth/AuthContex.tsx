"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
import apiClient from "@/config/apiClient";
import { useRouter } from "next/navigation";
import axios from "axios";

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

  let failedQueue: FailedRequest[] = [];
  let isRefreshing = false;

  // Función para procesar la cola de solicitudes fallidas
  interface FailedRequest {
    resolve: (token: string | null) => void;
    reject: (error: any) => void;
  }

  async function refreshAccessToken() {
    try {
      const response = await axios.post("/api/refresh", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        body: JSON.stringify({}),
      });

      console.log("Token actualizado:", response.data);

      const { accessToken } = response.data;
      // Actualiza los tokens

      if (accessToken) {
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        localStorage.setItem("auth", JSON.stringify({ token: accessToken }));
      }
      return accessToken;
    } catch (error) {
      console.error("Error al refrescar el token:", error);
      throw error;
    }
  }
  const processQueue = (error: any, token: string | null = null): void => {
    failedQueue.forEach((prom: FailedRequest) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  const router = useRouter();
  const loadToken = () => {
    const auth = localStorage.getItem("auth") as string;
    const token = auth ? JSON.parse(auth).token : null;
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      apiClient.interceptors.response.use(
        (response) => response, // Respuesta exitosa, no hacer nada
        async (error) => {
          console.error("Error en la solicitud:", error);
          console.error("Error en la solicitud:", error.response.status);
          const originalRequest = error.config;

          // Verifica si el error es 401 y no se ha reintentado aún
          if (error.response?.status === 403 && !originalRequest._retry) {
            console.error("Token expirado, intentando refrescar...");
            if (isRefreshing) {
              // Si ya se está actualizando el token, agrega la solicitud a la cola
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              })
                .then((token) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  return apiClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
              console.log("Intentando refrescar el token..2.");
              // Intenta actualizar el token
              const newToken = await refreshAccessToken();

              // Actualiza el header de la solicitud original
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Procesa la cola de solicitudes fallidas con el nuevo token
              processQueue(null, newToken);

              // Reintenta la solicitud original
              return apiClient(originalRequest);
            } catch (refreshError) {
              // Si falla la actualización, limpia la cola y redirige al login
              processQueue(refreshError, null);
              console.error(
                "No se pudo actualizar el token, redirigiendo al login..."
              );
              // Ejemplo: window.location.href = '/login';
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }

          // Si no es un error 401 o no se puede manejar, rechaza el error
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

  const loginUser = (token: string) => {
    //save token on local storage
    localStorage.setItem("auth", JSON.stringify({ token }));
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setAuth({
      token,
      authenticated: true,
    });
  };

  const logout = async () => {
    localStorage.removeItem("auth");

    apiClient.defaults.headers.common["Authorization"] = "";

    await axios.post("/api/logout", {});

    setAuth({
      token: null,
      authenticated: false,
    });
    router.push("/login");
  };

  useEffect(() => {
    loadToken();
  }, []);

  // useEffect(() => {
  //   if (!loading) {
  //     if (!auth.authenticated && pathname !== "/login") {
  //       router.push("/login");
  //     } else if (auth.authenticated && pathname === "/login") {
  //       router.push("/");
  //     }
  //   }
  // }, [loading, auth.authenticated, pathname, router]);

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
