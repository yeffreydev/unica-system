"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "@/config/apiClient";
import { isDesktop } from "@/config/runtime";

export interface SyncStatus {
  mode: "local" | "cloud";
  /** Cambios hechos sin internet que todavía no subieron. */
  pending: number;
  lastRunAt: string | null;
  lastPulledAt: string | null;
  lastPushedAt: string | null;
  lastError: string | null;
  running: boolean;
  online: boolean;
  tenantCode: string | null;
}

export interface SyncRunResult {
  pushed: number;
  pulled: number;
  skipped: number;
  errors: number;
}

/** Cada cuánto se refresca el contador de pendientes. */
const STATUS_POLL_MS = 20_000;

/**
 * Estado de la sincronización de la instalación de escritorio.
 *
 * El trabajo pesado lo hace el sidecar: acá solo se consulta el estado, se
 * dispara la sincronización manual y se reintenta sola cuando el sistema
 * avisa que volvió la conexión.
 */
export function useSync() {
  const desktop = isDesktop();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncRunResult | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (!desktop) return null;
    try {
      const { data } = await apiClient.get<SyncStatus>("/sync/status");
      setStatus(data);
      return data;
    } catch {
      // El sidecar puede estar arrancando todavía.
      return null;
    }
  }, [desktop]);

  const sync = useCallback(
    async (options: { full?: boolean } = {}) => {
      if (!desktop || inFlight.current) return null;
      inFlight.current = true;
      setSyncing(true);
      try {
        const { data } = await apiClient.post<SyncRunResult>(
          `/sync/run${options.full ? "?full=true" : ""}`,
        );
        setLastResult(data);
        await refresh();
        return data;
      } catch {
        await refresh();
        return null;
      } finally {
        inFlight.current = false;
        setSyncing(false);
      }
    },
    [desktop, refresh],
  );

  useEffect(() => {
    if (!desktop) return;
    void refresh();
    const timer = setInterval(() => void refresh(), STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [desktop, refresh]);

  // Volvió el internet: se sincroniza sola, que es lo que espera quien estuvo
  // trabajando desconectado.
  useEffect(() => {
    if (!desktop) return;
    const onOnline = () => void sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [desktop, sync]);

  return { desktop, status, syncing, lastResult, sync, refresh };
}
