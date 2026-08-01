"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/config/apiClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Wallet,
  Users,
  CreditCard,
  FileClock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
  PiggyBank,
  Coins,
  Trophy,
  Activity,
  CalendarDays,
  Banknote,
  AlertCircle,
  Target,
  CalendarClock,
  Briefcase,
  HandCoins,
  ArrowDownToLine,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { RecentSales } from "./recent-sales";
import { Overview } from "./Overview";
import { RecentDeposits } from "./recent-deposits";
import { LoanStatusChart } from "./loan-status-chart";
import { DepositsWithdrawalsChart } from "./deposits-withdrawals-chart";

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
  interestByMonth: Array<{ month: string; year: number; total: number }>;
  recentLoans: Array<{
    id: string;
    amount: number;
    user: { id: string; name: string; lastname: string };
    createdAt: string;
    status: string;
  }>;
  totalUsers: { total: number };
  activeLoans: { total: number; totalAmount: number };
  recentDeposits: Array<{
    id: string;
    amount: number;
    user: { id: string; name: string; lastname: string };
    createdAt: string;
  }>;
  pendingApplications: { total: number };
  depositsLastMonth: {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
  };
  loanStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
  depositsVsWithdrawals: Array<{
    month: string;
    year: number;
    deposits: number;
    withdrawals: number;
  }>;
  topUsersByLoans: Array<{
    user: { id: string; name: string; lastname: string };
    totalLoans: number;
    activeLoans: number;
  }>;
  upcomingInstallments: Array<{
    id: string;
    date: string;
    payment: number;
    interest: number;
    user: { id: string; name: string; lastname: string };
    loanId: string;
    installmentNumber: number | null;
  }>;
  overdueInstallments: { count: number; totalAmount: number };
  loanPortfolio: {
    disbursed: number;
    principalCollected: number;
    interestCollected: number;
    outstanding: number;
  };
}

function formatCurrency(amount: number, compact = false) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  }).format(amount);
}

function formatPercentage(p: number) {
  const sign = p >= 0 ? "+" : "";
  return `${sign}${p.toFixed(1)}%`;
}

function getInitials(name: string, lastname: string) {
  return `${name?.charAt(0) ?? ""}${lastname?.charAt(0) ?? ""}`.toUpperCase();
}

// Hitos de capital social en soles. 10K como meta inicial, luego saltos de
// 100K hasta 1M, de 1M hasta 10M, y de 10M hasta el tope de 100M.
const CAPITAL_GOALS: number[] = [
  10_000,
  ...Array.from({ length: 9 }, (_, i) => (i + 1) * 100_000), // 100K..900K
  ...Array.from({ length: 10 }, (_, i) => (i + 1) * 1_000_000), // 1M..10M
  ...Array.from({ length: 9 }, (_, i) => (i + 2) * 10_000_000), // 20M..100M
];

interface GoalProgress {
  next: number | null;
  prev: number;
  remaining: number;
  percent: number;
  reached: boolean;
}

function computeCapitalGoal(current: number): GoalProgress {
  const idx = CAPITAL_GOALS.findIndex((g) => current < g);
  if (idx === -1) {
    return { next: null, prev: CAPITAL_GOALS[CAPITAL_GOALS.length - 1], remaining: 0, percent: 100, reached: true };
  }
  const next = CAPITAL_GOALS[idx];
  const prev = idx === 0 ? 0 : CAPITAL_GOALS[idx - 1];
  const span = next - prev;
  const percent = span > 0 ? Math.min(100, Math.max(0, ((current - prev) / span) * 100)) : 0;
  return { next, prev, remaining: Math.max(0, next - current), percent, reached: false };
}

function TrendBadge({ value }: { value: number }) {
  const up = value >= 0;
  // Subida = primary brand. Bajada = neutral muted. Solo paleta Aqui Nace.
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        up
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {formatPercentage(value)}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  Icon: LucideIcon;
  /** Nombre de variable CSS Aqui Nace: --primary o --chart-1..5. */
  tintVar: string;
  trend?: number;
  hint?: string;
}

function KpiCard({ label, value, Icon, tintVar, trend, hint }: KpiCardProps) {
  const tint = `hsl(var(${tintVar}))`;
  const tintSoft = `hsl(var(${tintVar}) / 0.10)`;
  return (
    <Card className="border-border hover:border-foreground/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className="text-xl font-semibold tracking-tight mt-1 tabular-nums">{value}</p>
            <div className="mt-2 flex items-center gap-2">
              {typeof trend === "number" && <TrendBadge value={trend} />}
              {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
            </div>
          </div>
          <div
            className="h-10 w-10 shrink-0 rounded-md flex items-center justify-center"
            style={{ backgroundColor: tintSoft }}
          >
            <Icon className="h-5 w-5" style={{ color: tint }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PortfolioStatProps {
  label: string;
  value: string;
  Icon: LucideIcon;
  tintVar: string;
  hint?: string;
}

// Mini-tarjeta para estadísticas dentro de la cartera de préstamos.
function PortfolioStat({ label, value, Icon, tintVar, hint }: PortfolioStatProps) {
  const tint = `hsl(var(${tintVar}))`;
  const tintSoft = `hsl(var(${tintVar}) / 0.10)`;
  return (
    <div className="rounded-md border border-border p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: tintSoft }}
        >
          <Icon className="h-4 w-4" style={{ color: tint }} />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground truncate">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Skeleton className="h-[220px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-[220px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Intervalo de auto-refresco silencioso (ms). Mantiene el panel "en vivo".
const REFRESH_INTERVAL = 60_000;

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const response = await apiClient.get("/dashboard");
      setData(response.data);
      setError(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No se pudo cargar el panel</h2>
          <p className="text-sm text-muted-foreground">
            Hubo un problema al obtener los datos. Verifica tu conexión e intenta de nuevo.
          </p>
          <Button onClick={() => fetchData()} size="sm">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalLoanAmount = data.activeLoans.totalAmount;
  const maxTopLoan = Math.max(...data.topUsersByLoans.map((u) => u.totalLoans), 1);
  const capitalGoal = computeCapitalGoal(data.socialCapital.total);

  return (
    <div className="flex-1 space-y-4 pt-6 pb-10">
      {/* Header */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="capitalize">{today}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">Panel de Control</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Resumen financiero y operativo de tu única
            </p>
          </div>
          <div className="flex items-center gap-2">
            {error ? (
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                Datos sin actualizar
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {lastUpdated
                  ? `Actualizado ${lastUpdated.toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "En vivo"}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button asChild size="sm">
              <Link href="/assembly">
                Ir a Asamblea
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Primary KPI grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/30 hover:border-primary/50 transition-colors">
          {/* Capital Social = card destacado (acento primary, sin degradados). */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">Capital Social</p>
                <p className="text-xl font-semibold tracking-tight mt-1 tabular-nums">
                  {formatCurrency(data.socialCapital.total)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Valor total de acciones</p>
              </div>
              <div className="h-10 w-10 shrink-0 rounded-md flex items-center justify-center bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Indicador de meta de capital */}
            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3 text-primary" />
                  {capitalGoal.reached ? "Meta máxima" : `Meta: ${formatCurrency(capitalGoal.next!, true)}`}
                </span>
                <span className="font-semibold text-primary tabular-nums">
                  {capitalGoal.percent.toFixed(1)}%
                </span>
              </div>
              <Progress value={capitalGoal.percent} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground">
                {capitalGoal.reached
                  ? "Tope alcanzado"
                  : `Faltan ${formatCurrency(capitalGoal.remaining, true)} para la siguiente meta`}
              </p>
            </div>
          </CardContent>
        </Card>
        <KpiCard
          label="Total Socios"
          value={data.totalUsers.total.toString()}
          Icon={Users}
          tintVar="--chart-2"
          hint="Socios registrados"
        />
        <KpiCard
          label="Préstamos Activos"
          value={`${data.activeLoans.total}`}
          Icon={CreditCard}
          tintVar="--chart-3"
          hint={formatCurrency(totalLoanAmount, true)}
        />
        <KpiCard
          label="Solicitudes Pendientes"
          value={data.pendingApplications.total.toString()}
          Icon={FileClock}
          tintVar="--chart-4"
          hint="Por revisar"
        />
      </div>

      {/* Monthly trend KPIs */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Préstamos del Mes
            </CardTitle>
            <TrendBadge value={data.loansLastMonth.percentageChange} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.loansLastMonth.currentMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {data.loansLastMonth.previousMonth} mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4" style={{ color: "hsl(var(--chart-2))" }} />
              Intereses Recibidos
            </CardTitle>
            <TrendBadge value={data.interestLastMonth.percentageChange} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.interestLastMonth.currentMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {formatCurrency(data.interestLastMonth.previousMonth, true)} mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4" style={{ color: "hsl(var(--chart-3))" }} />
              Depósitos del Mes
            </CardTitle>
            <TrendBadge value={data.depositsLastMonth.percentageChange} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.depositsLastMonth.currentMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {formatCurrency(data.depositsLastMonth.previousMonth, true)} mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cartera de préstamos: desembolsado, recuperado, intereses,
          saldo pendiente, y badge de cuotas vencidas. */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Cartera de Préstamos
            </CardTitle>
            {data.overdueInstallments.count > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "hsl(var(--chart-4) / 0.15)",
                  color: "hsl(var(--chart-4))",
                }}
              >
                <AlertCircle className="h-3 w-3" />
                {data.overdueInstallments.count} cuota
                {data.overdueInstallments.count === 1 ? "" : "s"} vencida
                {data.overdueInstallments.count === 1 ? "" : "s"} •{" "}
                {formatCurrency(data.overdueInstallments.totalAmount, true)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <PortfolioStat
              label="Desembolsado"
              value={formatCurrency(data.loanPortfolio.disbursed, true)}
              Icon={HandCoins}
              tintVar="--chart-1"
              hint="Total prestado histórico"
            />
            <PortfolioStat
              label="Capital Cobrado"
              value={formatCurrency(data.loanPortfolio.principalCollected, true)}
              Icon={ArrowDownToLine}
              tintVar="--chart-2"
              hint="Principal recuperado"
            />
            <PortfolioStat
              label="Intereses Cobrados"
              value={formatCurrency(data.loanPortfolio.interestCollected, true)}
              Icon={Coins}
              tintVar="--chart-3"
              hint="Ganancia acumulada"
            />
            <PortfolioStat
              label="Saldo Pendiente"
              value={formatCurrency(data.loanPortfolio.outstanding, true)}
              Icon={Scale}
              tintVar="--chart-4"
              hint="Por cobrar"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Intereses Mensuales
              </CardTitle>
              <span className="text-xs text-muted-foreground">Últimos 12 meses</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Overview data={data.interestByMonth} />
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Estado de Préstamos
            </CardTitle>
            <p className="text-xs text-muted-foreground">Distribución actual</p>
          </CardHeader>
          <CardContent className="pt-0">
            <LoanStatusChart data={data.loanStatusDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Deposits vs Withdrawals full width */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              Ingresos vs Egresos
            </CardTitle>
            <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <DepositsWithdrawalsChart data={data.depositsVsWithdrawals} />
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Préstamos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RecentSales loans={data.recentLoans} />
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PiggyBank className="h-3.5 w-3.5 text-primary" />
              Depósitos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RecentDeposits deposits={data.recentDeposits} />
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Top Socios por Préstamos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.topUsersByLoans.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-6">
                Sin datos
              </div>
            ) : (
              <div className="space-y-3">
                {data.topUsersByLoans.map((u, idx) => (
                  <div key={u.user.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        #{idx + 1}
                      </span>
                      <Avatar className="h-7 w-7 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                          {getInitials(u.user.name, u.user.lastname)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {u.user.name} {u.user.lastname}
                        </p>
                      </div>
                      <span className="text-xs font-semibold whitespace-nowrap">
                        {formatCurrency(u.totalLoans, true)}
                      </span>
                    </div>
                    <Progress value={(u.totalLoans / maxTopLoan) * 100} className="h-1.5 ml-6" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximas cuotas a vencer */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Próximas Cuotas
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Siguientes {data.upcomingInstallments.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {data.upcomingInstallments.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              Sin cuotas próximas a vencer
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              {data.upcomingInstallments.map((inst) => {
                const due = new Date(inst.date);
                const daysLeft = Math.max(
                  0,
                  Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                );
                const urgent = daysLeft <= 3;
                const totalDue = inst.payment + inst.interest;
                return (
                  <div
                    key={inst.id}
                    className={`rounded-md border p-3 hover:bg-muted/30 transition-colors ${
                      urgent ? "border-l-2" : "border-border"
                    }`}
                    style={urgent ? { borderLeftColor: "hsl(var(--chart-4))" } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                          {getInitials(inst.user.name, inst.user.lastname)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">
                          {inst.user.name} {inst.user.lastname}
                        </p>
                        {inst.installmentNumber != null && (
                          <p className="text-[10px] text-muted-foreground">
                            Cuota #{inst.installmentNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(totalDue, true)}
                      </span>
                      <span
                        className="text-[10px] font-medium rounded-full px-2 py-0.5"
                        style={
                          urgent
                            ? {
                                backgroundColor: "hsl(var(--chart-4) / 0.15)",
                                color: "hsl(var(--chart-4))",
                              }
                            : {
                                backgroundColor: "hsl(var(--primary) / 0.10)",
                                color: "hsl(var(--primary))",
                              }
                        }
                      >
                        {daysLeft === 0 ? "hoy" : `${daysLeft}d`}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {due.toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
