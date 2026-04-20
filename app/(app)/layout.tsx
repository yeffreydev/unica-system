"use client";
import Link from "next/link";
import { AppSidebar } from "@/components/Nav";
import { User, LogOut, Users } from "lucide-react";
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
import { AppContext } from "@/context/AppContext";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { logout } = useContext(AuthContext);
  const { bank, users } = useContext(AppContext);

  return (
    <div className="flex flex-col w-screen h-screen bg-background overflow-hidden">
      {/* top bar */}
      <header className="z-20 w-full bg-white dark:bg-card border-b border-border/60 dark:border-border/40">
        <div className="flex w-full items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/qipi.svg" alt="Qipi" className="h-7 w-7 dark:hidden" />
              <img src="/qipi-light.svg" alt="Qipi" className="h-7 w-7 hidden dark:block" />
              <span className="font-bold text-base tracking-tight text-foreground hidden sm:inline">Qipi</span>
            </Link>

            <div className="h-4 w-px bg-border"></div>

            <div className="flex items-center gap-2.5">
              <span className="font-medium text-sm text-muted-foreground">
                {bank?.bank?.name || "Plataforma"}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[11px] font-medium">
                <Users className="h-3 w-3" />
                {users.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 mt-1.5 rounded-lg shadow-lg border-border/60">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-sm font-semibold text-foreground">Mi Cuenta</p>
                </div>
                <DropdownMenuItem className="cursor-pointer py-2 rounded-md mx-1 mt-1 text-sm">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer py-2 rounded-md mx-1 mb-1 text-sm text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex flex-col w-[250px] border-r border-border/50 bg-white dark:bg-card pt-4 px-3 overflow-y-auto">
          <AppSidebar />
        </aside>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto py-8 px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
