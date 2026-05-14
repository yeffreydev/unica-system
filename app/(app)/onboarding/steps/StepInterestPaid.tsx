"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createLoanPayment } from "../api";
import { StepShell } from "../components/StepShell";
import { PerUserGrid } from "../components/PerUserGrid";

export function StepInterestPaid() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      for (const [uid, interest] of Object.entries(state.interestPaid)) {
        if (interest > 0) {
          await createLoanPayment(uid, 0, interest, state.cutoffDate);
        }
      }
      toast({ title: "Intereses cobrados registrados" });
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
      stepId="interest-paid"
      title="Interés pagado acumulado (préstamos)"
      description={`Interés total que ya recibiste de los préstamos hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <PerUserGrid
        users={state.users}
        amounts={state.interestPaid}
        onChange={(uid, v) =>
          setState((s) => ({ ...s, interestPaid: { ...s.interestPaid, [uid]: v } }))
        }
      />
    </StepShell>
  );
}
