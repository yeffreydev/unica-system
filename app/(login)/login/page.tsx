"use client";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Intro Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle gradient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-primary/3 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          <img
            src="/aquinace.svg"
            alt="Aqui Nace Logo"
            className="w-20 h-20 mb-8 hover:scale-105 transition-transform duration-500 dark:hidden"
          />
          <img
            src="/aquinace-light.svg"
            alt="Aqui Nace Logo"
            className="w-20 h-20 mb-8 hover:scale-105 transition-transform duration-500 hidden dark:block"
          />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-10 leading-tight">
            Gestiona los fondos de tu Asociación con <span className="text-primary">una sola herramienta</span>
          </h1>

          {/* Illustration */}
          <svg
            viewBox="0 0 320 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-sm h-auto text-primary"
            role="img"
            aria-label="Gestión de fondos"
          >
            {/* panel */}
            <rect x="40" y="70" width="240" height="150" rx="16" className="fill-primary/5 stroke-primary/20" strokeWidth="2" />
            <line x1="40" y1="100" x2="280" y2="100" className="stroke-primary/15" strokeWidth="2" />
            <circle cx="58" cy="85" r="4" className="fill-primary/40" />
            <circle cx="72" cy="85" r="4" className="fill-primary/25" />
            <circle cx="86" cy="85" r="4" className="fill-primary/15" />

            {/* growth bars */}
            <rect x="66" y="170" width="26" height="38" rx="5" className="fill-primary/30" />
            <rect x="104" y="148" width="26" height="60" rx="5" className="fill-primary/50" />
            <rect x="142" y="124" width="26" height="84" rx="5" className="fill-primary/70" />
            <rect x="180" y="150" width="26" height="58" rx="5" className="fill-primary/50" />

            {/* trend line */}
            <path d="M70 165 L117 142 L155 118 L255 128" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="255" cy="128" r="5" className="fill-primary" />

            {/* coin */}
            <circle cx="248" cy="66" r="34" className="fill-primary stroke-background" strokeWidth="4" />
            <text x="248" y="78" textAnchor="middle" className="fill-[hsl(var(--primary-foreground))]" fontSize="24" fontWeight="700" fontFamily="system-ui, sans-serif">S/</text>
          </svg>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-card border-l border-border/30">
        <div className="w-full max-w-sm flex flex-col">
          <div className="mb-8 lg:hidden flex justify-center">
              <img src="/aquinace.svg" alt="Aqui Nace Logo" className="w-14 h-14 dark:hidden" />
              <img src="/aquinace-light.svg" alt="Aqui Nace Logo" className="w-14 h-14 hidden dark:block" />
          </div>
          <LoginForm />

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
