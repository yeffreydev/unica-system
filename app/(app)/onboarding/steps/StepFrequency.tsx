"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../OnboardingProvider";
import { saveFrequency } from "../api";
import { StepShell } from "../components/StepShell";

const weekOccurrences = [
  { value: "first", label: "Primero" },
  { value: "second", label: "Segundo" },
  { value: "third", label: "Tercero" },
  { value: "fourth", label: "Cuarto" },
  { value: "last", label: "Último" },
];
const weekDays = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export function StepFrequency() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const f = state.frequency;

  const set = (patch: Partial<typeof f>) =>
    setState((s) => ({ ...s, frequency: { ...s.frequency, ...patch } }));

  const onNext = async () => {
    setSaving(true);
    try {
      await saveFrequency(f);
      toast({ title: "Frecuencia guardada" });
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
      stepId="frequency"
      title="Frecuencia de la asamblea"
      description="Define cada cuándo se realiza la asamblea ordinaria."
      onNext={onNext}
      saving={saving}
    >
      <div className="space-y-5 max-w-xl">
        <div>
          <Label>Tipo de frecuencia</Label>
          <Select value={f.frequencyType} onValueChange={(v) => set({ frequencyType: v as any })}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Mensual simple (día fijo)</SelectItem>
              <SelectItem value="advanced">Avanzado (semana del mes)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {f.frequencyType === "simple" ? (
          <div>
            <Label>Día del mes</Label>
            <Select
              value={String(f.dayOfMonth ?? "")}
              onValueChange={(v) => set({ dayOfMonth: Number(v) })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Día" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ocurrencia</Label>
              <Select
                value={f.weekOccurrence ?? ""}
                onValueChange={(v) => set({ weekOccurrence: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Ej: Primero" />
                </SelectTrigger>
                <SelectContent>
                  {weekOccurrences.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Día de la semana</Label>
              <Select value={f.weekDay ?? ""} onValueChange={(v) => set({ weekDay: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Ej: Sábado" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-xs">
          <div>
            <Label>Hora</Label>
            <Select value={String(f.hour)} onValueChange={(v) => set({ hour: Number(v) })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {String(h).padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Minutos</Label>
            <Select value={String(f.minute)} onValueChange={(v) => set({ minute: Number(v) })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {String(m).padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </StepShell>
  );
}
