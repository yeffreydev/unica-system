"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RecentLoan {
  id: string;
  amount: number;
  user: {
    id: string;
    name: string;
    lastname: string;
  };
  createdAt: string;
  status: string;
}

interface RecentSalesProps {
  loans: RecentLoan[];
}

// Paleta restringida a marca Aqui Nace: variaciones de primary + neutrales.
const STATUS_VARIANT: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Aprobado", className: "bg-primary/10 text-primary border-primary/20" },
  PENDING: { label: "Pendiente", className: "bg-accent text-accent-foreground border-border" },
  REJECTED: { label: "Rechazado", className: "bg-muted text-muted-foreground border-border" },
  PAID: { label: "Pagado", className: "bg-primary/20 text-primary border-primary/30" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

function getInitials(name: string, lastname: string) {
  return `${name?.charAt(0) ?? ""}${lastname?.charAt(0) ?? ""}`.toUpperCase();
}

export function RecentSales({ loans }: RecentSalesProps) {
  if (!loans || loans.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-6">
        Sin préstamos recientes
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {loans.map((loan) => {
        const status = STATUS_VARIANT[loan.status] ?? STATUS_VARIANT.PENDING;
        return (
          <div
            key={loan.id}
            className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/40 transition-colors"
          >
            <Avatar className="h-9 w-9 border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(loan.user.name, loan.user.lastname)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {loan.user.name} {loan.user.lastname}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatDate(loan.createdAt)}</span>
                <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold whitespace-nowrap">
              {formatCurrency(loan.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
