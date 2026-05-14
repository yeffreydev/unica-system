"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createDividend } from "../api";
import { StepShell } from "../components/StepShell";
import { PerUserGrid } from "../components/PerUserGrid";

export function StepDividends() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      for (const [uid, amount] of Object.entries(state.dividends)) {
        if (amount > 0) await createDividend(uid, amount, state.cutoffDate);
      }
      toast({ title: "Utilidades registradas" });
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
      stepId="dividends"
      title="Utilidades distribuidas"
      description={`Utilidades ya pagadas a cada socio hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <PerUserGrid
        users={state.users}
        amounts={state.dividends}
        onChange={(uid, v) =>
          setState((s) => ({ ...s, dividends: { ...s.dividends, [uid]: v } }))
        }
      />
    </StepShell>
  );
}
