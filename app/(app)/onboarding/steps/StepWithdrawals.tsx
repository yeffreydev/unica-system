"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createWithdrawal } from "../api";
import { StepShell } from "../components/StepShell";
import { PerUserGrid } from "../components/PerUserGrid";

export function StepWithdrawals() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      for (const [uid, amount] of Object.entries(state.withdrawals)) {
        if (amount > 0) await createWithdrawal(uid, amount, state.cutoffDate);
      }
      toast({ title: "Retiros registrados" });
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
      stepId="withdrawals"
      title="Retiros acumulados por socio"
      description={`Monto total de retiros de ahorros que cada socio realizó hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <PerUserGrid
        users={state.users}
        amounts={state.withdrawals}
        onChange={(uid, v) =>
          setState((s) => ({ ...s, withdrawals: { ...s.withdrawals, [uid]: v } }))
        }
      />
    </StepShell>
  );
}
