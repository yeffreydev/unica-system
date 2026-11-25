"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import {
  OnboardingContextValue,
  OnboardingCtx,
  initialState,
} from "@/app/start/OnboardingProvider";
import { OnboardingState, STEPS, StepId } from "@/app/start/types";
import { commitHistory } from "./commit";
import {
  HistoryRecord,
  HistoryStatus,
  finalizeHistory,
  getHistory,
  saveHistoryDraft,
} from "./api";

/** El historial arranca en la fecha de corte: la comunidad y los socios ya existen. */
export const HISTORY_STEPS = STEPS.slice(STEPS.findIndex((s) => s.id === "cutoff"));
const FIRST_STEP: StepId = HISTORY_STEPS[0].id;
const AUTOSAVE_MS = 1200;

export interface HistoryMeta {
  status: HistoryStatus | "LOADING" | "ERROR";
  finalizedAt: string | null;
  error?: string;
}

export function HistoryProvider({
  children,
  onMeta,
}: {
  children: React.ReactNode;
  onMeta: (meta: HistoryMeta) => void;
}) {
  const { users, bank } = useContext(AppContext);
  const [state, setRaw] = useState<OnboardingState>({ ...initialState, unicaMode: "antigua" });
  const [currentStep, setCurrentStep] = useState<StepId>(FIRST_STEP);
  const [status, setStatus] = useState<HistoryMeta["status"]>("LOADING");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const posted = useRef<string[]>([]);
  const loaded = useRef(false);
  const readOnly = status === "FINALIZED";

  const apply = useCallback(
    (rec: HistoryRecord) => {
      if (rec.data?.state) {
        setRaw({ ...initialState, ...rec.data.state, unicaMode: "antigua" });
        if (rec.data.currentStep && HISTORY_STEPS.some((s) => s.id === rec.data!.currentStep)) {
          setCurrentStep(rec.data.currentStep);
        }
      }
      posted.current = rec.data?.posted ?? [];
      if (rec.updatedAt) setSavedAt(new Date(rec.updatedAt).getTime());
      setStatus(rec.status);
      onMeta({ status: rec.status, finalizedAt: rec.finalizedAt });
    },
    [onMeta]
  );

  useEffect(() => {
    getHistory()
      .then((rec) => {
        apply(rec);
        loaded.current = true;
      })
      .catch((e) => {
        console.error(e);
        setStatus("ERROR");
        onMeta({ status: "ERROR", finalizedAt: null, error: "No se pudo cargar el historial." });
      });
  }, [apply, onMeta]);

  // Mientras se edita, los socios y la configuración vienen del sistema (socios existentes).
  // Ya finalizado se muestra la foto guardada.
  useEffect(() => {
    if (readOnly || status === "LOADING") return;
    setRaw((s) => ({
      ...s,
      users,
      bank: {
        ...s.bank,
        name: bank.bank?.name ?? s.bank.name,
        loanInterestRate:
          bank.bank?.loanInterestRate != null
            ? Math.round(bank.bank.loanInterestRate * 10000) / 100
            : s.bank.loanInterestRate,
        savingsInterestRate:
          bank.bank?.savingsInterestRate != null
            ? Math.round(bank.bank.savingsInterestRate * 10000) / 100
            : s.bank.savingsInterestRate,
        mainStockPrice: bank.mainStock?.price || s.bank.mainStockPrice,
      },
    }));
  }, [users, bank, readOnly, status]);

  const payload = useCallback(
    (s: OnboardingState, step: StepId) => ({ state: s, currentStep: step, posted: posted.current }),
    []
  );

  const persist = useCallback(async () => {
    if (!loaded.current || readOnly) return;
    try {
      await saveHistoryDraft(payload(state, currentStep));
      setSavedAt(Date.now());
      if (status === "EMPTY") setStatus("DRAFT");
    } catch (e) {
      console.error("No se pudo guardar el borrador del historial", e);
    }
  }, [readOnly, payload, state, currentStep, status]);

  // Autoguardado en el servidor (con pausa para no mandar cada tecla).
  useEffect(() => {
    if (!loaded.current || readOnly || finishing) return;
    const t = setTimeout(persist, AUTOSAVE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, currentStep]);

  const idx = HISTORY_STEPS.findIndex((s) => s.id === currentStep);

  const finish = useCallback(async () => {
    if (readOnly || finishing) return;
    const ok = confirm(
      "¿Finalizar el historial?\n\nSe registrarán todos los montos con la fecha de corte y el historial quedará BLOQUEADO (solo lectura). No se podrá editar después."
    );
    if (!ok) return;
    setFinishing(true);
    try {
      await commitHistory(state, posted.current, async (done) => {
        posted.current = done;
        await saveHistoryDraft(payload(state, currentStep));
      });
      const rec = await finalizeHistory(payload(state, "reconciliation"));
      apply(rec);
      setCurrentStep("reconciliation");
      toast({ title: "Historial finalizado", description: "Quedó bloqueado en solo lectura." });
    } catch (e) {
      console.error(e);
      toast({
        title: "No se pudo finalizar",
        description:
          (e instanceof Error ? e.message : "Error desconocido") +
          " Lo ya registrado no se repetirá al reintentar.",
        variant: "destructive",
      });
    } finally {
      setFinishing(false);
    }
  }, [readOnly, finishing, state, currentStep, payload, apply]);

  const value: OnboardingContextValue = useMemo(
    () => ({
      state,
      setState: (updater) => {
        if (!readOnly) setRaw(updater);
      },
      steps: HISTORY_STEPS,
      mode: "antigua",
      setMode: () => {},
      currentStep,
      setCurrentStep,
      goNext: () => {
        const next = HISTORY_STEPS[idx + 1];
        if (next) setCurrentStep(next.id);
      },
      goPrev: () => {
        const prev = HISTORY_STEPS[idx - 1];
        if (prev) setCurrentStep(prev.id);
      },
      markComplete: (id) => {
        if (readOnly) return;
        setRaw((s) =>
          s.completedSteps.includes(id) ? s : { ...s, completedSteps: [...s.completedSteps, id] }
        );
      },
      resetAll: () => {
        if (readOnly || posted.current.length) {
          toast({
            title: "No se puede reiniciar",
            description: "Ya hay montos registrados de este historial.",
            variant: "destructive",
          });
          return;
        }
        setRaw((s) => ({ ...initialState, unicaMode: "antigua", users: s.users, bank: s.bank }));
        setCurrentStep(FIRST_STEP);
      },
      saveDraft: () => {
        void persist();
      },
      savedAt,
      finish,
      deferWrites: true,
      readOnly,
      finishLabel: "Finalizar y bloquear historial",
      finishing,
    }),
    [state, readOnly, currentStep, idx, savedAt, finish, finishing, persist]
  );

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>;
}
