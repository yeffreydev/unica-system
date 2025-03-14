import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Nav";
import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <>
      <div className="w-screen h-screen flex gap-5 pt-5">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarTrigger />
          <div className="flex-1 px-5 mt-5">{children}</div>
        </SidebarProvider>
      </div>
    </>
  );
}
