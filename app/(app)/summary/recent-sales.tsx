"use client";

import { useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export function RecentSales() {
  const [recentLoans, setRecentLoans] = useState<RecentLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentLoans = async () => {
      try {
        const response = await apiClient.get('/dashboard/recent-loans?limit=5');
        setRecentLoans(response.data);
      } catch (error) {
        console.error('Error fetching recent loans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentLoans();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recentLoans.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay préstamos recientes
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {recentLoans.map((loan) => (
        <div key={loan.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatars/${loan.user.id}.png`} alt="Avatar" />
            <AvatarFallback>{getInitials(loan.user.name, loan.user.lastname)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {loan.user.name} {loan.user.lastname}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(loan.createdAt)}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {formatCurrency(loan.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
