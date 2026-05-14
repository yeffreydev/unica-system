"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createAdminExpense } from "../api";
import { StepShell } from "../components/StepShell";
import { FreeListCard } from "../components/FreeListCard";

export function StepAdministrative() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      for (const e of state.administrative.filter((x) => x.amount > 0)) {
        await createAdminExpense(e, state.cutoffDate);
      }
      toast({ title: "Gastos administrativos registrados" });
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
      stepId="administrative"
      title="Gastos administrativos"
      description={`Gastos operativos acumulados hasta el ${state.cutoffDate} (útiles, pasajes, papelería, etc.).`}
      onNext={onNext}
      saving={saving}
    >
      <FreeListCard
        items={state.administrative}
        onChange={(items) => setState((s) => ({ ...s, administrative: items }))}
        descriptionPlaceholder="Concepto del gasto"
        addLabel="Agregar gasto"
      />
    </StepShell>
  );
}
