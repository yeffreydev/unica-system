"use client";

import { assemblySteps, IAssemblyStep } from "@/app/(app)/assembly/steps";
import { createContext, useContext, useState, ReactNode } from "react";

interface AssemblyState {
  isActive: boolean;
  currentStep: number;
  totalTime: number;
  stepStartTime: number | null;
  attendees: any[];
  assemblySteps: IAssemblyStep[];
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

const initialAssemblySteps: IAssemblyStep[] = Array.from(assemblySteps);

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