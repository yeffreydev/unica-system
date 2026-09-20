"use client";
import Link from "next/link";
import { ShieldCheck, Users, WifiOff, LineChart } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTenant } from "@/context/TenantContext";

const FEATURES = [
  { icon: Users, t: "Socios y asambleas", d: "Asistencia, actas y acuerdos en un solo lugar." },
  { icon: LineChart, t: "Cuentas siempre cuadradas", d: "Acciones, préstamos, intereses y utilidades." },
  { icon: WifiOff, t: "Funciona sin internet", d: "Con la app de escritorio sigues trabajando y luego sincronizas." },
  { icon: ShieldCheck, t: "Cada asociación en su dominio", d: "Tus datos separados y protegidos." },
];

export default function LoginPage() {
  const { tenant, code } = useTenant();
  const displayName = tenant?.name?.trim() || code.split(".")[0] || "tu comunidad";

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Panel de marca */}
      <aside className="relative lg:flex-1 flex flex-col justify-between overflow-hidden bg-[hsl(var(--primary))] text-white px-7 py-7 sm:px-12 lg:px-14 lg:py-12 lg:min-h-screen">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-white/10 blur-[110px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[520px] h-[520px] rounded-full bg-black/20 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse at 30% 20%, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at 30% 20%, black 20%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aquinace.svg" alt="Aquí Nace" className="h-9 w-auto brightness-0 invert" />
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {code || "aquinace.com"}
          </span>
        </div>

        <div className="relative z-10 mt-10 lg:mt-0 max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Bienvenido</p>
          <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05]">
            {displayName}
          </h1>
          <p className="mt-4 hidden sm:block text-white/80 text-base sm:text-lg leading-relaxed">
            Tu herramienta para hacer crecer tu comunidad rotativa de créditos y
            ahorros. Ordenada, transparente y al alcance de todos los socios.
          </p>

          <ul className="mt-8 hidden lg:grid grid-cols-1 xl:grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <li key={f.t} className="flex items-start gap-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 px-4 py-3.5">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <f.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">{f.t}</p>
                  <p className="text-xs text-white/70 mt-0.5 leading-snug">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mt-10 lg:mt-0 hidden lg:flex items-center justify-between text-xs text-white/60">
          <span>&copy; {new Date().getFullYear()} Aquí Nace</span>
          <a href="https://aquinace.com" className="hover:text-white transition-colors">aquinace.com</a>
        </div>
      </aside>

      {/* Formulario */}
      <section className="flex-1 flex flex-col">
        <div className="flex justify-end px-5 sm:px-8 pt-4">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10 pb-12 pt-4 lg:pt-0">
          <div className="w-full max-w-[400px]">
            <LoginForm />

            <p className="mt-8 text-center text-sm text-muted-foreground">
              ¿Quieres crear tu propia asociación?{" "}
              <a
                href="https://app.aquinace.com"
                className="font-semibold text-primary hover:underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                Entra al panel
              </a>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground/70 lg:hidden">
              &copy; {new Date().getFullYear()} Aquí Nace
            </p>
            <Link href="/register" className="sr-only">Registro</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
