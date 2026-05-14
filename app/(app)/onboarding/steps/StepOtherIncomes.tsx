"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createOtherIncome } from "../api";
import { StepShell } from "../components/StepShell";
import { FreeListCard } from "../components/FreeListCard";

export function StepOtherIncomes() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      for (const e of state.otherIncomes.filter((x) => x.amount > 0)) {
        await createOtherIncome(e, state.cutoffDate);
      }
      toast({ title: "Otros ingresos registrados" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepShell
      stepId="other-incomes"
      title="Otros ingresos acumulados"
      description={`Multas, donaciones u otros ingresos no clasificados hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <FreeListCard
        items={state.otherIncomes}
        onChange={(items) => setState((s) => ({ ...s, otherIncomes: items }))}
        descriptionPlaceholder="Descripción (multa, donación, etc.)"
        addLabel="Agregar ingreso"
      />
    </StepShell>
  );
}
