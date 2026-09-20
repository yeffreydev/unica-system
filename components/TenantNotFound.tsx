"use client";
import { useState } from "react";
import { ArrowRight, Globe, RefreshCw, SearchX, WifiOff } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const PANEL_URL = "https://app.aquinace.com";
const LANDING_URL = "https://aquinace.com";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-24 w-[460px] h-[460px] rounded-full bg-primary/5 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--primary) / 0.18) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <a href={LANDING_URL} className="flex items-center hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aquinace.svg" alt="Aquí Nace" className="h-8 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aquinace-light.svg" alt="Aquí Nace" className="h-8 w-auto hidden dark:block" />
        </a>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 pb-16">
        {children}
      </main>

      <footer className="relative z-10 text-center pb-6 text-xs text-muted-foreground/70">
        &copy; {new Date().getFullYear()} Aquí Nace
      </footer>
    </div>
  );
}

function DomainChip({ code }: { code: string }) {
  if (!code) return null;
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm shadow-sm">
      <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="font-mono text-foreground truncate">{code}</span>
    </div>
  );
}

interface Props {
  code: string;
  onRetry: () => Promise<void> | void;
}

/** 404 del dominio: nadie registró una asociación con este subdominio. */
export function TenantNotFound({ code, onRetry }: Props) {
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    try {
      await onRetry();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame>
      <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mx-auto mb-7 relative h-24 w-24">
          <div className="absolute inset-0 rounded-[28px] bg-primary/10 rotate-6" />
          <div className="absolute inset-0 rounded-[28px] bg-card border border-border shadow-lg flex items-center justify-center">
            <SearchX className="h-11 w-11 text-primary" strokeWidth={1.6} />
          </div>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">
          Asociación no encontrada
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.1]">
          Aquí todavía no nace ninguna comunidad
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          No hay ninguna asociación registrada en este dominio. Revisa que la
          dirección esté bien escrita o crea tu comunidad desde el panel.
        </p>

        <div className="mt-6 flex justify-center">
          <DomainChip code={code} />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={PANEL_URL}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-semibold px-6 py-3 shadow-lg shadow-primary/20 transition-all"
          >
            Crear mi asociación
            <ArrowRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={retry}
            disabled={busy}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-medium px-6 py-3 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Volver a intentar
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {[
            { n: "1", t: "Entra al panel", d: "Con tu cuenta de Google o correo." },
            { n: "2", t: "Registra tu asociación", d: "Elige el nombre y el dominio." },
            { n: "3", t: "Configúrala en minutos", d: "Socios, acciones y reuniones." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur px-4 py-3.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                {s.n}
              </span>
              <p className="mt-2 text-sm font-semibold text-foreground">{s.t}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/** El servidor no respondió: red caída o mantenimiento. */
export function TenantUnreachable({ code, onRetry }: Props) {
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    try {
      await onRetry();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame>
      <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mx-auto mb-7 h-20 w-20 rounded-[24px] bg-card border border-border shadow-lg flex items-center justify-center">
          <WifiOff className="h-9 w-9 text-amber-500" strokeWidth={1.7} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400 mb-3">
          Sin conexión con el servidor
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          No pudimos conectarnos
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Revisa tu internet o inténtalo en unos segundos. Tus datos están a
          salvo; solo no llegamos al servidor.
        </p>
        <div className="mt-6 flex justify-center">
          <DomainChip code={code} />
        </div>
        <button
          type="button"
          onClick={retry}
          disabled={busy}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-semibold px-6 py-3 shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
        >
          <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Reintentar
        </button>
      </div>
    </Frame>
  );
}
