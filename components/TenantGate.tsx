"use client";
import { ReactNode } from "react";
import { useTenant } from "@/context/TenantContext";
import { TenantNotFound, TenantUnreachable } from "./TenantNotFound";

/** Pantalla de carga mínima mientras se resuelve el dominio. */
function Resolving() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/aquinace.svg" alt="Aquí Nace" className="h-9 w-auto dark:hidden animate-pulse" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/aquinace-light.svg" alt="Aquí Nace" className="h-9 w-auto hidden dark:block animate-pulse" />
      <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/2 rounded-full bg-primary animate-[slide_1.1s_ease-in-out_infinite]" />
      </div>
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Solo deja pasar a la app cuando el dominio tiene una asociación. Si no la
 * tiene, muestra el error bonito y nada más: ni login ni menús.
 */
export function TenantGate({ children }: { children: ReactNode }) {
  const { status, code, refresh } = useTenant();

  if (status === "loading") return <Resolving />;
  if (status === "missing") return <TenantNotFound code={code} onRetry={refresh} />;
  if (status === "unreachable") return <TenantUnreachable code={code} onRetry={refresh} />;
  return <>{children}</>;
}
