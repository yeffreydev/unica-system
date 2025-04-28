import { NextResponse } from "next/server";

import { cookies } from "next/headers";
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!token && !refreshToken) {
    return NextResponse.json({ error: "No hay token" }, { status: 401 });
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return NextResponse.json({ ok: true }, { status: 200 });
}
