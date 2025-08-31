"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AssemblyState {
  isActive: boolean;
  currentStep: number;
  totalTime: number;
  stepStartTime: number | null;
  attendees: any[];
  assemblySteps: AssemblyStep[];
}

interface AssemblyStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface AssemblyContextType {
  assemblyState: AssemblyState;
  startAssembly: () => void;
  endAssembly: () => void;
  setCurrentStep: (step: number) => void;
  updateTotalTime: (time: number) => void;
  updateAttendees: (attendees: any[]) => void;
  getStepStatus: (stepId: number) => 'pending' | 'active' | 'completed';
  progressPercentage: number;
}

const AssemblyContext = createContext<AssemblyContextType | undefined>(undefined);

const initialAssemblySteps = [
  {
    id: 1,
    title: "Inicio de Reunión y Llamado de Lista",
    description: "Iniciar la asamblea y verificar la asistencia de los miembros",
    status: 'pending' as const
  },
  {
    id: 2,
    title: "Revisar Agenda y Lectura del Acta Anterior",
    description: "Presentar agenda actual y revisar acta de la reunión anterior",
    status: 'pending' as const
  },
  {
    id: 3,
    title: "Aporte de Compra de Acciones",
    description: "Procesar compras de acciones por parte de los miembros",
    status: 'pending' as const
  },
  {
    id: 4,
    title: "Recolectar Ahorros",
    description: "Recibir depósitos de ahorro de los miembros",
    status: 'pending' as const
  },
  {
    id: 6,
    title: "Aplicación a Créditos y Evaluación",
    description: "Procesar solicitudes de crédito y evaluar candidatos",
    status: 'pending' as const
  },
  {
    id: 7,
    title: "Decisiones y Proceso de Documentación",
    description: "Documentar decisiones tomadas y acuerdos alcanzados",
    status: 'pending' as const
  },
  {
    id: 8,
    title: "Llamado de Lista y Terminar Reunión",
    description: "Finalizar asamblea con acta de todo lo realizado",
    status: 'pending' as const
  }
];

const initialState: AssemblyState = {
  isActive: false,
  currentStep: 1,
  totalTime: 0,
  stepStartTime: null,
  attendees: [],
  assemblySteps: initialAssemblySteps
};

export function AssemblyProvider({ children }: { children: ReactNode }) {
  const [assemblyState, setAssemblyState] = useState<AssemblyState>(initialState);

  const startAssembly = () => {
    setAssemblyState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 1,
      totalTime: 0,
      stepStartTime: Date.now(),
      assemblySteps: prev.assemblySteps.map(step => ({
        ...step,
        status: step.id === 1 ? 'active' : 'pending'
      }))
    }));
  };

  const endAssembly = () => {
    setAssemblyState(initialState);
  };

  const setCurrentStep = (step: number) => {
    setAssemblyState(prev => ({
      ...prev,
      currentStep: step,
      stepStartTime: Date.now(),
      assemblySteps: prev.assemblySteps.map(stepItem => ({
        ...stepItem,
        status: stepItem.id < step ? 'completed' : 
                stepItem.id === step ? 'active' : 'pending'
      }))
    }));
  };

  const updateTotalTime = (time: number) => {
    setAssemblyState(prev => ({
      ...prev,
      totalTime: time
    }));
  };

  const updateAttendees = (attendees: any[]) => {
    setAssemblyState(prev => ({
      ...prev,
      attendees
    }));
  };

  const getStepStatus = (stepId: number): 'pending' | 'active' | 'completed' => {
    if (stepId < assemblyState.currentStep) return 'completed';
    if (stepId === assemblyState.currentStep) return 'active';
    return 'pending';
  };

  const progressPercentage = (assemblyState.currentStep / assemblyState.assemblySteps.length) * 100;

  const value: AssemblyContextType = {
    assemblyState,
    startAssembly,
    endAssembly,
    setCurrentStep,
    updateTotalTime,
    updateAttendees,
    getStepStatus,
    progressPercentage
  };

  return (
    <AssemblyContext.Provider value={value}>
      {children}
    </AssemblyContext.Provider>
  );
}

export function useAssembly() {
  const context = useContext(AssemblyContext);
  if (context === undefined) {
    throw new Error("useAssembly must be used within an AssemblyProvider");
  }
  return context;
} 