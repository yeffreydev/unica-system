"use client";

import { 
  ChevronRight, 
  ChevronLeft,
  Users,
  FileText,
  TrendingUp,
  PiggyBank,
  CreditCard,
  ClipboardCheck,
  FileCheck,
  Flag,
  Landmark,
  CalendarDays,
  Clock,
  CheckCircle2,
  BarChart3,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { AssemblyTimer } from "@/components/AssemblyTimer";
import { useAssembly } from "@/context/AssemblyContext";

interface AssemblyStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details?: string[];
}

export default function Assembly() {
  const { 
    assemblyState, 
    startAssembly, 
    endAssembly, 
    setCurrentStep, 
    updateAttendees 
  } = useAssembly();

  // Simple historical data mock for the summary section
  type PastAssembly = {
    date: string;
    attendees: number;
    durationMin: number;
    approvedItems: number;
    savings: number; // total savings collected
    purchases: number; // total shares purchases
  };

  const pastAssemblies: PastAssembly[] = [
    { date: "2024-06-10", attendees: 38, durationMin: 90, approvedItems: 11, savings: 13250, purchases: 2800 },
    { date: "2024-07-15", attendees: 42, durationMin: 105, approvedItems: 14, savings: 15800, purchases: 3600 },
    { date: "2024-08-20", attendees: 40, durationMin: 98, approvedItems: 12, savings: 14950, purchases: 3250 }
  ];

  const totalAssemblies = pastAssemblies.length;
  const avgAttendees = Math.round(pastAssemblies.reduce((a, b) => a + b.attendees, 0) / Math.max(totalAssemblies, 1));
  const avgDuration = Math.round(pastAssemblies.reduce((a, b) => a + b.durationMin, 0) / Math.max(totalAssemblies, 1));
  const totalSavings = pastAssemblies.reduce((a, b) => a + b.savings, 0);
  const totalPurchases = pastAssemblies.reduce((a, b) => a + b.purchases, 0);

  const progress = Math.round((assemblyState.currentStep / 8) * 100);

  // Próxima asamblea (puedes conectar esto a tu backend luego)
  const upcomingDate = new Date("2025-09-15T19:00:00");
  const now = new Date();
  const msUntil = Math.max(upcomingDate.getTime() - now.getTime(), 0);
  const daysUntil = Math.floor(msUntil / (1000 * 60 * 60 * 24));
  const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60)) % 24;
  const upcomingDateLabel = upcomingDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const upcomingTimeLabel = upcomingDate.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const assemblySteps: AssemblyStep[] = [
    {
      id: 1,
      title: "Inicio de Reunión y Llamado de Lista",
      description: "Iniciar la asamblea y verificar la asistencia de los miembros",
      icon: <Users className="w-6 h-6" />,
      details: [
        "Verificar quórum mínimo",
        "Registrar asistencia de miembros",
        "Confirmar inicio de sesión"
      ]
    },
    {
      id: 2,
      title: "Revisar Agenda y Lectura del Acta Anterior",
      description: "Presentar agenda actual y revisar acta de la reunión anterior",
      icon: <FileText className="w-6 h-6" />,
      details: [
        "Presentar agenda del día",
        "Leer acta anterior",
        "Aprobar acta anterior"
      ]
    },
    {
      id: 3,
      title: "Aporte de Compra de Acciones",
      description: "Procesar compras de acciones por parte de los miembros",
      icon: <TrendingUp className="w-6 h-6" />,
      details: [
        "Registrar compras de acciones",
        "Actualizar capital social",
        "Emitir certificados"
      ]
    },
    {
      id: 4,
      title: "Recolectar Ahorros e Intereses",
      description: "Recibir depósitos de ahorro de los miembros",
      icon: <PiggyBank className="w-6 h-6" />,
      details: [
        "Recibir depósitos",
        "Actualizar saldos",
        "Emitir comprobantes"
      ]
    },
    
    {
      id: 5,
      title: "Aplicación a Créditos y Evaluación",
      description: "Procesar solicitudes de crédito y evaluar candidatos",
      icon: <ClipboardCheck className="w-6 h-6" />,
      details: [
        "Revisar solicitudes",
        "Evaluar capacidad de pago",
        "Tomar decisiones de aprobación"
      ]
    },
    {
      id: 6,
      title: "Decisiones y Proceso de Documentación",
      description: "Documentar decisiones tomadas y acuerdos alcanzados",
      icon: <FileCheck className="w-6 h-6" />,
      details: [
        "Documentar acuerdos",
        "Firmar documentos",
        "Archivar expedientes"
      ]
    },
    {
      id: 7,
      title: "Llamado de Lista y Terminar Reunión",
      description: "Finalizar asamblea con acta de todo lo realizado",
      icon: <Flag className="w-6 h-6" />,
      details: [
        "Hacer llamado final de lista",
        "Redactar acta de la reunión",
        "Cerrar sesión oficialmente"
      ]
    }
  ];

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

  const currentStepData = assemblySteps.find(step => step.id === assemblyState.currentStep);

  if (!assemblyState.isActive) {
    return (
      <div className="px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-10 py-8 flex flex-col gap-4">
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-primary" />
                Próxima Asamblea
              </CardTitle>
              <CardDescription>
                Mantente al tanto de la próxima reunión y prepárate con la agenda preliminar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-md border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Fecha</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{upcomingDateLabel}</div>
                  <div className="text-sm text-muted-foreground">{upcomingTimeLabel}</div>
                </div>
                <div className="rounded-md border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Cuenta regresiva</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">Faltan {daysUntil} días</div>
                  <div className="text-sm text-muted-foreground">y {hoursUntil} horas</div>
                </div>
                <div className="rounded-md border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Lugar</div>
                  <div className="mt-1 text-lg font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Sala Principal
                  </div>
                  <div className="text-sm text-muted-foreground">Sede Central</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Agenda preliminar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assemblySteps.slice(0, 4).map((step) => (
                    <div key={step.id} className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {step.icon}
                      </div>
                      <div className="text-sm text-foreground">{step.title}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={handleStartAssembly}
                  className="text-xs text-muted-foreground hover:text-primary underline"
                >
                  Iniciar ahora
                </button>
              </div>
            </CardContent>
          </Card>
        </div>


  {/* Historical Summary */}
        <div>
          
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Resumen Histórico</CardTitle>
            </div>
            <CardDescription>
              Indicadores basados en las últimas {totalAssemblies} asambleas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-md border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <CalendarDays className="w-4 h-4" />
                  Total asambleas
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{totalAssemblies}</div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Users className="w-4 h-4" />
                  Asistencia promedio
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{avgAttendees}</div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Clock className="w-4 h-4" />
                  Duración promedio
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{avgDuration} min</div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobaciones/Movimientos
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Ahorros: <span className="text-foreground font-medium">S/ {totalSavings.toLocaleString()}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Acciones: <span className="text-foreground font-medium">S/ {totalPurchases.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Últimas asambleas</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pastAssemblies.map((a) => (
                  <div key={a.date} className="rounded-md border bg-muted/40 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        {a.date}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.attendees} asistentes</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Duración: <span className="text-foreground font-medium">{a.durationMin} min</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Aprobados: <span className="text-foreground font-medium">{a.approvedItems}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-10 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-6">
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
                    {currentStepData?.icon}
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
              {assemblyState.currentStep === 1 && (
                <AttendanceTracker onAttendanceUpdate={updateAttendees} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
