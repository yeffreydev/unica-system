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
import { useThemeHook } from "@/hooks/use-theme";


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const { logout } = useContext(AuthContext);
  const { theme } = useThemeHook();







  return (
    <div className="flex flex-col w-screen h-screen bg-background overflow-hidden">
      {/* top bar */}
      <header className="z-20 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex w-full items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src={theme === 'dark' ? "/qipi-light.svg" : "/qipi.svg"} alt="Qipi" className="h-9 w-9" />
            </Link>
            
            <div className="h-6 w-[1px] bg-border mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-secondary/10 text-primary font-semibold text-sm border border-primary/20">
                Montes y Vegas
              </div>
              <div className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                32 MIEMBROS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden bg-muted hover:bg-muted/80">
                  <div className="flex items-center justify-center w-full h-full text-primary">
                    <User className="h-5 w-5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <div className="px-4 py-2 border-b border-border/50 mb-1">
                  <p className="text-sm font-medium">Mi Cuenta</p>
                </div>
                <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg mx-1">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer py-2.5 rounded-lg mx-1 text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex flex-col w-[280px] border-r border-border/50 bg-card/30 backdrop-blur-sm pt-6 px-4">
          <AppSidebar />
        </aside>
        
        <main className="flex-1 overflow-y-auto bg-background/50">
          <div className="container mx-auto py-8 px-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
