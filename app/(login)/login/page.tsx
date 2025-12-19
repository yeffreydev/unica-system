"use client";
import { LoginForm } from "./LoginForm";
import { useThemeHook } from "@/hooks/use-theme";

export default function LoginPage() {
  const { theme } = useThemeHook();
  const logoSrc = theme === "dark" ? "/qipi-light.svg" : "/qipi.svg";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Intro Section - Minimalist & Elegant */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-secondary/10 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          <img
            src={logoSrc}
            alt="Qipi Logo"
            className="w-24 h-24 mb-10 hover:scale-105 transition-transform duration-500"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            Gestión Inteligente para <span className="text-primary">tu Negocio</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Optimiza tus operaciones con la plataforma más elegante y eficiente del mercado.
          </p>
        </div>
      </div>

      {/* Form Section - Clean & Focused */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-background border-l border-border/50">
        <div className="w-full max-w-sm flex flex-col">
          <div className="mb-10 lg:hidden flex justify-center">
              <img src={logoSrc} alt="Qipi Logo" className="w-16 h-16" />
          </div>
          <LoginForm />
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Qipi. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
