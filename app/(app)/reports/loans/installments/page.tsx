"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  FileText,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/currency";
import { exportToExcel, exportToPDF, ReportColumn } from "@/lib/reportExport";
import { cn } from "@/lib/utils";

interface IInstallment {
  id: string;
  installment_number: number | null;
  date: string;
  payment: number;
  interest: number;
  paid: boolean;
  balance: number | null;
}

interface ILoan {
  id: string;
  amount: number;
  interestRate: number;
  status: string;
  paid: boolean;
  date: string;
  balance: number | null;
  initalInstallments: number;
  loanType: { name: string } | null;
  loanInstallments: IInstallment[];
}

interface IUserLoans {
  id: string;
  name: string;
  lastname: string;
  dni: string | null;
  loans: ILoan[];
}

type Status = "paid" | "overdue" | "pending";
type Filter = "all" | "pending" | "overdue" | "paid";

const LOAN_TYPE_LABEL: Record<string, string> = {
  FIXED: "Cuota fija",
  VARIABLE: "Variable",
  REBATE: "A rebatir",
  MATURITY: "Al vencimiento",
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

const statusOf = (i: IInstallment, today: number): Status =>
  i.paid ? "paid" : new Date(i.date).getTime() < today ? "overdue" : "pending";

const STATUS_UI: Record<Status, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  paid: {
    label: "Pagada",
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Vencida",
    cls: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
    icon: AlertCircle,
  },
  pending: {
    label: "Por pagar",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    icon: Clock,
  },
};

function StatusBadge({ status }: { status: Status }) {
  const ui = STATUS_UI[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", ui.cls)}>
      <ui.icon className="h-3 w-3" />
      {ui.label}
    </span>
  );
}

interface Totals {
  paidCount: number;
  paidAmount: number;
  pendingCount: number;
  pendingAmount: number;
  overdueCount: number;
  overdueAmount: number;
  total: number;
  next: IInstallment | null;
}

function computeTotals(loans: ILoan[], today: number): Totals {
  const t: Totals = {
    paidCount: 0,
    paidAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    overdueCount: 0,
    overdueAmount: 0,
    total: 0,
    next: null,
  };
  for (const l of loans) {
    for (const i of l.loanInstallments) {
      const amt = (i.payment || 0) + (i.interest || 0);
      const s = statusOf(i, today);
      t.total++;
      if (s === "paid") {
        t.paidCount++;
        t.paidAmount += amt;
      } else {
        if (s === "overdue") {
          t.overdueCount++;
          t.overdueAmount += amt;
        } else {
          t.pendingCount++;
          t.pendingAmount += amt;
        }
        if (!t.next || new Date(i.date) < new Date(t.next.date)) t.next = i;
      }
    }
  }
  return t;
}

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof CheckCircle2;
  tone: "emerald" | "amber" | "rose" | "slate";
}) {
  const toneCls = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    slate: "text-primary bg-primary/10",
  }[tone];
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", toneCls)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tabular-nums leading-tight mt-0.5">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoanBlock({ loan, today, filter }: { loan: ILoan; today: number; filter: Filter }) {
  const rows = loan.loanInstallments.filter((i) => filter === "all" || statusOf(i, today) === filter);
  const paid = loan.loanInstallments.filter((i) => i.paid).length;
  const total = loan.loanInstallments.length;
  const type = loan.loanType?.name ? LOAN_TYPE_LABEL[loan.loanType.name] ?? loan.loanType.name : "";

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-muted/40 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold">Préstamo de {money(loan.amount)}</span>
          <span className="text-xs text-muted-foreground">{fmtDate(loan.date)}</span>
          {type && <span className="text-xs text-muted-foreground">· {type}</span>}
          <span className="text-xs text-muted-foreground">
            · {Math.round(loan.interestRate * 10000) / 100}% mensual
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            {paid}/{total} cuotas pagadas
          </span>
          {loan.paid || paid === total ? (
            <StatusBadge status="paid" />
          ) : (
            <span className="font-medium tabular-nums">Saldo {money(loan.balance ?? 0)}</span>
          )}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-3 text-xs text-muted-foreground">Sin cuotas en este filtro.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-4 py-2 w-12">N°</th>
                <th className="text-left font-medium px-3 py-2">Vence</th>
                <th className="text-right font-medium px-3 py-2">Capital</th>
                <th className="text-right font-medium px-3 py-2">Interés</th>
                <th className="text-right font-medium px-3 py-2">Cuota</th>
                <th className="text-right font-medium px-3 py-2 hidden sm:table-cell">Saldo</th>
                <th className="text-right font-medium px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i, idx) => {
                const s = statusOf(i, today);
                return (
                  <tr
                    key={i.id}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      s === "paid" && "text-muted-foreground",
                      s === "overdue" && "bg-rose-500/[0.03]"
                    )}
                  >
                    <td className="px-4 py-2 tabular-nums">{i.installment_number ?? idx + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{fmtDate(i.date)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{money(i.payment)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{money(i.interest)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground">
                      {money((i.payment || 0) + (i.interest || 0))}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">
                      {i.balance != null ? money(i.balance) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <StatusBadge status={s} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MemberCard({
  user,
  today,
  filter,
  open,
  onToggle,
}: {
  user: IUserLoans;
  today: number;
  filter: Filter;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useMemo(() => computeTotals(user.loans, today), [user.loans, today]);
  const pct = t.total ? Math.round((t.paidCount / t.total) * 100) : 0;
  const initials = `${user.name?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className={cn("overflow-hidden transition-shadow", open && "shadow-md")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left px-4 py-3.5 flex flex-col md:flex-row md:items-center gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 md:w-[260px]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {user.name} {user.lastname}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.dni ? `DNI ${user.dni} · ` : ""}
              {user.loans.length} préstamo{user.loans.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>
              {t.paidCount} de {t.total} cuotas pagadas
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-xs">
          <div className="text-right">
            <p className="text-muted-foreground">Pagado</p>
            <p className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{money(t.paidAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Por pagar</p>
            <p className="font-semibold tabular-nums">{money(t.pendingAmount + t.overdueAmount)}</p>
          </div>
          <div className="text-right min-w-[110px]">
            <p className="text-muted-foreground">Próxima cuota</p>
            {t.next ? (
              <p
                className={cn(
                  "font-semibold",
                  new Date(t.next.date).getTime() < today ? "text-rose-600 dark:text-rose-400" : ""
                )}
              >
                {fmtDate(t.next.date)}
              </p>
            ) : (
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Al día</p>
            )}
          </div>
          {t.overdueCount > 0 && (
            <span className="hidden lg:inline-flex rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2 py-0.5 text-[11px] font-medium">
              {t.overdueCount} vencida{t.overdueCount === 1 ? "" : "s"}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-3 bg-background">
          {user.loans.map((l) => (
            <LoanBlock key={l.id} loan={l} today={today} filter={filter} />
          ))}
        </div>
      )}
    </Card>
  );
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Por pagar" },
  { id: "overdue", label: "Vencidas" },
  { id: "paid", label: "Pagadas" },
];

export default function LoanInstallmentsPage() {
  const { bank } = useContext(AppContext);
  const [data, setData] = useState<IUserLoans[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const today = useMemo(startOfToday, []);

  useEffect(() => {
    apiClient
      .get<IUserLoans[]>("/loans/report/installments")
      .then((r) => setData(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(true));
  }, []);

  const global = useMemo(() => computeTotals((data ?? []).flatMap((u) => u.loans), today), [data, today]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((u) => {
      if (q && !`${u.name} ${u.lastname} ${u.dni ?? ""}`.toLowerCase().includes(q)) return false;
      if (filter === "all") return true;
      return u.loans.some((l) => l.loanInstallments.some((i) => statusOf(i, today) === filter));
    });
  }, [data, search, filter, today]);

  const withDebt = (data ?? []).filter((u) =>
    u.loans.some((l) => l.loanInstallments.some((i) => !i.paid))
  ).length;

  const toggle = (id: string) =>
    setOpenIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  // Exportación: una fila por cuota.
  const columns: ReportColumn[] = [
    { header: "Socio", key: "socio" },
    { header: "DNI", key: "dni" },
    { header: "Préstamo", key: "prestamo", format: "currency", align: "right" },
    { header: "N°", key: "n", align: "center" },
    { header: "Vence", key: "vence" },
    { header: "Capital", key: "capital", format: "currency", align: "right" },
    { header: "Interés", key: "interes", format: "currency", align: "right" },
    { header: "Cuota", key: "cuota", format: "currency", align: "right" },
    { header: "Estado", key: "estado" },
  ];
  const exportRows = visible.flatMap((u) =>
    u.loans.flatMap((l) =>
      l.loanInstallments
        .filter((i) => filter === "all" || statusOf(i, today) === filter)
        .map((i, idx) => ({
          socio: `${u.name} ${u.lastname}`,
          dni: u.dni ?? "",
          prestamo: l.amount,
          n: i.installment_number ?? idx + 1,
          vence: fmtDate(i.date),
          capital: i.payment,
          interes: i.interest,
          cuota: (i.payment || 0) + (i.interest || 0),
          estado: STATUS_UI[statusOf(i, today)].label,
        }))
    )
  );
  const meta = {
    title: "Reporte de Cuotas",
    bankName: bank?.bank?.name,
    period: `Al ${new Date().toLocaleDateString("es-PE")} · ${FILTERS.find((f) => f.id === filter)?.label}`,
    fileName: `reporte-cuotas-${new Date().toISOString().slice(0, 10)}`,
  };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Cuotas de préstamos</h1>
          <p className="text-sm text-muted-foreground">
            Cuotas pagadas y por pagar de cada socio. Toca un socio para ver el detalle.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF(meta, columns, exportRows)}
            disabled={!exportRows.length}
          >
            <FileText className="w-4 h-4 mr-1 text-red-600" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(meta, columns, exportRows)}
            disabled={!exportRows.length}
          >
            <FileSpreadsheet className="w-4 h-4 mr-1 text-green-600" />
            Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          label="Cuotas pagadas"
          value={money(global.paidAmount)}
          sub={`${global.paidCount} cuotas`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <Kpi
          label="Por pagar"
          value={money(global.pendingAmount)}
          sub={`${global.pendingCount} cuotas en fecha`}
          icon={CalendarClock}
          tone="amber"
        />
        <Kpi
          label="Vencidas"
          value={money(global.overdueAmount)}
          sub={`${global.overdueCount} cuotas atrasadas`}
          icon={AlertCircle}
          tone="rose"
        />
        <Kpi
          label="Socios con deuda"
          value={String(withDebt)}
          sub={`de ${(data ?? []).length} con préstamos`}
          icon={Users}
          tone="slate"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative sm:w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar socio o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                filter === f.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {visible.length > 0 && (
          <button
            type="button"
            className="sm:ml-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={() =>
              setOpenIds((s) => (s.size ? new Set() : new Set(visible.map((u) => u.id))))
            }
          >
            {openIds.size ? "Contraer todo" : "Expandir todo"}
          </button>
        )}
      </div>

      {error ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            No se pudieron cargar las cuotas.
          </CardContent>
        </Card>
      ) : data === null ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando cuotas...
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {data.length === 0 ? "Aún no hay préstamos registrados." : "Ningún socio coincide con el filtro."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((u) => (
            <MemberCard
              key={u.id}
              user={u}
              today={today}
              filter={filter}
              open={openIds.has(u.id)}
              onToggle={() => toggle(u.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
