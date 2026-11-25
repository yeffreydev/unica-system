"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/reports/loans", label: "Resumen mensual", icon: LayoutGrid, exact: true },
  { href: "/reports/loans/installments", label: "Cuotas", icon: CalendarCheck2, exact: false },
];

export default function LoansReportLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname().replace(/\/$/, "");
  return (
    <div>
      <div className="px-3 md:px-5 pt-3 md:pt-5">
        <nav className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
