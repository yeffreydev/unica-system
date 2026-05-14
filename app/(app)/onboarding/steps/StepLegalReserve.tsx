"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { createSocialFundIncome, getSocialFundsTypes } from "../api";
import { StepShell } from "../components/StepShell";
import { SingleAmountCard } from "../components/SingleAmountCard";

export function StepLegalReserve() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    if (state.legalReserve <= 0) return;
    setSaving(true);
    try {
      const funds = await getSocialFundsTypes();
      const legal = funds.find((f) => f.name === "LEGAL");
      if (!legal) throw new Error("LEGAL fund not found");
      await createSocialFundIncome(legal.id, state.legalReserve, state.cutoffDate, "Reserva legal acumulada");
      toast({ title: "Reserva legal registrada" });
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
      stepId="legal-reserve"
      title="Reserva legal"
      description={`Monto acumulado en la reserva legal hasta el ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <SingleAmountCard
        value={state.legalReserve}
        onChange={(n) => setState((s) => ({ ...s, legalReserve: n }))}
        label="Reserva legal acumulada"
        hint="Aporte total destinado al fondo de reserva legal."
      />
    </StepShell>
  );
}
