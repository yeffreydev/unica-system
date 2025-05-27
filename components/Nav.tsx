"use cient";
import Link from "next/link";

import {
  Settings,
  User,
  BookText,
  ChartNoAxesCombined,
  ChartNoAxesColumnDecreasing,
  ChartPie,
  FileText,
  CheckSquare,
  Clock,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { NavUser } from "@/components/NavUser";
import NavHeader from "./NavHeader";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/"}>
                    <ChartPie />
                    <span>{"Dashboard"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton title="Ingresos">
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
                        <Link href={"/incomes/deposits"}>Depositos</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/incomes/stocks"}>Acciones</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/incomes/payments"}>
                          Pagos e Intereses
                        </Link>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <Link href={"/incomes/legal-and-social"}>
                          Fondo Social Reserva Legal
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/incomes/others"}>Otros Ingresos</Link>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton title="Egresos">
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
                        <Link href={"/expenses/withdrawls"}>Retiros</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/expenses/loans"}>Prestamos</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/expenses/interest"}>
                          Intereses Pagados
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/expenses/administrative"}>
                          Gastos Administrativos
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/expenses/dividends"}>
                          Utilidades Distribuidas
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/expenses/legal-and-social"}>
                          Reserva Legal y Fondo Social
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/expenses/others"}>Otros</Link>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton title="Reportes">
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
                        <Link href={"/reports/acc-loans"}>
                          Prestamos Acumulados
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/reports/dividends"}>
                          Reporte de Utilidades
                        </Link>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <Link href={"/reports/incomes"}>
                          reporte de ingresos
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/reports/expenses"}>
                          reporte de egresos
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href={"/reports/cash-count"}>Arqueo de Caja</Link>
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/requests"}>
                    <CheckSquare />
                    <span>{"Solicitudes"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/docs"}>
                    <BookText />
                    <span>{"Documentos"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/attendance"}>
                    <Clock />
                    <span>{"Asistencia"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/users"}>
                    <User />
                    <span>{"Usuarios"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/settings"}>
                    <Settings />
                    <span>{"Ajustes"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
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
