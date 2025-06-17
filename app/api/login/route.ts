import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (!process.env.NEXT_PUBLIC_API_HOST) {
    return NextResponse.json(
      { error: "API host is not defined" },
      { status: 500 }
    );
  }

  console.log(body);

  const res = await fetch(process.env.NEXT_PUBLIC_API_HOST + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const data = await res.json();
  console.log("Respuesta de la API", data);
  const { accessToken, refreshToken } = data;
  console.log("Acceso concedido", accessToken, refreshToken);

  const response = NextResponse.json({ ok: true, accessToken });

  // Guardar accessToken y refreshToken como cookies seguras
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 30, // 30 minutos
    path: "/",
    sameSite: "strict",
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
    sameSite: "strict",
  });

  return response;
}
