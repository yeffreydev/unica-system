import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.NEXT_PUBLIC_API_HOST) {
    return NextResponse.json(
      { error: "API host is not defined" },
      { status: 500 }
    );
  }
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_HOST + "/auth/refresh-token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }

  const { accessToken } = await res.json();

  const response = NextResponse.json({ ok: true, accessToken });

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 30, // 30 minutos
    path: "/",
    sameSite: "strict",
  });

  return response;
}
