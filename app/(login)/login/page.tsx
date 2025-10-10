"use client";
import { LoginForm } from "./LoginForm";
import { useThemeHook } from "@/hooks/use-theme";

export default function LoginPage() {
  const { theme } = useThemeHook();
  const logoSrc = theme === 'dark' ? '/aquinace-light.svg' : '/aquinace.svg';

  return (
    <div className="w-screen h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Intro Section */}
      <div className="flex flex-col items-center justify-center p-8 bg-accent">
        <img
          src={logoSrc}
          alt="Sistema Unica Logo"
          className="w-32 h-32 mb-6"
          style={{ filter: 'invert(25%) sepia(75%) saturate(500%) hue-rotate(90deg) brightness(90%)' }}
        />
        <h1 className="text-3xl font-bold text-center mb-4 text-primary">
          Bienvenido a la Red Rural 
        </h1>
        <p className="text-center text-accent-foreground">
          Inicia sesión para acceder a tu cuenta y gestionar tus operaciones.
        </p>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center p-8 bg-background">
        <LoginForm />
      </div>
    </div>
  );
}
