"use client";
import Link from "next/link";
import { useState } from "react";
import { AppSidebar } from "@/components/Nav";
import { User, LogOut, Users, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useContext } from "react";
import { AuthContext } from "@/context/auth/AuthContex";
import { AppContext } from "@/context/AppContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { logout } = useContext(AuthContext);
  const { bank, users } = useContext(AppContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col w-screen h-screen bg-background overflow-hidden">
      <header className="z-20 w-full bg-[hsl(var(--top-header-background))] text-[hsl(var(--top-header-foreground))] border-b border-border/60">
        <div className="flex w-full items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg lg:hidden text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <img src="/an-logo.svg" alt="Aqui Nace" className="h-9 w-auto dark:hidden" />
              <img src="/an-logo-light.svg" alt="Aqui Nace" className="h-9 w-auto hidden dark:block" />
            </Link>

            <div className="hidden sm:block h-4 w-px bg-border"></div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                {bank?.bank?.name || "Plataforma"}
              </span>
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[11px] font-medium shrink-0">
                <Users className="h-3 w-3" />
                {users.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
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
        <aside className="hidden lg:flex flex-col w-[250px] border-r border-border/50 bg-[hsl(var(--sidebar-background))] pt-4 px-3 overflow-y-auto">
          <AppSidebar />
        </aside>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-[280px] p-0 bg-[hsl(var(--sidebar-background))] border-border/50">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú</SheetTitle>
              <SheetDescription>Navegación principal</SheetDescription>
            </SheetHeader>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
              <img src="/an-logo.svg" alt="Aqui Nace" className="h-9 w-auto dark:hidden" />
              <img src="/an-logo-light.svg" alt="Aqui Nace" className="h-9 w-auto hidden dark:block" />
            </div>
            <div className="overflow-y-auto h-[calc(100%-56px)] px-3 pt-4 pb-6">
              <AppSidebar />
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-5 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
