import { Metadata } from "next";

import { SidebarNav } from "./side-navbar";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
};

const sidebarNavItems = [
  {
    title: "Plataforma",
    href: "/settings/platform/",
  },
  {
    title: "Asamblea",
    href: "/settings/assembly/",
  },
  {
    title: "Cuenta de acceso",
    href: "/settings/account/",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <div className=" space-y-6 p-10 pb-16 ">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </>
  );
}
