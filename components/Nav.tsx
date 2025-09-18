"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Puki Chat", href: "/chat", icon: MessageCircle },
  { title: "Asamblea", href: "/assembly", icon: Users },
];

const otrosItems = [
  { title: "Depositos", href: "/incomes/deposits" },
  // { title: "Acciones", href: "/incomes/stocks" },
  // { title: "Pagos e Intereses", href: "/incomes/payments" },
  // { title: "Fondo Social Reserva Legal", href: "/incomes/legal-and-social" },
  // { title: "Otros Ingresos", href: "/incomes/others" },
  // { title: "Retiros", href: "/expenses/withdrawls" },
  // { title: "Prestamos", href: "/expenses/loans" },
  // { title: "Intereses Pagados", href: "/expenses/interest" },
  // { title: "Gastos Administrativos", href: "/expenses/administrative" },
  // { title: "Utilidades Distribuidas", href: "/expenses/dividends" },
  // { title: "Reserva Legal y Fondo Social", href: "/expenses/legal-and-social" },
  // { title: "Otros", href: "/expenses/others" },
  // { title: "Prestamos Acumulados", href: "/reports/acc-loans" },
  // { title: "Reporte de Utilidades", href: "/reports/dividends" },
  // { title: "reporte de ingresos", href: "/reports/incomes" },
  // { title: "reporte de egresos", href: "/reports/expenses" },
  // { title: "Arqueo de Caja", href: "/reports/cash-count" },
  // { title: "Documentos", href: "/docs" },
  // { title: "Asistencia", href: "/attendance" },
  // { title: "Usuarios", href: "/users" },
  // { title: "Ajustes", href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [otrosOpen, setOtrosOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const customNavClass = "px-2 py-1 text-sm font-medium text-muted-foreground rounded-md";

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {mainItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            customNavClass,
            isActive(item.href) ? "bg-primary/80 text-white" : "hover:bg-primary/70",
            "justify-start"
          )}
        >
         <div className="flex">
           <item.icon className="mr-2 h-4 w-4" />
          {item.title}
         </div>
        </Link>
      ))}
      <div>
        <button
          onClick={() => setOtrosOpen(!otrosOpen)}
          className={cn(
            customNavClass,
            "flex items-center justify-between w-full hover:bg-[#254b9122]"
          )}
        >
          <span>Otros</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", otrosOpen ? "rotate-180" : "")} />
        </button>
        {otrosOpen && (
          <div className="ml-4 space-y-1 mt-1">
            {otrosItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  customNavClass,
                  isActive(item.href) ? "bg-primary/80 text-white" : "hover:bg-primary/70",
                  "justify-start block"
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Nav() {
  return (
    <div>
      <ul className="pl-5 w-max">
        <li className="flex justify-center">
          <Link href={"/"}>
            <img
              className="w-[75px]"
              src="https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg"
              alt=""
            />
          </Link>
        </li>
      </ul>
    </div>
  );
}