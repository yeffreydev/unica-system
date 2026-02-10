"use client";

import { Metadata } from "next";
import { useContext, useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RecentSales } from "./recent-sales";
import { Overview } from "./Overview";
import { RecentDeposits } from "./recent-deposits";
import { LoanStatusChart } from "./loan-status-chart";
import { DepositsWithdrawalsChart } from "./deposits-withdrawals-chart";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

interface DashboardData {
  socialCapital: { total: number };
  loansLastMonth: {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
  };
  interestLastMonth: {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
  };
  interestByMonth: Array<{
    month: string;
    year: number;
    total: number;
  }>;
  recentLoans: Array<{
    id: string;
    amount: number;
    user: {
      id: string;
      name: string;
      lastname: string;
    };
    createdAt: string;
    status: string;
  }>;
  totalUsers: { total: number };
  activeLoans: { total: number; totalAmount: number };
  recentDeposits: Array<{
    id: string;
    amount: number;
    user: {
      id: string;
      name: string;
      lastname: string;
    };
    createdAt: string;
  }>;
  pendingApplications: { total: number };
  depositsLastMonth: {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
  };
  loanStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  depositsVsWithdrawals: Array<{
    month: string;
    year: number;
    deposits: number;
    withdrawals: number;
  }>;
  topUsersByLoans: Array<{
    user: {
      id: string;
      name: string;
      lastname: string;
    };
    totalLoans: number;
    activeLoans: number;
  }>;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { users } = useContext(AppContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };
  if (loading) {
    return (
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Datos en tiempo real</span>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              {/* Compact Metrics Grid with Quick Actions */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 mb-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Capital Social</p>
                        <p className="text-lg font-bold">
                          {dashboardData ? formatCurrency(dashboardData.socialCapital.total) : 'S/. 0'}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Socios</p>
                        <p className="text-lg font-bold">{users.length}</p>
                      </div>
                      <div className="h-8 w-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Préstamos Activos</p>
                        <p className="text-lg font-bold">{dashboardData?.activeLoans.total || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Solicitudes Pendientes</p>
                        <p className="text-lg font-bold">{dashboardData?.pendingApplications.total || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14,2 14,8 20,8" />
                          <line x1="16" x2="8" y1="13" y2="13" />
                          <line x1="16" x2="8" y1="17" y2="17" />
                          <line x1="10" x2="8" y1="9" y2="9" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <Link href="/assembly" className="w-full">
                        <div className="flex items-center justify-center w-full h-8 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors cursor-pointer">
                          <svg className="h-4 w-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span className="text-xs font-medium text-primary">Ir a Asamblea</span>
                        </div>
                      </Link>
                      <p className="text-xs text-muted-foreground text-center">Acceso rápido</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Metrics Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Préstamos del Mes
                    </CardTitle>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      (dashboardData?.loansLastMonth.percentageChange || 0) >= 0
                        ? 'bg-green-500/10'
                        : 'bg-red-500/10'
                    }`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className={`h-4 w-4 ${
                          (dashboardData?.loansLastMonth.percentageChange || 0) >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      +{dashboardData?.loansLastMonth.currentMonth || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData ? formatPercentage(dashboardData.loansLastMonth.percentageChange) : '+0.0%'} del último mes
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Intereses Recibidos
                    </CardTitle>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      (dashboardData?.interestLastMonth.percentageChange || 0) >= 0
                        ? 'bg-green-500/10'
                        : 'bg-red-500/10'
                    }`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className={`h-4 w-4 ${
                          (dashboardData?.interestLastMonth.percentageChange || 0) >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData ? formatCurrency(dashboardData.interestLastMonth.currentMonth) : 'S/. 0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData ? formatPercentage(dashboardData.interestLastMonth.percentageChange) : '+0.0%'} del último mes
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Depósitos del Mes
                    </CardTitle>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      (dashboardData?.depositsLastMonth.percentageChange || 0) >= 0
                        ? 'bg-green-500/10'
                        : 'bg-red-500/10'
                    }`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className={`h-4 w-4 ${
                          (dashboardData?.depositsLastMonth.percentageChange || 0) >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                      </svg>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData ? formatCurrency(dashboardData.depositsLastMonth.currentMonth) : 'S/. 0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData ? formatPercentage(dashboardData.depositsLastMonth.percentageChange) : '+0.0%'} del último mes
                    </p>
                  </CardContent>
                </Card>
              </div>
              {/* All Charts in Compact Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {/* Interest Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                      </svg>
                      Intereses Mensuales
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Últimos 12 meses
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Overview />
                  </CardContent>
                </Card>

                {/* Loan Status Pie Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                        <path d="M22 12A10 10 0 0 0 12 2v10Z" />
                      </svg>
                      Estado Préstamos
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Distribución actual
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <LoanStatusChart />
                  </CardContent>
                </Card>

                {/* Deposits vs Withdrawals Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M3 3v18h18" />
                        <rect width="4" height="4" x="7" y="5" rx="1" />
                        <rect width="4" height="4" x="15" y="5" rx="1" />
                        <rect width="4" height="4" x="7" y="11" rx="1" />
                        <rect width="4" height="4" x="15" y="11" rx="1" />
                        <rect width="4" height="4" x="7" y="17" rx="1" />
                        <rect width="4" height="4" x="15" y="17" rx="1" />
                      </svg>
                      Ingresos vs Egresos
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Últimos 6 meses
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <DepositsWithdrawalsChart />
                  </CardContent>
                </Card>
              </div>

              {/* Compact Bottom Section */}
              <div className="grid gap-3 md:grid-cols-2">
                {/* Recent Loans - Compact */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                      Préstamos Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      <RecentSales />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Deposits - Compact */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                      </svg>
                      Depósitos Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      <RecentDeposits deposits={dashboardData?.recentDeposits || []} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
