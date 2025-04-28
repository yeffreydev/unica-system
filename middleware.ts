import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // return NextResponse.redirect(new URL("/login", request.url));

  console.log("Middleware ejecutado");
  const accessToken = request.cookies.get("accessToken");

  if (!accessToken && request.nextUrl.pathname === "/login") {
    // Si no hay accessToken y no estamos en la página de login
    return NextResponse.next();
  }

  if (accessToken && request.nextUrl.pathname === "/login") {
    // Si hay accessToken y estamos en la página de login
    // Redirigir a la página de inicio
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!accessToken) {
    const refreshToken = request.cookies.get("refreshToken");

    if (refreshToken) {
      // Intentar refresh
      const refreshRes = await fetch(`${request.nextUrl.origin}/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      });

      if (refreshRes.ok) {
        const response = NextResponse.next();

        // Copiar nueva cookie desde respuesta
        const newToken = await refreshRes.json();
        response.cookies.set("accessToken", newToken.accessToken);

        return response;
      }
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/"],
};
