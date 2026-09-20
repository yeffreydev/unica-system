"use client";

import Link from "next/link";
import { ArrowLeft, Coins, HandCoins, LineChart, Users } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

const STEPS = [
  { icon: Users, title: "Registra a tus socios", text: "Quiénes ahorran y participan en cada asamblea." },
  { icon: Coins, title: "Define las acciones", text: "Precio de la acción y aportes de cada socio." },
  { icon: HandCoins, title: "Presta y cobra", text: "Préstamos, intereses y multas siempre cuadrados." },
  { icon: LineChart, title: "Reparte utilidades", text: "Cierre de ciclo con actas y reportes automáticos." },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Intro */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-primary/3 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col max-w-md w-full">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aquinace.svg" alt="Aqui Nace" className="h-14 w-auto mb-3 dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aquinace-light.svg" alt="Aqui Nace" className="h-14 w-auto mb-3 hidden dark:block" />
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mt-3 mb-8 leading-tight text-center">
            Empieza a gestionar{" "}
            <span className="text-primary">tu comunidad rotativa de créditos y ahorros</span>
          </h1>

          <ol className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    <span className="text-muted-foreground mr-1.5 tabular-nums">{i + 1}.</span>
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-card border-l border-border/30">
        <div className="w-full max-w-sm flex flex-col py-6">
          <div className="mb-8 lg:hidden flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aquinace.svg" alt="Aqui Nace" className="h-10 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aquinace-light.svg" alt="Aqui Nace" className="h-10 w-auto hidden dark:block" />
          </div>

          <RegisterForm />

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} Aqui Nace. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
