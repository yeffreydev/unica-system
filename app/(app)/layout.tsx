"use client";
import Link from "next/link";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Nav";
import {  User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext } from "react";
import { AuthContext } from "@/context/auth/AuthContex";


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const{logout} = useContext(AuthContext)







  return (
    <div className="flex flex-col w-screen h-screen">
      {/* top bar */}
      <div className="flex w-full items-center gap-2">
        <div className="w-full bg-primary y dark:bg-background backdrop-blur flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center">
            <Link href="/">
              <img src="/aquinace-light.svg" alt="Aquinace" className="h-8 w-8" />
            </Link>
            <div className="h-8 w-[2px] bg-gray-400 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/10 text-white font-medium text-sm border border-white/20 hover:bg-white/15 transition-colors">
                Montes y Vegas
              </div>
              <div className="px-2 py-0.5 rounded bg-white/10 text-white/90 text-xs font-medium">
                32 miembros
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-white">
              <ThemeToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-y-auto">
        <aside className="w-1/5 px-4 pt-4 border-r dark:border-gray-700">
          <AppSidebar />
        </aside>
        <div className="w-4/5">
          <div className="overflow-auto h-full w-full flex-1 px-2 md:px-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
