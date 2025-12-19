"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, MessageCircle, Users, TrendingUp, Banknote, BarChart3, Receipt, PiggyBank, Plus, TrendingDown, ArrowDown, HandCoins, Building, Share2, Shield, Minus, FileBarChart, Calculator, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  // { title: "Puki Chat", href: "/chat", icon: MessageCircle },
  { title: "Asamblea", href: "/assembly", icon: Users },
];

const incomesItems = [
    { title: "Depositos", href: "/incomes/deposits", icon: Banknote },
  { title: "Acciones", href: "/incomes/stocks", icon: BarChart3 },
  { title: "Pagos e Intereses", href: "/incomes/payments", icon: Receipt },
  { title: "Fondo Social Reserva Legal", href: "/incomes/social", icon: PiggyBank },
  { title: "Otros Ingresos", href: "/incomes/others", icon: Plus },

]
const expensesItems =[
  { title: "Retiros", href: "/expenses/withdrawls", icon: ArrowDown },
  { title: "Prestamos", href: "/expenses/loans", icon: HandCoins },
  { title: "Intereses Pagados", href: "/expenses/payouts", icon: Receipt },
  { title: "Gastos Administrativos", href: "/expenses/administrative", icon: Building },
  { title: "Utilidades Distribuidas", href: "/expenses/dividends", icon: Share2 },
  { title: "Reserva Legal y Fondo Social", href: "/expenses/social", icon: Shield },
  { title: "Otros", href: "/expenses/others", icon: Minus },
]

const reportsItems = [
  // { title: "Prestamos Acumulados", href: "/reports/acc-loans", icon: Calculator },
  { title: "Reporte de Utilidades", href: "/reports/dividends", icon: BarChart3 },
  { title: "reporte de ingresos", href: "/reports/incomes", icon: TrendingUp },
  { title: "reporte de egresos", href: "/reports/expenses", icon: TrendingDown },
  // { title: "Arqueos de Caja", href: "/reports/cash-count", icon: Wallet },
]

const otherItems = [
  // { title: "Documentos", href: "/docs" },
  // { title: "Asistencia", href: "/attendance" },
  { title: "Usuarios", href: "/users", icon: Users },
  { title: "Ajustes", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [incomesOpen, setIncomesOpen] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);
  

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
          onClick={() => setIncomesOpen(!incomesOpen)}
          className={cn(
            customNavClass,
            "flex items-center justify-between w-full hover:bg-[#254b9122]"
          )}
        >
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Ingresos</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", incomesOpen ? "rotate-180" : "")} />
        </button>
        {incomesOpen && (
          <div className="ml-4 space-y-1 mt-1">
            {incomesItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  customNavClass,
                  isActive(item.href) ? "bg-primary/80 text-white" : "hover:bg-primary/70",
                  "justify-start block"
                )}
              >
                <div className="flex">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div>
        <button
          onClick={() => setExpensesOpen(!expensesOpen)}
          className={cn(
            customNavClass,
            "flex items-center justify-between w-full hover:bg-[#254b9122]"
          )}
        >
          <div className="flex items-center">
            <TrendingDown className="mr-2 h-4 w-4" />
            <span>Egresos</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", expensesOpen ? "rotate-180" : "")} />
        </button>
        {expensesOpen && (
          <div className="ml-4 space-y-1 mt-1">
            {expensesItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  customNavClass,
                  isActive(item.href) ? "bg-primary/80 text-white" : "hover:bg-primary/70",
                  "justify-start block"
                )}
              >
                <div className="flex">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
      <div>
        <button
          onClick={() => setReportsOpen(!reportsOpen)}
          className={cn(
            customNavClass,
            "flex items-center justify-between w-full hover:bg-[#254b9122]"
          )}
        >
          <div className="flex items-center">
            <FileBarChart className="mr-2 h-4 w-4" />
            <span>Reportes</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", reportsOpen ? "rotate-180" : "")} />
        </button>
        {reportsOpen && (
          <div className="ml-4 space-y-1 mt-1">
            {reportsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  customNavClass,
                  isActive(item.href) ? "bg-primary/80 text-white" : "hover:bg-primary/70",
                  "justify-start block"
                )}
              >
                <div className="flex">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
       {otherItems.map((item) => (
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