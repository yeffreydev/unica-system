"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Nav";
import { Bell,  } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full flex flex-col h-screen">

        {/* top bar   */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="w-max ml-2 text-muted-foreground hover:text-foreground" />
            <div className="w-full bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur border-b flex items-center justify-between px-4 md:px-6 py-3">
              <div className="min-w-0">
                <h1 className="text-2xl tracking-tight leading-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                  {currentData.title}
                </h1>
                <p className="mt-0.5 text-sm md:text-base text-muted-foreground/90 pl-3 border-l border-primary/20 truncate">
                  {currentData.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* <ThemeToggle /> */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell  className="text-muted-foreground" />
                  <span className="absolute top-2 right-2 inline-block w-2 h-2 rounded-full bg-primary"></span>
                </Button>
              </div>
            </div>
          </div>
           
        
          <div className="bg-muted/50 w-full flex-1 px-2 md:px-4">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
