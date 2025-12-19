import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export function RecentDeposits({ deposits }: RecentDepositsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getInitials = (name: string, lastname: string) => {
    return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  if (deposits.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay depósitos recientes
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {deposits.map((deposit) => (
        <div key={deposit.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatars/${deposit.user.id}.png`} alt="Avatar" />
            <AvatarFallback className="bg-green-500/10 text-green-600">
              {getInitials(deposit.user.name, deposit.user.lastname)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {deposit.user.name} {deposit.user.lastname}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(deposit.createdAt)}
            </p>
          </div>
          <div className="ml-auto font-medium text-green-600">
            +{formatCurrency(deposit.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}