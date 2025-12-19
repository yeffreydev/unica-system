"use client";
import { AuthContext } from "@/context/auth/AuthContex";
import apiClient from "@/config/apiClient";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useContext, useState } from "react";

export const LoginForm = () => {
  const { loginUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const postLogin = async (formData: {
    username: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/auth/login", formData);
      console.log(res);
      if (res.data) {
        loginUser(res.data.accessToken);
        router.push("/");
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error
        ? error.message
        : "Error al iniciar sesión";
      setError(errorMessage);
      console.error(error);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    postLogin(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-8"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Iniciar Sesión
        </h2>
        <p className="text-muted-foreground">
          Ingresa tus credenciales para continuar.
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground/80 ml-1">
            DNI
          </label>
          <input
            name="username"
            cy-data="username"
            value={form.username}
            onChange={handleChange}
            placeholder="00000000"
            className="w-full border border-border bg-background hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 transition-all outline-none"
            type="text"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-foreground/80">
              Contraseña
            </label>
          </div>
          <input
            name="password"
            cy-data="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-border bg-background hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 transition-all outline-none"
            type="password"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
          {error}
        </div>
      )}

      <button
        className="bg-primary hover:bg-primary/90 active:scale-[0.98] w-full cursor-pointer rounded-xl text-primary-foreground py-3.5 font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Autenticando...</span>
          </>
        ) : (
          "Entrar al Sistema"
        )}
      </button>
    </form>
  );
};
