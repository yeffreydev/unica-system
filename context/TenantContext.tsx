"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import apiClient, { getTenantCode } from "@/config/apiClient";
import { isDesktop } from "@/config/runtime";

/** Lo que el servidor sabe de la asociación del dominio actual. */
export interface TenantInfo {
  code: string;
  name: string | null;
  onboardingCompleted: boolean;
}

export type TenantStatus =
  /** Consultando al servidor. */
  | "loading"
  /** El dominio tiene una asociación activa. */
  | "ready"
  /** El servidor respondió 404: nadie registró una asociación en este dominio. */
  | "missing"
  /** No se pudo hablar con el servidor (sin red, servidor caído). */
  | "unreachable";

interface TenantContextType {
  status: TenantStatus;
  tenant: TenantInfo | null;
  /** Dominio que se intentó resolver (para mostrarlo en el error). */
  code: string;
  /** Vuelve a consultar al servidor. */
  refresh: () => Promise<void>;
  /** Marca localmente el onboarding como terminado (después del POST). */
  markOnboarded: () => void;
}

export const TenantContext = createContext<TenantContextType>({
  status: "loading",
  tenant: null,
  code: "",
  refresh: async () => {},
  markOnboarded: () => {},
});

export const useTenant = () => useContext(TenantContext);

/**
 * Resuelve la asociación del dominio ANTES de pintar cualquier pantalla.
 *
 * En el navegador cada asociación vive en su propio subdominio
 * (`miunica.aquinace.com`); si ese dominio no tiene asociación, ninguna
 * pantalla tiene sentido y se muestra un error claro en vez de un login que
 * siempre falla. En el escritorio el sidecar tiene una sola asociación y no se
 * pregunta nada.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const desktop = isDesktop();
  const [status, setStatus] = useState<TenantStatus>(desktop ? "ready" : "loading");
  const [tenant, setTenant] = useState<TenantInfo | null>(
    desktop ? { code: "local", name: null, onboardingCompleted: true } : null,
  );
  const [code, setCode] = useState("");

  const refresh = useCallback(async () => {
    if (isDesktop()) return;
    const current = getTenantCode();
    setCode(current);
    setStatus("loading");
    try {
      const { data } = await apiClient.get<TenantInfo>("/tenants/current");
      setTenant(data);
      setStatus("ready");
    } catch (e) {
      if (!axios.isAxiosError(e) || !e.response) {
        setStatus("unreachable");
        return;
      }
      const body = e.response.data as { error?: string } | undefined;
      if (e.response.status === 404 && body?.error === "TENANT_NOT_FOUND") {
        setTenant(null);
        setStatus("missing");
        return;
      }
      // Cualquier otra respuesta (servidor viejo sin el endpoint, 500, etc.):
      // se deja pasar para no bloquear la app por un problema ajeno al dominio.
      setTenant(null);
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markOnboarded = useCallback(() => {
    setTenant((t) => (t ? { ...t, onboardingCompleted: true } : t));
  }, []);

  return (
    <TenantContext.Provider value={{ status, tenant, code, refresh, markOnboarded }}>
      {children}
    </TenantContext.Provider>
  );
}
