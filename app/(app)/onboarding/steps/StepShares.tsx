"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { buyShares, getMainStockId } from "../api";
import { StepShell } from "../components/StepShell";
import { PerUserGrid } from "../components/PerUserGrid";

export function StepShares() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    setSaving(true);
    try {
      const mainStockId = await getMainStockId();
      if (!mainStockId) {
        toast({
          title: "Sin acción base",
          description: "No se encontró la acción base de la úNICA. Revisa la configuración.",
          variant: "destructive",
        });
        throw new Error("no main stock");
      }
      const entries = Object.entries(state.shares).filter(([, q]) => q > 0);
      for (const [userId, qty] of entries) {
        await buyShares(mainStockId, userId, qty, state.cutoffDate);
      }
      toast({ title: "Acciones registradas", description: `${entries.length} compras creadas.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron registrar todas.", variant: "destructive" });
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const totalUnits = Object.values(state.shares).reduce((a, b) => a + (b || 0), 0);
  const totalSoles = totalUnits * (state.bank.mainStockPrice || 0);

  return (
    <StepShell
      stepId="shares"
      title="Acciones acumuladas por socio"
      description={`Cantidad total de acciones que tiene cada socio a la fecha de corte (${state.cutoffDate}).`}
      onNext={onNext}
      saving={saving}
    >
      <PerUserGrid
        users={state.users}
        amounts={state.shares}
        onChange={(uid, v) =>
          setState((s) => ({ ...s, shares: { ...s.shares, [uid]: v } }))
        }
        unit="und."
        step="1"
        placeholder="0"
      />
      <div className="mt-4 rounded-md bg-muted/40 p-3 text-sm flex items-center justify-between">
        <span className="text-muted-foreground">Capital social total</span>
        <span className="font-semibold">
          {totalUnits} acc · S/{" "}
          {totalSoles.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </StepShell>
  );
}
