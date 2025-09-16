import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/auth/AuthContex";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { AssemblyProvider } from "@/app/(app)/assembly/AssemblyContext";

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

export const metadata: Metadata = {
  title: "Aqui Nace",
  description: "Aqui Nace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="icon"
          href={"/akinace.png"}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="unica-theme"
        >
          <ThemeContextProvider>
            <AssemblyProvider>
              <AuthProvider>
                <AppProvider>{children}</AppProvider>
              </AuthProvider>
            </AssemblyProvider>
          </ThemeContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
