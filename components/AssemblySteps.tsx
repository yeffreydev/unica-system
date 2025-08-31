"use client";

import { useAssembly } from "@/context/AssemblyContext";
import { CheckCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AssemblySteps() {
  const { assemblyState, getStepStatus, setCurrentStep } = useAssembly();

  if (!assemblyState.isActive) {
    return null;
  }

  return (
    <div className="bg-background border-b border-border">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Pasos de la Asamblea</h3>
          <Badge variant="outline" className="text-xs">
            {assemblyState.currentStep} de {assemblyState.assemblySteps.length}
          </Badge>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {assemblyState.assemblySteps.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all min-w-0 flex-shrink-0 ${
                  status === 'active'
                    ? 'bg-primary/10 border border-primary/20'
                    : status === 'completed'
                    ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-muted/50 hover:bg-muted border border-transparent'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="flex-shrink-0">
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className={`w-4 h-4 ${
                      status === 'active' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-medium truncate ${
                    status === 'active' ? 'text-primary' : 
                    status === 'completed' ? 'text-green-700 dark:text-green-400' : 
                    'text-foreground'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-32">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 