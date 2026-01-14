'use client'
import { useAssembly } from "@/app/(app)/assembly/AssemblyContext";
import { assemblySteps } from "../steps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Wallet, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function StepLayout({ children }: { children: React.ReactNode }) {
    const {
        assemblyState,
        assembly,
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

    return <div className="flex gap-6 py-4">
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
        <CardHeader className="py-4">
          {/* Balance Display */}
          <div className="relative border rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-background to-muted/30 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Balance Actual
                    </div>
                    <div className="text-xs text-muted-foreground/80">
                      Fondos disponibles
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl tabular-nums tracking-tight mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    S/ 125,450
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-medium">En vivo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                  onClick={handleFinalizeAssembly}
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center ring-4 ring-green-500/10">
              <CheckCircle className="w-8 h-8 text-green-600" />
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
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
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