import axios from "axios";
import appConfig from "./config";
import { isDesktop, resolveApiHost } from "./runtime";

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

// En el escritorio la baseURL apunta al sidecar local (que trabaja sin
// internet); en el navegador, a la API en la nube.
const apiClient = axios.create({
  baseURL: resolveApiHost(appConfig.apiHost),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // La baseURL se resuelve en cada request: en el escritorio el sidecar puede
  // no estar listo cuando se crea el módulo.
  config.baseURL = resolveApiHost(appConfig.apiHost);

  // El sidecar tiene una sola asociación y la resuelve él mismo; mandarle un
  // código desde el front solo podría confundirlo.
  if (!isDesktop()) {
    const code = getTenantCode();
    config.headers["X-Tenant-Code"] = code;
    config.headers["X-Tenant-ID"] = code;
  }
  return config;
});

export default apiClient;
