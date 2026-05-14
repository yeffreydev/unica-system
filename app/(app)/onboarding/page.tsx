"use client";

import { OnboardingProvider, useOnboarding } from "./OnboardingProvider";
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

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 min-h-[calc(100vh-180px)]">
        <aside className="lg:border-r lg:border-border lg:pr-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Onboarding
            </p>
            <h1 className="text-lg font-bold mt-0.5">Carga inicial</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Asamblea de regularización de data acumulada.
            </p>
          </div>
          <Stepper />
        </aside>

        <section className="min-h-0">
          <CurrentStep />
        </section>
      </div>
    </OnboardingProvider>
  );
}
