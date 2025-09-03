'use client'
import { useAssembly } from "@/context/AssemblyContext";
import { assemblySteps } from "../steps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function StepLayout({ children }: { children: React.ReactNode }) {
    const { 
        assemblyState, 
        startAssembly, 
        endAssembly, 
        setCurrentStep, 
      } = useAssembly();


  const handleNextStep = () => {
    if (assemblyState.currentStep < assemblySteps.length) {
      setCurrentStep(assemblyState.currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (assemblyState.currentStep > 1) {
      setCurrentStep(assemblyState.currentStep - 1);
    }
  };

  const handleStartAssembly = () => {
    startAssembly();
  };
  const progress = Math.round((assemblyState.currentStep / 8) * 100);

  const currentStepData = assemblySteps.find(step => step.id === assemblyState.currentStep);

    return <div className="flex gap-6">
    {/* Left Circular Stepper */}
    <aside className="hidden md:flex flex-col items-center pt-2">
      {assemblySteps.map((step) => {
        const isDone = step.id < assemblyState.currentStep;
        const isActive = step.id === assemblyState.currentStep;
        return (
          <div key={step.id} className="flex flex-col items-center">
            {step.id !== 1 && (
              <div
                className={`w-px h-6 ${isDone || isActive ? 'bg-primary' : 'bg-border'}`}
              />
            )}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border text-sm font-semibold transition-colors
                ${isActive ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30' : ''}
                ${isDone ? 'bg-primary/80 text-primary-foreground border-primary/60' : ''}
                ${!isActive && !isDone ? 'bg-muted text-muted-foreground border-border' : ''}
              `}
              title={step.title}
            >
              {step.id}
            </div>
          </div>
        );
      })}
    </aside>

    {/* Right Content */}
    <div className="flex-1 space-y-6">
      {/* Current Step Content */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {currentStepData?.icon && <currentStepData.icon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {assemblyState.currentStep}
                </span>
                <CardTitle className="text-lg font-semibold tracking-tight truncate">
                  {currentStepData?.title}
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground leading-snug">
                {currentStepData?.description}
              </CardDescription>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between mb-1 text-[11px] text-muted-foreground">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full">
              <div className="h-1.5 bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={assemblyState.currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <div className="flex space-x-2">
              {assemblyState.currentStep === assemblySteps.length ? (
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    alert('¡Asamblea completada exitosamente!');
                    endAssembly();
                  }}
                >
                  Finalizar Asamblea
                </Button>
              ) : (
                <Button 
                  onClick={handleNextStep}
                  className="flex items-center space-x-2"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Tools */}
      <div>
        {children}
      </div>
    </div>
  </div>
}