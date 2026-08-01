"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { OnboardingState, STEPS, StepId } from "./types";

const STORAGE_KEY = "aquinace.onboarding.v1";

const todayPeru = () => {
  const now = new Date();
  const offset = -5 * 60;
  const t = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return t.toISOString().split("T")[0];
};

const initialState: OnboardingState = {
  bank: { name: "", loanInterestRate: 2, savingsInterestRate: 1, mainStockPrice: 10 },
  frequency: {
    frequencyType: "simple",
    dayOfMonth: 15,
    weekOccurrence: null,
    weekDay: null,
    hour: 10,
    minute: 0,
  },
  users: [],
  cutoffDate: todayPeru(),
  shares: {},
  otherIncomes: [],
  capitalPaid: {},
  interestPaid: {},
  deposits: {},
  legalReserve: 0,
  socialFund: 0,
  withdrawals: {},
  dividends: {},
  loans: {},
  loanTypeId: null,
  savingsInterest: {},
  administrative: [],
  cashReal: 0,
  completedSteps: [],
};

interface Ctx {
  state: OnboardingState;
  setState: (updater: (s: OnboardingState) => OnboardingState) => void;
  currentStep: StepId;
  setCurrentStep: (id: StepId) => void;
  goNext: () => void;
  goPrev: () => void;
  markComplete: (id: StepId) => void;
  resetAll: () => void;
}

const OnboardingCtx = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setRaw] = useState<OnboardingState>(initialState);
  const [currentStep, setCurrentStep] = useState<StepId>("bank");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRaw({ ...initialState, ...parsed.state });
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state, currentStep })
    );
  }, [state, currentStep, hydrated]);

  const setState = useCallback(
    (updater: (s: OnboardingState) => OnboardingState) => setRaw(updater),
    []
  );

  const idx = useMemo(
    () => STEPS.findIndex((s) => s.id === currentStep),
    [currentStep]
  );

  const goNext = useCallback(() => {
    const next = STEPS[idx + 1];
    if (next) setCurrentStep(next.id);
  }, [idx]);

  const goPrev = useCallback(() => {
    const prev = STEPS[idx - 1];
    if (prev) setCurrentStep(prev.id);
  }, [idx]);

  const markComplete = useCallback((id: StepId) => {
    setRaw((s) =>
      s.completedSteps.includes(id)
        ? s
        : { ...s, completedSteps: [...s.completedSteps, id] }
    );
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRaw(initialState);
    setCurrentStep("bank");
  }, []);

  return (
    <OnboardingCtx.Provider
      value={{ state, setState, currentStep, setCurrentStep, goNext, goPrev, markComplete, resetAll }}
    >
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}
