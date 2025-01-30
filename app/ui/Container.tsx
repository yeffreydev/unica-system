import { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppSidebar } from "./Nav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function Container({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <div className="w-screen h-screen flex gap-5 pt-5">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex-1 px-5 mt-5">{children}</div>
      </SidebarProvider>
    </div>
  );
}
