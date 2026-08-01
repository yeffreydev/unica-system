"use client";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/auth/AuthContex";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { AssemblyProvider } from "@/app/(app)/assembly/AssemblyContext";
import { Toaster } from "sileo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <title>Aqui Nace</title>
        <meta name="description" content="Aqui Nace - Sistema de Gestión" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={true}
          storageKey="unica-theme"
        >
          <ThemeContextProvider>
            <AuthProvider>
              <AppProvider>
                <AssemblyProvider>
                  {children}
                  <Toaster position="bottom-right" />
                </AssemblyProvider>
              </AppProvider>
            </AuthProvider>
          </ThemeContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
