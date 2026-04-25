'use client'
import { useAssembly } from "@/app/(app)/assembly/AssemblyContext";
import { assemblySteps } from "../steps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function StepLayout({ children }: { children: React.ReactNode }) {
    const {
        assemblyState,
        assembly,
        cashBalance,
        endAssembly,
        setCurrentStep,
      } = useAssembly();

    const router = useRouter();
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const handleFinalizeAssembly = () => {
      setConfirmModalOpen(true);
    };

    const confirmFinalizeAssembly = async () => {
      if (!assembly?.lastRun?.id) {
        toast({
          title: "Error",
          description: "No se encontró la asamblea activa.",
          variant: "destructive",
        });
        return;
      }

      setIsFinishing(true);
      try {
        await endAssembly(assembly.lastRun.id);
        setConfirmModalOpen(false);
        
        // Show success modal briefly before redirecting
        setTimeout(() => {
          router.push('/assembly');
        }, 1500);
      } catch (error) {
        console.error('Error finishing assembly:', error);
        toast({
          title: "Error",
          description: "No se pudo finalizar la asamblea. Intenta de nuevo.",
          variant: "destructive",
        });
        setIsFinishing(false);
      }
    };


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


  // const handleStartAssembly = () => {
  //   startAssembly();
  // };
  const progress = Math.round((assemblyState.currentStep / assemblySteps.length) * 100);

  const currentStepData = assemblySteps.find(step => step.id === assemblyState.currentStep);

    return <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 py-2 sm:py-4">
    {/* Vertical stepper — desktop only */}
    <aside className="hidden lg:flex flex-col items-center pt-2 shrink-0">
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
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border text-sm font-semibold transition-colors cursor-pointer
                ${isActive ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30' : ''}
                ${isDone ? 'bg-primary/80 text-primary-foreground border-primary/60' : ''}
                ${!isActive && !isDone ? 'bg-muted text-muted-foreground border-border hover:border-primary/40' : ''}
              `}
              title={step.title}
            >
              {step.id}
            </button>
          </div>
        );
      })}
    </aside>

    {/* Horizontal stepper — mobile/tablet */}
    <div className="lg:hidden -mx-1 overflow-x-auto pb-2">
      <div className="flex items-center gap-1 min-w-max px-1">
        {assemblySteps.map((step, idx) => {
          const isDone = step.id < assemblyState.currentStep;
          const isActive = step.id === assemblyState.currentStep;
          return (
            <div key={step.id} className="flex items-center gap-1">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] h-14 px-2 rounded-lg border text-[10px] font-medium transition-colors
                  ${isActive ? 'bg-primary text-primary-foreground border-primary' : ''}
                  ${isDone ? 'bg-primary/15 text-primary border-primary/30' : ''}
                  ${!isActive && !isDone ? 'bg-muted/40 text-muted-foreground border-border' : ''}
                `}
                title={step.title}
              >
                <span className="text-sm font-bold">{step.id}</span>
                <span className="truncate max-w-[60px]">{step.title}</span>
              </button>
              {idx < assemblySteps.length - 1 && (
                <div className={`h-px w-3 ${isDone ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* Right Content */}
    <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
      {/* Current Step Content */}
      <Card>
        <CardHeader className="py-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
              {currentStepData?.icon && <currentStepData.icon className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                  {assemblyState.currentStep}
                </span>
                <CardTitle className="text-base sm:text-lg font-semibold tracking-tight truncate">
                  {currentStepData?.title}
                </CardTitle>
              </div>
              {currentStepData?.description && (
                <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-snug mt-0.5">
                  {currentStepData.description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between mb-1 text-[11px] text-muted-foreground">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={assemblyState.currentStep === 1}
              className="w-full sm:w-auto gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <div className="flex sm:space-x-2">
              {assemblyState.currentStep === assemblySteps.length ? (
                <Button
                  variant="default"
                  onClick={handleFinalizeAssembly}
                  className="w-full sm:w-auto"
                >
                  Finalizar Asamblea
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  className="w-full sm:w-auto gap-2"
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/10">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              ¿Finalizar Asamblea?
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Estás a punto de finalizar la asamblea. Esta acción marcará la asamblea como completada y no podrás realizar más cambios.
            </DialogDescription>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">
                ¿Estás seguro de continuar?
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setConfirmModalOpen(false)}
              disabled={isFinishing}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmFinalizeAssembly}
              disabled={isFinishing}
              className="w-full sm:w-auto"
            >
              {isFinishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalizar Asamblea
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
}