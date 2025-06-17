"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Nav";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import path from "path";
import { title } from "process";

const topData = [
  {
    path: "/",
    title: "Dashboard",
    description: "Resumen de la Asociación.",
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
          <div className="flex">
            <SidebarTrigger className="w-max ml-2" />
            <div className="bg-white w-full flex items-center justify-between px-5 py-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-700">
                  {currentData.title}
                </h1>
                <p>
                  <span className="text-sm text-gray-500">
                    {currentData.description}
                  </span>
                </p>
              </div>
              <button className="bg-none cursor-pointer flex justify-center items-center relative  w-[40px] h-[40px] ">
                <Bell className="m-auto text-3xl" />
                <span className="bg-red-500 rounded-full w-[7px] h-[7px] absolute top-[5px] right-[7px] translate-x-1/2 translate-y-1/2"></span>
              </button>
            </div>
          </div>
          <div className="bg-[#F5F7FA] w-full flex-1 px-2 md:px-4">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
