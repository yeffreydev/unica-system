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
      className="w-full max-w-md flex flex-col gap-6 mx-auto"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-medium text-center text-muted-foreground">
          Iniciar Sesión
        </h2>
      </div>
      <div className="flex flex-col gap-1">
        <input
          name="username"
          cy-data="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Ingresa tu DNI"
          className="border-b-2 border-muted focus:border-primary py-3 px-0 bg-transparent text-foreground placeholder:text-muted-foreground transition-colors"
          type="text"
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-1">
        <input
          name="password"
          cy-data="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Ingresa tu contraseña"
          className="border-b-2 border-muted focus:border-primary py-3 px-0 bg-transparent text-foreground placeholder:text-muted-foreground transition-colors"
          type="password"
          disabled={isLoading}
        />
      </div>
      {error && (
        <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <button
          className="bg-primary hover:bg-primary/90 w-full cursor-pointer rounded-lg text-primary-foreground py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
              Iniciando...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </div>
    </form>
  );
};
