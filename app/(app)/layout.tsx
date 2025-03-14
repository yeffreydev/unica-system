import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Nav";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies();
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
