"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  OnboardingState,
  StepDef,
  StepId,
  UnicaMode,
  getVisibleSteps,
} from "./types";
import { completeOnboarding } from "./api";

const STORAGE_KEY = "aquinace.onboarding.v1";

const todayPeru = () => {
  const now = new Date();
  const offset = -5 * 60;
  const t = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return t.toISOString().split("T")[0];
};

const initialState: OnboardingState = {
  unicaMode: "nueva",
  communityKind: "unica",
  communityKindOther: "",
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
  /** Pasos visibles según el estado de la comunidad (nueva: hasta socios). */
  steps: StepDef[];
  mode: UnicaMode;
  setMode: (mode: UnicaMode) => void;
  currentStep: StepId;
  setCurrentStep: (id: StepId) => void;
  goNext: () => void;
  goPrev: () => void;
  markComplete: (id: StepId) => void;
  resetAll: () => void;
  /** Guarda el borrador en localStorage al instante. */
  saveDraft: () => void;
  savedAt: number | null;
  /** Cierra el onboarding: limpia el borrador y entra al dashboard. */
  finish: () => Promise<void>;
}

const OnboardingCtx = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setRaw] = useState<OnboardingState>(initialState);
  const [currentStep, setCurrentStep] = useState<StepId>("bank");
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const steps = useMemo(() => getVisibleSteps(state.unicaMode), [state.unicaMode]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRaw({ ...initialState, ...parsed.state });
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.savedAt) setSavedAt(parsed.savedAt);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (s: OnboardingState, step: StepId, stamp: number | null) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: s, currentStep: step, savedAt: stamp })
      );
    },
    []
  );

  // Autoguardado del borrador en cada cambio.
  useEffect(() => {
    if (!hydrated) return;
    const stamp = Date.now();
    persist(state, currentStep, stamp);
    setSavedAt(stamp);
  }, [state, currentStep, hydrated, persist]);

  // Si vuelve a "nueva" estando en un paso del flujo largo, regresa al último visible.
  useEffect(() => {
    if (!steps.some((s) => s.id === currentStep)) {
      setCurrentStep(steps[steps.length - 1].id);
    }
  }, [steps, currentStep]);

  const setState = useCallback(
    (updater: (s: OnboardingState) => OnboardingState) => setRaw(updater),
    []
  );

  const setMode = useCallback(
    (mode: UnicaMode) => setRaw((s) => (s.unicaMode === mode ? s : { ...s, unicaMode: mode })),
    []
  );

  const idx = useMemo(
    () => steps.findIndex((s) => s.id === currentStep),
    [steps, currentStep]
  );

  const goNext = useCallback(() => {
    const next = steps[idx + 1];
    if (next) setCurrentStep(next.id);
  }, [steps, idx]);

  const goPrev = useCallback(() => {
    const prev = steps[idx - 1];
    if (prev) setCurrentStep(prev.id);
  }, [steps, idx]);

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
    setSavedAt(null);
  }, []);

  const saveDraft = useCallback(() => {
    const stamp = Date.now();
    persist(state, currentStep, stamp);
    setSavedAt(stamp);
  }, [persist, state, currentStep]);

  const finish = useCallback(async () => {
    // Si el POST falla igual entra: el gate volverá a mandar a /start hasta
    // que quede marcado, y el usuario ya guardó todo lo demás.
    try {
      await completeOnboarding();
    } catch (e) {
      console.error("No se pudo marcar el onboarding como terminado", e);
    }
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/";
  }, []);

  return (
    <OnboardingCtx.Provider
      value={{
        state,
        setState,
        steps,
        mode: state.unicaMode,
        setMode,
        currentStep,
        setCurrentStep,
        goNext,
        goPrev,
        markComplete,
        resetAll,
        saveDraft,
        savedAt,
        finish,
      }}
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
