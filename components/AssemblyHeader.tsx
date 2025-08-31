"use client";

import { useAssembly } from "@/context/AssemblyContext";
import { Clock} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function AssemblyHeader() {
  const { assemblyState, progressPercentage } = useAssembly();

  if (!assemblyState.isActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStep = assemblyState.assemblySteps.find(step => step.id === assemblyState.currentStep);

  return (
    <div className="bg-background border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Assembly Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold text-lg text-foreground">
                {formatTime(assemblyState.totalTime)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Paso {assemblyState.currentStep} de {assemblyState.assemblySteps.length}
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Progreso:</span>
              <Badge variant="secondary" className="text-sm">
                {Math.round(progressPercentage)}%
              </Badge>
            </div>
            <div className="w-32">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Current Step */}
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {currentStep?.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentStep?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 