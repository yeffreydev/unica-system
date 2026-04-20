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
        <title>Qipi</title>
        <meta name="description" content="Qipi - Sistema de Gestión" />
        <link rel="icon" href="/qipi.svg" />
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
