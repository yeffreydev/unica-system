"use client";
import { AuthContext } from "@/context/auth/AuthContex";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useContext, useState } from "react";

export const LoginForm = () => {
  const { loginUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const postLogin = async (formData: {
    username: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/login", formData);
      console.log(res);
      if (res.data) {
        loginUser(res.data.accessToken);
        // Redirigir a la página de inicio
        router.push("/");
      }
    } catch (error) {
      setIsLoading(false);

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
      className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col p-5 gap-5 border border-gray-200 rounded-lg mx-auto"
    >
      <div className="flex flex-col gap-1">
        <img
          className="m-auto"
          width={100}
          height={100}
          src={process.env.NEXT_PUBLIC_API_HOST + "/files/logo"}
          alt="logo"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="m-auto" htmlFor="">
          Iniciar Sesión
        </label>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">DNI</label>
        <input
          name="username"
          cy-data="username"
          value={form.username}
          onChange={handleChange}
          className="border py-2 px-3 rounded-lg"
          type="text"
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor="">
          Contraseña
        </label>
        <input
          name="password"
          cy-data="password"
          value={form.password}
          onChange={handleChange}
          className="border py-2 px-3 rounded-lg"
          type="password"
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-2">
        <button
          className="bg-black mx-auto cursor-pointer rounded-lg text-white py-2 px-7 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
