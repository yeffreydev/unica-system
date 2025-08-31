"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Settings,
  User,
  BookText,
  ChartNoAxesCombined,
  ChartNoAxesColumnDecreasing,
  ChartPie,
  FileText,
  Clock,
  Wallet,
  MessageCircle,

} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { NavUser } from "@/components/NavUser";
import NavHeader from "./NavHeader";


const customNavClass =
  "hover:bg-[rgba(20,87,80,0.12)] focus:bg-[rgba(20,87,80,0.18)] data-[active=true]:bg-[rgba(20,87,80,0.18)] data-[state=open]:bg-[rgba(20,87,80,0.18)]";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="bg-sidebar">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        {/* Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/")}
                  className={customNavClass}
                >
                  <Link href={"/"}>
                    <ChartPie />
                    <span>{"Dashboard"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/chat")}
                  className={customNavClass}
                >
                  <Link href={"/chat"}>
                    <MessageCircle />
                    <span>{"Puki Chat"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/assembly")}
                  className={customNavClass}
                >
                  <Link href="/assembly">
                    <ChartNoAxesColumnDecreasing />
                    <span>{"Asamblea"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Otros */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={customNavClass}>
                              <SidebarGroupLabel>Otros...</SidebarGroupLabel> 

                   
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      title="Ingresos"
                      isActive={isActive("/incomes")}
                      className={customNavClass}
                    >
                      <ChartNoAxesCombined />
                      <span>Ingresos</span>
                      <span className="ml-auto">
                        <svg
                          className="w-4 h-4 transition-transform transform group-open/collapsible:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/incomes/deposits")}
                          className={customNavClass}
                        >
                          <Link href={"/incomes/deposits"}>Depositos</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/incomes/stocks")}
                          className={customNavClass}
                        >
                          <Link href={"/incomes/stocks"}>Acciones</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/incomes/payments")}
                          className={customNavClass}
                        >
                          <Link href={"/incomes/payments"}>
                            Pagos e Intereses
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/incomes/legal-and-social")}
                          className={customNavClass}
                        >
                          <Link href={"/incomes/legal-and-social"}>
                            Fondo Social Reserva Legal
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/incomes/others")}
                          className={customNavClass}
                        >
                          <Link href={"/incomes/others"}>Otros Ingresos</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      title="Egresos"
                      isActive={isActive("/expenses")}
                      className={customNavClass}
                    >
                      <ChartNoAxesColumnDecreasing />
                      <span>Egresos</span>
                      <span className="ml-auto">
                        <svg
                          className="w-4 h-4 transition-transform transform group-open/collapsible:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/expenses/withdrawls")}
                          className={customNavClass}
                        >
                          <Link href={"/expenses/withdrawls"}>Retiros</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/expenses/loans")}
                          className={customNavClass}
                        >
                          <Link href={"/expenses/loans"}>Prestamos</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/expenses/interest")}
                          className={customNavClass}
                        >
                          <Link href={"/expenses/interest"}>
                            Intereses Pagados
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/expenses/administrative")}
                          className={customNavClass}
                        >
                          <Link href={"/expenses/administrative"}>
                            Gastos Administrativos
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/expenses/dividends")}
                          className={customNavClass}
                        >
                          <Link href={"/expenses/dividends"}>
                            Utilidades Distribuidas
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/expenses/legal-and-social")}
                          className={customNavClass}
                        >
                          <Link href={"/expenses/legal-and-social"}>
                            Reserva Legal y Fondo Social
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/expenses/others")}
                          className={customNavClass}
                        >
                          <Link href={"/expenses/others"}>Otros</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      title="Reportes"
                      isActive={isActive("/reports")}
                      className={customNavClass}
                    >
                      <FileText />
                      <span>Reportes</span>
                      <span className="ml-auto">
                        <svg
                          className="w-4 h-4 transition-transform transform group-open/collapsible:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/reports/acc-loans")}
                          className={customNavClass}
                        >
                          <Link href={"/reports/acc-loans"}>
                            Prestamos Acumulados
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/reports/dividends")}
                          className={customNavClass}
                        >
                          <Link href={"/reports/dividends"}>
                            Reporte de Utilidades
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/reports/incomes")}
                          className={customNavClass}
                        >
                          <Link href={"/reports/incomes"}>
                            reporte de ingresos
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/reports/expenses")}
                          className={customNavClass}
                        >
                          <Link href={"/reports/expenses"}>
                            reporte de egresos
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/reports/cash-count")}
                          className={customNavClass}
                        >
                          <Link href={"/reports/cash-count"}>Arqueo de Caja</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem className="hidden">
                <SidebarMenuButton asChild>
                  <Link href={"/wallet"}>
                    <Wallet />
                    <span>{"Mi Wallet"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Sección Otros */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/docs")}
                  className={customNavClass}
                >
                  <Link href={"/docs"}>
                    <BookText />
                    <span>{"Documentos"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/attendance")}
                  className={customNavClass}
                >
                  <Link href={"/attendance"}>
                    <Clock />
                    <span>{"Asistencia"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/users")}
                  className={customNavClass}
                >
                  <Link href={"/users"}>
                    <User />
                    <span>{"Usuarios"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/settings")}
                  className={customNavClass}
                >
                  <Link href={"/settings"}>
                    <Settings />
                    <span>{"Ajustes"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar">
        <NavUser
          user={{
            name: "Yeffrey",
            avatar: "/avatar-plahceholder.png",
            email: "example@email.com",
          }}
        />
      </SidebarFooter>
    </Sidebar>
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
