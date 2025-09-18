"use client";
import Link from "next/link";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Nav";
import {  User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
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

const topData = [
  {
    path: "/",
    title: "Dashboard",
    description: "Resumen de la Asociación.",
  },
  {
    path: "/chat",
    title: "Chat",
    description: "Chat con el asistente Puki.",
  },
  {
    path: "/assembly",
    title: "Asamblea",
    description: "Administra las asambleas de la Asociación.",
  },
  {
    path: "/users",
    title: "Usuarios",
    description: "Administra los usuarios de la aplicación.",
  },
  {
    path: "/incomes/deposits",
    title: "Depósitos",
    description: "Administra los depósitos de los socios.",
  },
  {
    path: "/incomes/stocks",
    title: "Acciones",
    description: "Administra las acciones de los socios.",
  },
  {
    path: "/incomes/payments",
    title: "Pagos e intereses",
    description: "Administra los pagos e intereses de los socios.",
  },
  {
    path: "/incomes/legal-and-social",
    title: "fondos legales y sociales",
    description: "Administra los fondos legales y sociales de los socios.",
  },
  {
    path: "/incomes/others",
    title: "Otros ingresos",
    description: "Administra otros ingresos de los socios.",
  },
  {
    path: "/expenses/withdrawls",
    title: "Retiros",
    description: "Administra los retiros de los socios.",
  },
  {
    path: "/expenses/loans",
    title: "Préstamos",
    description: "Administra los préstamos de los socios.",
  },
  {
    path: "/expenses/interest",
    title: "Intereses",
    description: "Administra los intereses pagados a los ahorristas.",
  },
  {
    path: "/expenses/administrative",
    title: "Gastos administrativos",
    description: "Administra los gastos administrativos de la asociación.",
  },
  {
    path: "/expenses/dividends",
    title: "Utilidades distribuidas",
    description: "Administra las utilidades distribuidadas a los socios.",
  },
  {
    path: "/expenses/legal-and-social",
    title: "Fondos legales y sociales",
    description:
      "Administra los egresos de fondos legales y sociales de la asociación.",
  },
  {
    path: "/expenses/others",
    title: "Otros egresos",
    description: "Administra otros egresos de la asociación.",
  },
  {
    path: "/reports/acc-loans",
    title: "Reporte de préstamos",
    description: "Visualiza el reporte de préstamos acumulados de cada socio.",
  },
  {
    path: "/reports/dividends",
    title: "Reporte de utilidades",
    description:
      "Visualiza el reporte de utilidades distribuidas a los socios.",
  },
  {
    path: "/reports/incomes",
    title: "Reporte de ingresos",
    description: "Visualiza el reporte de ingresos de la asociación.",
  },
  {
    path: "/reports/expenses",
    title: "Reporte de egresos",
    description: "Visualiza el reporte de egresos de la asociación.",
  },
  {
    path: "/reports/cash-count",
    title: "Arqueo de caja",
    description: "Visualiza el conteo de caja de la asociación.",
  },
  {
    path: "/requests",
    title: "Solicitudes",
    description: "Administra las solicitudes de los socios.",
  },
  {
    path: "/docs",
    title: "Documentos",
    description: "Administra los documentos de la asociación.",
  },
  {
    path: "/attendance",
    title: "Asistencia",
    description: "Administra la asistencia de los socios.",
  },
  {
    path: "/settings",
    title: "Configuración - Perfil",
    description: "Configura la información y preferencias de tu perfil.",
  },

  {
    path: "/settings/platform",
    title: "Configuración - Plataforma",
    description: "Configura la plataforma de la aplicación.",
  },
];
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const{logout} = useContext(AuthContext)



  console.log("pathname", pathname);
  console.log("topData", topData);
  let currentData = topData.find((item) => item.path === pathname);
  console.log("currentData", currentData);
  if (!currentData) {
    currentData = {
      path: "unknown",
      title: "no encontrado",
      description: "Ruta no encontrada",
    };
  }




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
        <div className="flex-1">
          <div className="overflow-y-auto h-full w-full flex-1 px-2 md:px-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
