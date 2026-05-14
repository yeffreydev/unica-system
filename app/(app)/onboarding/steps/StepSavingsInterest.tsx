"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createSavingsInterestPayout } from "../api";
import { StepShell } from "../components/StepShell";
import { PerUserGrid } from "../components/PerUserGrid";

export function StepSavingsInterest() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      for (const [uid, amount] of Object.entries(state.savingsInterest)) {
        if (amount > 0) await createSavingsInterestPayout(uid, amount, state.cutoffDate);
      }
      toast({ title: "Interés a ahorristas registrado" });
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
      stepId="savings-interest"
      title="Interés pagado a ahorristas"
      description={`Interés total pagado a cada ahorrista hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <PerUserGrid
        users={state.users}
        amounts={state.savingsInterest}
        onChange={(uid, v) =>
          setState((s) => ({ ...s, savingsInterest: { ...s.savingsInterest, [uid]: v } }))
        }
      />
    </StepShell>
  );
}
