"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createDeposit } from "../api";
import { StepShell } from "../components/StepShell";
import { PerUserGrid } from "../components/PerUserGrid";

export function StepDeposits() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      for (const [uid, amount] of Object.entries(state.deposits)) {
        if (amount > 0) await createDeposit(uid, amount, state.cutoffDate);
      }
      toast({ title: "Depósitos registrados" });
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
      stepId="deposits"
      title="Ahorros de cada socio"
      description={`¿Cuánto tiene ahorrado cada socio al ${state.cutoffDate}? Esto va aparte de sus acciones.`}
      onNext={onNext}
      saving={saving}
    >
      <PerUserGrid
        users={state.users}
        amounts={state.deposits}
        onChange={(uid, v) =>
          setState((s) => ({ ...s, deposits: { ...s.deposits, [uid]: v } }))
        }
      />
    </StepShell>
  );
}
