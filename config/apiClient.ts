import axios from "axios";
import appConfig from "./config";

/**
 * Resolve the tenant code:
 * - dev (NODE_ENV !== production): use NEXT_PUBLIC_DEV_TENANT_CODE
 * - prod: use the current hostname (e.g. mre.aquinace.com)
 */
export function getTenantCode(): string {
  if (process.env.NODE_ENV !== "production" && appConfig.devTenantCode) {
    return appConfig.devTenantCode;
  }
  if (typeof window === "undefined") return appConfig.devTenantCode ?? "";
  return window.location.hostname;
}

/** @deprecated Use getTenantCode() */
export const getTenantId = getTenantCode;

const apiClient = axios.create({
  baseURL: `${appConfig.apiHost}`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const code = getTenantCode();
  config.headers["X-Tenant-Code"] = code;
  config.headers["X-Tenant-ID"] = code;
  return config;
});

export default apiClient;
