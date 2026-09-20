"use client";

import { useState } from "react";
import { CloudOff, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSync } from "@/hooks/useSync";

function timeAgo(iso: string | null): string {
  if (!iso) return "nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

/**
 * Botón de sincronizar del header. Siempre se puede apretar — incluso sin
 * internet, donde sirve para ver qué quedó pendiente y reintentar.
 *
 * En el navegador no aparece: ahí no hay base local que sincronizar.
 */
export default function SyncButton() {
  const { desktop, status, syncing, lastResult, sync } = useSync();
  const [open, setOpen] = useState(false);

  if (!desktop) return null;

  const pending = status?.pending ?? 0;
  const failed = Boolean(status?.lastError);
  const offline = status ? !status.online : false;

  const label = syncing
    ? "Sincronizando..."
    : pending > 0
      ? `${pending} cambio${pending === 1 ? "" : "s"} sin subir`
      : offline || failed
        ? "Sin conexión"
        : "Todo sincronizado";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
          title={label}
          aria-label={label}
        >
          {offline || failed ? (
            <CloudOff className={cn("h-4 w-4", failed && "text-amber-500")} />
          ) : (
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          )}
          {pending > 0 && (
            <span className="rounded-full bg-amber-500/15 px-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              {pending}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 mt-1.5 rounded-lg shadow-lg border-border/60">
        <div className="px-3 py-2.5 border-b border-border/50">
          <p className="text-sm font-semibold text-foreground">Sincronización</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {status?.tenantCode ?? "Sin asociación enlazada"}
          </p>
        </div>

        <div className="px-3 py-2.5 space-y-1.5 text-xs">
          <Row label="Cambios sin subir" value={String(pending)} />
          <Row label="Última sincronización" value={timeAgo(status?.lastRunAt ?? null)} />
          <Row label="Últimos datos bajados" value={timeAgo(status?.lastPulledAt ?? null)} />
          {lastResult && (
            <Row
              label="Último ciclo"
              value={`${lastResult.pushed} subidos · ${lastResult.pulled} bajados`}
            />
          )}
        </div>

        {status?.lastError && (
          <div className="mx-3 mb-2 flex items-start gap-2 rounded-md bg-amber-500/10 px-2.5 py-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              {status.lastError}
            </p>
          </div>
        )}

        {!status?.lastError && !syncing && pending === 0 && (
          <div className="mx-3 mb-2 flex items-center gap-2 rounded-md bg-emerald-500/10 px-2.5 py-2">
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Todo lo de esta máquina ya está en la nube
            </p>
          </div>
        )}

        <DropdownMenuItem
          className="cursor-pointer py-2 mx-1 mb-1 rounded-md text-sm"
          onSelect={(e) => {
            e.preventDefault();
            void sync();
          }}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
          <span>{syncing ? "Sincronizando..." : "Sincronizar ahora"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer py-2 mx-1 mb-1 rounded-md text-sm text-muted-foreground"
          onSelect={(e) => {
            e.preventDefault();
            void sync({ full: true });
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Volver a bajar todo</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  );
}
