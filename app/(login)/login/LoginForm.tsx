"use client";
import apiClient from "@/config/apiClient";
import { AuthContext } from "@/context/auth/AuthContex";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";

export const LoginForm = () => {
  const { auth, loading, loginUser } = useContext(AuthContext);
  const router = useRouter();

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
    try {
      const res = await apiClient.post("/auth/login", formData);
      if (res.status === 201) {
        loginUser(res.data.access_token);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    postLogin(form);
  };

  useEffect(() => {
    if (auth.authenticated) {
      router.push("/");
    }
  }, [auth.authenticated]);

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="w-1/3 flex flex-col p-5 gap-5 border border-gray-200 rounded-lg"
    >
      <div className="flex flex-col gap-1">
        <img
          className="m-auto"
          width={100}
          height={100}
          src="https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg"
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
          value={form.username}
          onChange={handleChange}
          className="border py-2 rounded-lg"
          type="text"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor="">
          Contraseña
        </label>
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          className="border py-2 rounded-lg"
          type="password"
        />
      </div>
      <div className="flex flex-col gap-2">
        <input
          className="bg-black mx-auto rounded-lg text-white py-2 px-7"
          type="submit"
          value={"Iniciar Sesión"}
        />
      </div>
    </form>
  );
};
