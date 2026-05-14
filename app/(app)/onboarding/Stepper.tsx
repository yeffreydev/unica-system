"use client";

import { Check, Circle } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";
import { PHASE_LABELS, STEPS, StepDef } from "./types";
import { cn } from "@/lib/utils";

export function Stepper() {
  const { currentStep, setCurrentStep, state } = useOnboarding();

  const phases = Array.from(new Set(STEPS.map((s) => s.phase))) as StepDef["phase"][];

  return (
    <nav className="space-y-6">
      {phases.map((phase) => {
        const stepsInPhase = STEPS.filter((s) => s.phase === phase);
        return (
          <div key={phase}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
              {PHASE_LABELS[phase]}
            </p>
            <div className="space-y-0.5">
              {stepsInPhase.map((step) => {
                const isActive = currentStep === step.id;
                const isDone = state.completedSteps.includes(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-lg transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {isDone ? (
                      <Check className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-emerald-500")} />
                    ) : (
                      <Circle
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-primary-foreground" : "text-muted-foreground/40"
                        )}
                      />
                    )}
                    <span className="truncate">{step.shortTitle}</span>
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
