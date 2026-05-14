"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createLoanPayment } from "../api";
import { StepShell } from "../components/StepShell";
import { PerUserGrid } from "../components/PerUserGrid";

export function StepCapitalPaid() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      const ids = new Set([
        ...Object.keys(state.capitalPaid),
        ...Object.keys(state.interestPaid),
      ]);
      for (const uid of ids) {
        const cap = state.capitalPaid[uid] || 0;
        if (cap > 0) {
          await createLoanPayment(uid, cap, 0, state.cutoffDate);
        }
      }
      toast({ title: "Capital pagado registrado" });
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
      stepId="capital-paid"
      title="Capital pagado acumulado"
      description={`Capital de préstamos que cada socio ya devolvió hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <PerUserGrid
        users={state.users}
        amounts={state.capitalPaid}
        onChange={(uid, v) =>
          setState((s) => ({ ...s, capitalPaid: { ...s.capitalPaid, [uid]: v } }))
        }
      />
    </StepShell>
  );
}
