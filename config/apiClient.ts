import axios from "axios";
import appConfig from "./config";

export function getTenantId(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname;
}

const apiClient = axios.create({
  baseURL: `${appConfig.apiHost}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor que agrega X-Tenant-ID desde el hostname actual
apiClient.interceptors.request.use((config) => {
  config.headers["X-Tenant-ID"] = getTenantId();
  return config;
});

export default apiClient;
