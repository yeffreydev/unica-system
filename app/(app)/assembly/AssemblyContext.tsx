"use client";

import { assemblySteps, IAssemblyStep } from "@/app/(app)/assembly/steps";
import { IAssemblySchedule } from "@/app/(app)/assembly/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiGetAssemblySchedule, apiStartAssemblySchedule } from "./api";
import { useRouter } from "next/navigation";

interface AssemblyState {
  isActive: boolean;
  currentStep: number;
  totalTime: number;
  stepStartTime: number | null;

  assemblySteps: IAssemblyStep[];
}


interface AssemblyContextType {
  assemblyState: AssemblyState;
  assembly: IAssemblySchedule | null;
  startAssembly: () => void;
  endAssembly: () => void;
  setCurrentStep: (step: number) => void;
  updateTotalTime: (time: number) => void;
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
  assemblySteps: initialAssemblySteps
};

export function AssemblyProvider({ children }: { children: ReactNode }) {
  const [assemblyState, setAssemblyState] = useState<AssemblyState>(initialState);
  const [assembly, setAssembly] = useState<IAssemblySchedule | null>(null);
  const router = useRouter();

  const startAssembly = async() => {
   const res = await apiStartAssemblySchedule();
    if (res.statusText === "OK") {
      //got to page
          router.push("/assembly/live");
    }
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



  const getStepStatus = (stepId: number): 'pending' | 'active' | 'completed' => {
    if (stepId < assemblyState.currentStep) return 'completed';
    if (stepId === assemblyState.currentStep) return 'active';
    return 'pending';
  };

  const progressPercentage = (assemblyState.currentStep / assemblyState.assemblySteps.length) * 100;

  const value: AssemblyContextType = {
    assembly, // Aquí podrías cargar datos reales desde un backend si es necesario
    assemblyState,
    startAssembly,
    endAssembly,
    setCurrentStep,
    updateTotalTime,
    getStepStatus,
    progressPercentage
  };

  useEffect(() => {
    // Aquí podrías cargar datos reales desde un backend si es necesario
    const fetchAssemblyData = async () => {
      const data = await apiGetAssemblySchedule();
      console.log(data);
      setAssembly(data);
    };

    fetchAssemblyData();
  }, []);

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