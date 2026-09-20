"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../OnboardingProvider";
import { StepShell } from "../components/StepShell";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function StepReconciliation() {
  const { state, setState, resetAll, setCurrentStep, finish } = useOnboarding();

  const sumValues = (r: Record<string, number>) =>
    Object.values(r).reduce((a, b) => a + (Number(b) || 0), 0);

  const totals = useMemo(() => {
    const acciones = sumValues(state.shares) * (state.bank.mainStockPrice || 0);
    const otrosIng = state.otherIncomes.reduce((a, e) => a + (e.amount || 0), 0);
    const capPagado = sumValues(state.capitalPaid);
    const intCobrado = sumValues(state.interestPaid);
    const depositos = sumValues(state.deposits);
    const reservaLegal = state.legalReserve || 0;
    const fondoSocial = state.socialFund || 0;
    const ingresos =
      acciones + otrosIng + capPagado + intCobrado + depositos + reservaLegal + fondoSocial;

    const retiros = sumValues(state.withdrawals);
    const utilidades = sumValues(state.dividends);
    const prestamos = Object.values(state.loans).reduce(
      (a, l) => a + (Number(l?.amount) || 0),
      0
    );
    const intAhorristas = sumValues(state.savingsInterest);
    const gastosAdmin = state.administrative.reduce((a, e) => a + (e.amount || 0), 0);
    const egresos = retiros + utilidades + prestamos + intAhorristas + gastosAdmin;

    const cajaTeorica = ingresos - egresos;
    const cajaReal = state.cashReal || 0;
    const diff = cajaReal - cajaTeorica;

    return {
      acciones,
      otrosIng,
      capPagado,
      intCobrado,
      depositos,
      reservaLegal,
      fondoSocial,
      ingresos,
      retiros,
      utilidades,
      prestamos,
      intAhorristas,
      gastosAdmin,
      egresos,
      cajaTeorica,
      cajaReal,
      diff,
    };
  }, [state]);

  const cuadra = Math.abs(totals.diff) < 0.01;

  return (
    <StepShell
      stepId="reconciliation"
      title="Cuadre de caja"
      description={`Revisa que todo cuadre al ${state.cutoffDate} antes de empezar.`}
      hideNext
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SummaryBlock
            title="Ingresos"
            tone="emerald"
            icon={<ArrowUpCircle className="h-5 w-5" />}
            rows={[
              ["Acciones (capital social)", totals.acciones],
              ["Otros ingresos", totals.otrosIng],
              ["Capital pagado (préstamos)", totals.capPagado],
              ["Interés cobrado (préstamos)", totals.intCobrado],
              ["Depósitos", totals.depositos],
              ["Reserva legal", totals.reservaLegal],
              ["Fondo social", totals.fondoSocial],
            ]}
            total={totals.ingresos}
          />
          <SummaryBlock
            title="Egresos"
            tone="rose"
            icon={<ArrowDownCircle className="h-5 w-5" />}
            rows={[
              ["Retiros", totals.retiros],
              ["Utilidades distribuidas", totals.utilidades],
              ["Préstamos otorgados", totals.prestamos],
              ["Interés a ahorristas", totals.intAhorristas],
              ["Gastos administrativos", totals.gastosAdmin],
            ]}
            total={totals.egresos}
          />
        </div>

        <div className="rounded-lg border border-border p-5 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Stat label="Caja según las cuentas" value={fmt(totals.cajaTeorica)} hint="Lo que entró menos lo que salió" />
            <div>
              <Label className="text-xs">Caja real (efectivo + banco)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={state.cashReal || ""}
                onChange={(e) =>
                  setState((s) => ({ ...s, cashReal: Number(e.target.value) || 0 }))
                }
                className="mt-1.5 text-right"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lo que realmente tienes hoy entre efectivo y banco.
              </p>
            </div>
            <Stat
              label="Diferencia"
              value={fmt(totals.diff)}
              hint={cuadra ? "Todo cuadra" : totals.diff > 0 ? "Sobra dinero" : "Falta dinero"}
              tone={cuadra ? "emerald" : "amber"}
            />
          </div>
        </div>

        <div
          className={cn(
            "rounded-lg border p-5 flex items-start gap-3",
            cuadra
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-amber-500/40 bg-amber-500/5"
          )}
        >
          {cuadra ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {cuadra
                ? "Todo cuadra. Tu comunidad está lista."
                : "Los números no cuadran todavía. Revisa los pasos anteriores."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {cuadra
                ? "El historial quedó guardado con la fecha de corte. Desde ahora registras el día a día desde el panel."
                : `Diferencia: ${fmt(totals.diff)}. Vuelve a los pasos donde falte o sobre dinero y corrige los montos.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={() => setCurrentStep("bank")}>
            Ver desde el inicio
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("¿Borrar todo lo registrado y empezar de nuevo?")) {
                resetAll();
              }
            }}
          >
            Empezar de nuevo
          </Button>
          <Button onClick={finish}>
            Empezar con Aquí Nace
            <Rocket className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepShell>
  );
}

function SummaryBlock({
  title,
  tone,
  icon,
  rows,
  total,
}: {
  title: string;
  tone: "emerald" | "rose";
  icon: React.ReactNode;
  rows: [string, number][];
  total: number;
}) {
  const toneClass = tone === "emerald" ? "text-emerald-500" : "text-rose-500";
  return (
    <div className="rounded-lg border border-border p-5">
      <div className={cn("flex items-center gap-2 mb-3", toneClass)}>
        {icon}
        <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <dl className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{fmt(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Total</span>
        <span className={cn("text-base font-bold tabular-nums", toneClass)}>{fmt(total)}</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "emerald" | "amber";
}) {
  const toneClass =
    tone === "emerald" ? "text-emerald-500" : tone === "amber" ? "text-amber-500" : "text-foreground";
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={cn("text-2xl font-bold tabular-nums mt-1", toneClass)}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
