"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        console.log('Rendering nav item:', item);
        console.log('Rendering pathname:', pathname);
        const isActive = pathname === item.href;
        console.log('pathname:', pathname, 'item.href:', item.href, 'isActive:', isActive);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-2 py-1 text-sm font-medium text-muted-foreground rounded-md",
              isActive ? "bg-[#254b9122] shadow-md text-foreground border-l-4 border-primary" : "hover:bg-[#254b9122]",
              "justify-start"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
