import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecentDeposit {
  id: string;
  amount: number;
  user: {
    id: string;
    name: string;
    lastname: string;
  };
  createdAt: string;
}

interface RecentDepositsProps {
  deposits: RecentDeposit[];
}

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

export function RecentDeposits({ deposits }: RecentDepositsProps) {
  if (!deposits || deposits.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-6">
        Sin depósitos recientes
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deposits.map((deposit) => (
        <div
          key={deposit.id}
          className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/40 transition-colors"
        >
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(deposit.user.name, deposit.user.lastname)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {deposit.user.name} {deposit.user.lastname}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(deposit.createdAt)}</p>
          </div>
          <div className="text-sm font-semibold text-primary whitespace-nowrap">
            +{formatCurrency(deposit.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
