"use client";

import { Check } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";
import { PHASE_LABELS, StepDef } from "./types";
import { cn } from "@/lib/utils";

export function Stepper() {
  const { currentStep, setCurrentStep, state, steps } = useOnboarding();

  const phases = Array.from(new Set(steps.map((s) => s.phase))) as StepDef["phase"][];

  return (
    <nav className="space-y-5">
      {phases.map((phase) => {
        const stepsInPhase = steps.filter((s) => s.phase === phase);
        return (
          <div key={phase}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              {PHASE_LABELS[phase]}
            </p>
            <div className="relative space-y-0.5">
              {/* línea que conecta los pasos de la fase */}
              <span className="absolute left-[22px] top-3 bottom-3 w-px bg-border/70" aria-hidden />
              {stepsInPhase.map((step) => {
                const isActive = currentStep === step.id;
                const isDone = state.completedSteps.includes(step.id);
                const number = steps.findIndex((s) => s.id === step.id) + 1;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "relative w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-[9px] font-bold tabular-nums transition-colors",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground/70"
                      )}
                    >
                      {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : number}
                    </span>
                    <span className="truncate">{step.shortTitle}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
