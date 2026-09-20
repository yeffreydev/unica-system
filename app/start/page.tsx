"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { OnboardingProvider, useOnboarding } from "./OnboardingProvider";
import { useTenant } from "@/context/TenantContext";
import { Stepper } from "./Stepper";
import { StepBank } from "./steps/StepBank";
import { StepFrequency } from "./steps/StepFrequency";
import { StepUsers } from "./steps/StepUsers";
import { StepCutoff } from "./steps/StepCutoff";
import { StepShares } from "./steps/StepShares";
import { StepOtherIncomes } from "./steps/StepOtherIncomes";
import { StepCapitalPaid } from "./steps/StepCapitalPaid";
import { StepInterestPaid } from "./steps/StepInterestPaid";
import { StepDeposits } from "./steps/StepDeposits";
import { StepLegalReserve } from "./steps/StepLegalReserve";
import { StepSocialFund } from "./steps/StepSocialFund";
import { StepWithdrawals } from "./steps/StepWithdrawals";
import { StepDividends } from "./steps/StepDividends";
import { StepLoans } from "./steps/StepLoans";
import { StepSavingsInterest } from "./steps/StepSavingsInterest";
import { StepAdministrative } from "./steps/StepAdministrative";
import { StepReconciliation } from "./steps/StepReconciliation";
import { StepId } from "./types";

const STEP_COMPONENTS: Record<StepId, React.ComponentType> = {
  bank: StepBank,
  frequency: StepFrequency,
  users: StepUsers,
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
  return <Comp />;
}

function Progress() {
  const { state, steps } = useOnboarding();
  const done = steps.filter((s) => state.completedSteps.includes(s.id)).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className="px-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
        <span className="font-medium">Progreso</span>
        <span className="tabular-nums">
          {done}/{steps.length}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DraftBar() {
  const { saveDraft, savedAt } = useOnboarding();
  const [flash, setFlash] = useState(false);

  const stamp = savedAt
    ? new Date(savedAt).toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-center justify-between gap-2 mt-3 px-1">
      <span className="text-[11px] text-muted-foreground truncate">
        {flash ? "Borrador guardado" : stamp ? `Borrador guardado ${stamp}` : "Sin guardar"}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        onClick={() => {
          saveDraft();
          setFlash(true);
          setTimeout(() => setFlash(false), 1500);
        }}
      >
        <Save className="mr-1 h-3.5 w-3.5" />
        Guardar borrador
      </Button>
    </div>
  );
}

function Shell() {
  const { mode } = useOnboarding();
  const { tenant } = useTenant();
  // Hasta que no termine el onboarding no hay a dónde salir.
  const canExit = tenant?.onboardingCompleted !== false;

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      <aside className="shrink-0 lg:w-[300px] border-b lg:border-b-0 lg:border-r border-border bg-[hsl(var(--sidebar-background))] flex flex-col">
        <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-4">
          <div className="min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/an-logo.svg" alt="Aquí Nace" className="h-8 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/an-logo-light.svg" alt="Aquí Nace" className="h-8 w-auto hidden dark:block" />
            <h1 className="text-lg font-bold mt-3 leading-tight">
              {mode === "nueva" ? "Configura tu comunidad" : "Registra tu historial"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {mode === "nueva"
                ? "Datos de la comunidad, reuniones y socios. Nada más."
                : "Todo lo que ya pasó, hasta la fecha de corte."}
            </p>
            <span
              className={cn(
                "mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                mode === "nueva"
                  ? "bg-primary/10 text-primary"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              <Sprout className="h-3 w-3" />
              {mode === "nueva" ? "Comunidad nueva" : "Comunidad en marcha"}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <ThemeToggle />
            {canExit && (
              <Link
                href="/"
                aria-label="Salir del onboarding"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="px-4 pb-4">
          <Progress />
          <DraftBar />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-6 max-lg:max-h-[38vh]">
          <Stepper />
        </div>
      </aside>

      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto h-full max-w-4xl px-5 sm:px-8 py-6 sm:py-8">
          <CurrentStep />
        </div>
      </main>
    </div>
  );
}

export default function StartPage() {
  return (
    <OnboardingProvider>
      <Shell />
    </OnboardingProvider>
  );
}
