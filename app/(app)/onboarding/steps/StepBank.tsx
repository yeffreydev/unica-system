"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "../OnboardingProvider";
import { saveBank } from "../api";
import { StepShell } from "../components/StepShell";

export function StepBank() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const onNext = async () => {
    if (!state.bank.name.trim()) {
      toast({ title: "Falta nombre", description: "Ingresa el nombre de la úNICA." });
      throw new Error("name required");
    }
    setSaving(true);
    try {
      await saveBank(state.bank);
      toast({ title: "Datos guardados", description: "Configuración de la úNICA actualizada." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepShell
      stepId="bank"
      title="Datos de la úNICA"
      description="Configura el nombre, las tasas de interés base y el precio de la acción."
      onNext={onNext}
      saving={saving}
    >
      <div className="space-y-5 max-w-xl">
        <div>
          <Label>Nombre de la úNICA</Label>
          <Input
            className="mt-1.5"
            placeholder="Ej: Asociación El Progreso"
            value={state.bank.name}
            onChange={(e) =>
              setState((s) => ({ ...s, bank: { ...s.bank, name: e.target.value } }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tasa de préstamos (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="mt-1.5"
              value={state.bank.loanInterestRate}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  bank: { ...s.bank, loanInterestRate: Number(e.target.value) || 0 },
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">Mensual.</p>
          </div>
          <div>
            <Label>Tasa de ahorros (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="mt-1.5"
              value={state.bank.savingsInterestRate}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  bank: { ...s.bank, savingsInterestRate: Number(e.target.value) || 0 },
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">Mensual pagada al ahorrista.</p>
          </div>
        </div>

        <div>
          <Label>Precio de la acción (S/)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            className="mt-1.5 max-w-[200px]"
            value={state.bank.mainStockPrice}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                bank: { ...s.bank, mainStockPrice: Number(e.target.value) || 0 },
              }))
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            Capital social = nº acciones × precio de acción.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
