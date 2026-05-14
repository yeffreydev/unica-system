"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createSocialFundIncome, getSocialFundsTypes } from "../api";
import { StepShell } from "../components/StepShell";
import { SingleAmountCard } from "../components/SingleAmountCard";

export function StepSocialFund() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    if (state.socialFund <= 0) return;
    setSaving(true);
    try {
      const funds = await getSocialFundsTypes();
      const social = funds.find((f) => f.name === "SOCIAL");
      if (!social) throw new Error("SOCIAL fund not found");
      await createSocialFundIncome(social.id, state.socialFund, state.cutoffDate, "Fondo social acumulado");
      toast({ title: "Fondo social registrado" });
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
      stepId="social-fund"
      title="Fondo social"
      description={`Monto acumulado en el fondo social hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <SingleAmountCard
        value={state.socialFund}
        onChange={(n) => setState((s) => ({ ...s, socialFund: n }))}
        label="Fondo social acumulado"
        hint="Aporte total destinado al fondo social."
      />
    </StepShell>
  );
}
