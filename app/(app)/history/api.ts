import apiClient from "@/config/apiClient";
import { OnboardingState, StepId } from "@/app/start/types";

export type HistoryStatus = "EMPTY" | "DRAFT" | "FINALIZED";

/** Lo que se guarda en el servidor: el estado de los pasos y qué secciones ya se registraron. */
export interface HistoryData {
  state: OnboardingState;
  currentStep?: StepId;
  /** Secciones ya enviadas al finalizar; evita duplicar si hay que reintentar. */
  posted?: string[];
}

export interface HistoryRecord {
  status: HistoryStatus;
  data: HistoryData | null;
  finalizedAt: string | null;
  finalizedBy: string | null;
  updatedAt: string | null;
}

export async function getHistory() {
  const res = await apiClient.get<HistoryRecord>("/history");
  return res.data;
}

export async function saveHistoryDraft(data: HistoryData) {
  const res = await apiClient.put<HistoryRecord>("/history", { data });
  return res.data;
}

export async function finalizeHistory(data: HistoryData) {
  const res = await apiClient.post<HistoryRecord>("/history/finalize", { data });
  return res.data;
}
