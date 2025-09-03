import { CircleDot, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AssemblyProgressBannerProps {
  assemblyState: {
    isActive: boolean;
    currentStep: number;
  };
  elapsed: string;
  totalSteps: number;
  currentStepMeta?: {
    title?: string;
    description?: string;
  };
}

export function AssemblyProgressBanner({
  assemblyState,
  elapsed,
  totalSteps,
  currentStepMeta,
}: AssemblyProgressBannerProps) {
  

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                <CircleDot className="h-3.5 w-3.5 animate-pulse" />
                En curso
              </span>
              <span className="text-xs text-muted-foreground">Asamblea</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tiempo transcurrido</div>
              <div className="text-xl font-bold text-foreground tabular-nums">{elapsed}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">Paso {assemblyState.currentStep} de {totalSteps}</div>
              <div className="text-lg md:text-xl font-semibold text-foreground truncate">{currentStepMeta?.title}</div>
              <div className="text-xs text-muted-foreground truncate">{currentStepMeta?.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/assembly/${assemblyState.currentStep}`}>
                <Button className="gap-2">
                  <PlayCircle className="h-4 w-4" /> Ir al paso actual
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={Math.round((assemblyState.currentStep / totalSteps) * 100)} />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Progreso de la asamblea</span>
              <span>{Math.round((assemblyState.currentStep / totalSteps) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}