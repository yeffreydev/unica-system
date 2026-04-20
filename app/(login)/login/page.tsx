"use client";
import { LoginForm } from "./LoginForm";
import { useThemeHook } from "@/hooks/use-theme";

export default function LoginPage() {
  const { theme } = useThemeHook();
  const logoSrc = theme === "dark" ? "/qipi-light.svg" : "/qipi.svg";

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
            src={logoSrc}
            alt="Qipi Logo"
            className="w-20 h-20 mb-8 hover:scale-105 transition-transform duration-500"
          />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            Gestión Inteligente para <span className="text-primary">tu Negocio</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Optimiza tus operaciones con la plataforma más elegante y eficiente del mercado.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-card border-l border-border/30">
        <div className="w-full max-w-sm flex flex-col">
          <div className="mb-8 lg:hidden flex justify-center">
              <img src={logoSrc} alt="Qipi Logo" className="w-14 h-14" />
          </div>
          <LoginForm />

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} Qipi. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
