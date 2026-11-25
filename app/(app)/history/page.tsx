"use client";

import { useCallback, useState } from "react";
import { ChevronDown, History, Loader2, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/app/start/OnboardingProvider";
import { Stepper } from "@/app/start/Stepper";
import { StepId } from "@/app/start/types";
import { StepCutoff } from "@/app/start/steps/StepCutoff";
import { StepShares } from "@/app/start/steps/StepShares";
import { StepOtherIncomes } from "@/app/start/steps/StepOtherIncomes";
import { StepCapitalPaid } from "@/app/start/steps/StepCapitalPaid";
import { StepInterestPaid } from "@/app/start/steps/StepInterestPaid";
import { StepDeposits } from "@/app/start/steps/StepDeposits";
import { StepLegalReserve } from "@/app/start/steps/StepLegalReserve";
import { StepSocialFund } from "@/app/start/steps/StepSocialFund";
import { StepWithdrawals } from "@/app/start/steps/StepWithdrawals";
import { StepDividends } from "@/app/start/steps/StepDividends";
import { StepLoans } from "@/app/start/steps/StepLoans";
import { StepSavingsInterest } from "@/app/start/steps/StepSavingsInterest";
import { StepAdministrative } from "@/app/start/steps/StepAdministrative";
import { StepReconciliation } from "@/app/start/steps/StepReconciliation";
import { HistoryMeta, HistoryProvider } from "./HistoryProvider";

const STEP_COMPONENTS: Partial<Record<StepId, React.ComponentType>> = {
  cutoff: StepCutoff,
  shares: StepShares,
  "other-incomes": StepOtherIncomes,
  "capital-paid": StepCapitalPaid,
  "interest-paid": StepInterestPaid,
  deposits: StepDeposits,
  "legal-reserve": StepLegalReserve,
  "social-fund": StepSocialFund,
  withdrawals: StepWithdrawals,
  dividends: StepDividends,
  loans: StepLoans,
  "savings-interest": StepSavingsInterest,
  administrative: StepAdministrative,
  reconciliation: StepReconciliation,
};

function CurrentStep() {
  const { currentStep } = useOnboarding();
  const Comp = STEP_COMPONENTS[currentStep];
  return Comp ? <Comp /> : null;
}

function Sidebar({ meta }: { meta: HistoryMeta }) {
  const { state, steps, currentStep, saveDraft, savedAt, readOnly } = useOnboarding();
  const [open, setOpen] = useState(false);
  const done = steps.filter((s) => state.completedSteps.includes(s.id)).length;
  const pct = Math.round((done / steps.length) * 100);
  const stepIdx = steps.findIndex((s) => s.id === currentStep);
  const stamp = savedAt
    ? new Date(savedAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <aside className="shrink-0 lg:w-[280px] border-b lg:border-b-0 lg:border-r border-border flex flex-col">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold leading-tight">Historial de la asociación</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Registra todo lo que pasó hasta la fecha de corte, con los socios que ya existen.
        </p>
        {readOnly ? (
          <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Lock className="h-3 w-3" />
            Finalizado · solo lectura
            {meta.finalizedAt && ` · ${new Date(meta.finalizedAt).toLocaleDateString("es-PE")}`}
          </span>
        ) : (
          <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Borrador
          </span>
        )}
      </div>

      {!readOnly && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span className="font-medium">Progreso</span>
            <span className="tabular-nums">
              {done}/{steps.length}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2 mt-3">
            <span className="text-[11px] text-muted-foreground truncate">
              {stamp ? `Guardado ${stamp}` : "Sin guardar"}
            </span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={saveDraft}>
              <Save className="mr-1 h-3.5 w-3.5" />
              Guardar
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="lg:hidden mx-4 mb-3 flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-xs"
      >
        <span className="truncate">
          <span className="text-muted-foreground">
            Paso {stepIdx + 1} de {steps.length} ·{" "}
          </span>
          <span className="font-semibold">{steps[stepIdx]?.shortTitle}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      <div
        className={cn("flex-1 min-h-0 overflow-y-auto px-2 pb-6 max-lg:max-h-[38vh]", !open && "max-lg:hidden")}
        onClick={() => setOpen(false)}
      >
        <Stepper />
      </div>
    </aside>
  );
}

export default function HistoryPage() {
  const [meta, setMeta] = useState<HistoryMeta>({ status: "LOADING", finalizedAt: null });
  const onMeta = useCallback((m: HistoryMeta) => setMeta(m), []);

  return (
    <HistoryProvider onMeta={onMeta}>
      {meta.status === "LOADING" ? (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
        </div>
      ) : meta.status === "ERROR" ? (
        <div className="flex h-full items-center justify-center text-sm text-destructive">{meta.error}</div>
      ) : (
        <div className="flex h-full w-full flex-col lg:flex-row rounded-lg border border-border bg-card overflow-hidden">
          <Sidebar meta={meta} />
          <main className="flex-1 min-h-0 min-w-0 overflow-y-auto">
            <div className="mx-auto h-full max-w-4xl px-5 sm:px-8 py-6">
              <CurrentStep />
            </div>
          </main>
        </div>
      )}
    </HistoryProvider>
  );
}
