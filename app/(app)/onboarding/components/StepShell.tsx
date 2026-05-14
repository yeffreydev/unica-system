"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../OnboardingProvider";
import { STEPS, StepId } from "../types";

interface Props {
  stepId: StepId;
  title: string;
  description?: string;
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
  onNext,
  saving,
  nextLabel = "Guardar y continuar",
  hideNext,
  hidePrev,
  children,
}: Props) {
  const { goPrev, goNext, markComplete } = useOnboarding();
  const idx = STEPS.findIndex((s) => s.id === stepId);
  const isLast = idx === STEPS.length - 1;

  const handleNext = async () => {
    if (onNext) await onNext();
    markComplete(stepId);
    if (!isLast) goNext();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border pb-5 mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Paso {idx + 1} de {STEPS.length}
        </p>
        <h1 className="text-2xl font-bold text-foreground mt-1">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-6 pr-1">{children}</div>

      <div className="flex items-center justify-between border-t border-border pt-5 mt-auto">
        {hidePrev || idx === 0 ? (
          <div />
        ) : (
          <Button variant="outline" onClick={goPrev} disabled={saving}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Volver
          </Button>
        )}
        {!hideNext && (
          <Button onClick={handleNext} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {nextLabel}
            {!saving && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
