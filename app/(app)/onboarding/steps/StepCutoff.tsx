"use client";

import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "../OnboardingProvider";
import { StepShell } from "../components/StepShell";

export function StepCutoff() {
  const { state, setState } = useOnboarding();

  return (
    <StepShell
      stepId="cutoff"
      title="Fecha de corte"
      description="Selecciona la fecha hasta la cual quieres cargar la data acumulada (ingresos, egresos, depósitos, préstamos, etc)."
    >
      <div className="max-w-md">
        <div className="rounded-lg border border-border p-5 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Hasta esta fecha se regulariza la data</h2>
          </div>
          <Label className="text-xs">Fecha de corte</Label>
          <Input
            type="date"
            className="mt-1.5"
            value={state.cutoffDate}
            onChange={(e) => setState((s) => ({ ...s, cutoffDate: e.target.value }))}
            max={new Date().toISOString().split("T")[0]}
          />
          <p className="text-xs text-muted-foreground mt-3">
            Todas las transacciones acumuladas que ingreses en los siguientes pasos quedarán
            registradas con esta fecha.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
