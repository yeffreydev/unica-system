"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, Users, TrendingUp, Banknote, BarChart3, Receipt, PiggyBank, Plus, TrendingDown, ArrowDown, HandCoins, Building, Share2, Shield, Minus, FileBarChart, Settings, ClipboardCheck, Wallet, FileSpreadsheet } from "lucide-react";
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
  { title: "Asistencia", href: "/reports/attendance", icon: ClipboardCheck },
  { title: "Ahorros", href: "/reports/savings", icon: PiggyBank },
  { title: "Prestamos", href: "/reports/loans", icon: HandCoins },
  { title: "Acciones", href: "/reports/stocks", icon: BarChart3 },
  { title: "Otros Movimientos", href: "/reports/other-movements", icon: FileSpreadsheet },
  { title: "Utilidades", href: "/reports/dividends", icon: Wallet },
  { title: "Ingresos", href: "/reports/incomes", icon: TrendingUp },
  { title: "Egresos", href: "/reports/expenses", icon: TrendingDown },
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

  const customNavClass = "flex items-center px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 group mb-0.5";
  const activeClass = "bg-primary text-primary-foreground";
  const inactiveClass = "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

  return (
    <nav className="flex flex-col space-y-1">
      {mainItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            customNavClass,
            isActive(item.href) ? activeClass : inactiveClass
          )}
        >
          <item.icon className={cn("mr-2.5 h-4 w-4", isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground/60 group-hover:text-accent-foreground")} />
          {item.title}
        </Link>
      ))}

      <div className="pt-4">
        <div className="px-3 mb-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Finanzas</p>
        </div>
        
        {/* Ingresos Sections */}
        <div className="mb-2">
          <button
            onClick={() => setIncomesOpen(!incomesOpen)}
            className={cn(
              customNavClass,
              "w-full justify-between",
              incomesOpen ? "text-foreground bg-accent" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center">
              <TrendingUp className="mr-2.5 h-4 w-4" />
              <span>Ingresos</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", incomesOpen ? "rotate-180" : "")} />
          </button>
          
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out pl-4",
            incomesOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
          )}>
            {incomesItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all mb-0.5",
                  isActive(item.href) ? "text-primary font-semibold bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <item.icon className="mr-2 h-3.5 w-3.5" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Egresos Section */}
        <div className="mb-2">
          <button
            onClick={() => setExpensesOpen(!expensesOpen)}
            className={cn(
              customNavClass,
              "w-full justify-between",
              expensesOpen ? "text-foreground bg-accent" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center">
              <TrendingDown className="mr-2.5 h-4 w-4" />
              <span>Egresos</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", expensesOpen ? "rotate-180" : "")} />
          </button>
          
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out pl-4",
            expensesOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
          )}>
            {expensesItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all mb-0.5",
                  isActive(item.href) ? "text-primary font-semibold bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <item.icon className="mr-2 h-3.5 w-3.5" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Reportes Section */}
        <div className="mb-2">
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className={cn(
              customNavClass,
              "w-full justify-between",
              reportsOpen ? "text-foreground bg-accent" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center">
              <FileBarChart className="mr-2.5 h-4 w-4" />
              <span>Reportes</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", reportsOpen ? "rotate-180" : "")} />
          </button>
          
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out pl-4",
            reportsOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
          )}>
            {reportsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all mb-0.5",
                  isActive(item.href) ? "text-primary font-semibold bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <item.icon className="mr-2 h-3.5 w-3.5" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 mt-1 border-t border-border/40">
        <div className="px-3 mb-1.5 mt-2">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Sistema</p>
        </div>
        {otherItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              customNavClass,
              isActive(item.href) ? activeClass : inactiveClass
            )}
          >
            <item.icon className={cn("mr-2.5 h-4 w-4", isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground/60 group-hover:text-accent-foreground")} />
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function Nav() {
  return (
    <div className="flex flex-col h-full">
      <AppSidebar />
    </div>
  );
}