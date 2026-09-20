"use client";

import { ChevronLeft, ChevronRight, Info, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../OnboardingProvider";
import { PHASE_LABELS, StepId } from "../types";

interface Props {
  stepId: StepId;
  title: string;
  description?: string;
  /** Tip corto que se muestra bajo el encabezado. */
  tip?: string;
  onNext?: () => Promise<void> | void;
  saving?: boolean;
  nextLabel?: string;
  hideNext?: boolean;
  hidePrev?: boolean;
  children: React.ReactNode;
}

export function StepShell({
  stepId,
  title,
  description,
  tip,
  onNext,
  saving,
  nextLabel,
  hideNext,
  hidePrev,
  children,
}: Props) {
  const { goPrev, goNext, markComplete, steps, finish } = useOnboarding();
  const idx = steps.findIndex((s) => s.id === stepId);
  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const pct = Math.round(((idx + 1) / steps.length) * 100);

  const handleNext = async () => {
    if (onNext) await onNext();
    markComplete(stepId);
    if (isLast) await finish();
    else goNext();
  };

  const label = nextLabel ?? (isLast ? "Empezar con Aquí Nace" : "Guardar y continuar");

  return (
    <div className="flex flex-col h-full">
      <div className="pb-5 mb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          {step && (
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {PHASE_LABELS[step.phase]}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground tabular-nums">
            Paso {idx + 1} de {steps.length}
          </span>
          <div className="ml-auto hidden sm:flex items-center gap-2 w-32">
            <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{pct}%</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
        {tip && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 max-w-2xl">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-6 pr-1">{children}</div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5 mt-auto">
        {hidePrev || idx === 0 ? (
          <div />
        ) : (
          <Button variant="ghost" onClick={goPrev} disabled={saving}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Volver
          </Button>
        )}
        {!hideNext && (
          <Button onClick={handleNext} disabled={saving} size="lg" className="shadow-sm">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {label}
            {!saving &&
              (isLast ? (
                <Rocket className="ml-1.5 h-4 w-4" />
              ) : (
                <ChevronRight className="ml-1 h-4 w-4" />
              ))}
          </Button>
        )}
      </div>
    </div>
  );
}
