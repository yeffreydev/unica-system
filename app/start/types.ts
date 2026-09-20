import { IUser } from "@/types/IUser";

export type FrequencyType = "simple" | "advanced";

/** "nueva": comunidad que arranca de cero. "antigua": ya viene operando y trae data acumulada. */
export type UnicaMode = "nueva" | "antigua";

/** Solo aplica a comunidades que ya venían funcionando. */
export type CommunityKind = "unica" | "banquito" | "otro";

export const COMMUNITY_KIND_LABELS: Record<CommunityKind, string> = {
  unica: "úNICA (Unión de Crédito y Ahorro)",
  banquito: "Banquito comunal",
  otro: "Otro tipo de comunidad",
};

export const COMMUNITY_KIND_HINTS: Record<CommunityKind, string> = {
  unica: "Socios que compran acciones, prestan entre ellos y reparten utilidades al cierre.",
  banquito: "Grupo de ahorro con fondo común, préstamos internos y aportes por ciclo.",
  otro: "Junta, cooperativa o cualquier grupo que ahorre y preste en conjunto.",
};

export interface OnboardingBank {
  name: string;
  loanInterestRate: number; // percent (0-100)
  savingsInterestRate: number; // percent
  mainStockPrice: number; // S/ por acción
}

export interface OnboardingFrequency {
  frequencyType: FrequencyType;
  dayOfMonth?: number | null;
  weekOccurrence?: string | null;
  weekDay?: string | null;
  hour: number;
  minute: number;
}

export interface FreeMoneyEntry {
  id: string;
  amount: number;
  description: string;
  userId?: string | null;
}

export interface LoanEntry {
  amount: number;
  months: number;
}

export interface OnboardingState {
  unicaMode: UnicaMode;
  /** Tipo de comunidad; solo se pregunta cuando ya venía funcionando. */
  communityKind: CommunityKind;
  /** Detalle libre cuando el tipo es "otro". */
  communityKindOther: string;
  bank: OnboardingBank;
  frequency: OnboardingFrequency;
  users: IUser[];
  cutoffDate: string; // yyyy-mm-dd
  shares: Record<string, number>;
  otherIncomes: FreeMoneyEntry[];
  capitalPaid: Record<string, number>;
  interestPaid: Record<string, number>;
  deposits: Record<string, number>;
  legalReserve: number;
  socialFund: number;
  withdrawals: Record<string, number>;
  dividends: Record<string, number>;
  loans: Record<string, LoanEntry>;
  loanTypeId: string | null;
  savingsInterest: Record<string, number>;
  administrative: FreeMoneyEntry[];
  cashReal: number;
  completedSteps: string[];
}

export type StepId =
  | "bank"
  | "frequency"
  | "users"
  | "cutoff"
  | "shares"
  | "other-incomes"
  | "capital-paid"
  | "interest-paid"
  | "deposits"
  | "legal-reserve"
  | "social-fund"
  | "withdrawals"
  | "dividends"
  | "loans"
  | "savings-interest"
  | "administrative"
  | "reconciliation";

export interface StepDef {
  id: StepId;
  phase: "config" | "socios" | "fecha" | "acciones" | "ingresos" | "egresos" | "cierre";
  title: string;
  shortTitle: string;
}

export const STEPS: StepDef[] = [
  { id: "bank", phase: "config", title: "Datos de la comunidad", shortTitle: "Comunidad" },
  { id: "frequency", phase: "config", title: "Reuniones de la comunidad", shortTitle: "Reuniones" },
  { id: "users", phase: "socios", title: "Socios de la comunidad", shortTitle: "Socios" },
  { id: "cutoff", phase: "fecha", title: "Fecha de corte", shortTitle: "Fecha de corte" },
  { id: "shares", phase: "acciones", title: "Acciones de cada socio", shortTitle: "Acciones" },
  { id: "other-incomes", phase: "ingresos", title: "Otros ingresos", shortTitle: "Otros ingresos" },
  { id: "capital-paid", phase: "ingresos", title: "Capital devuelto de los préstamos", shortTitle: "Capital devuelto" },
  { id: "interest-paid", phase: "ingresos", title: "Interés cobrado por préstamos", shortTitle: "Interés cobrado" },
  { id: "deposits", phase: "ingresos", title: "Ahorros de cada socio", shortTitle: "Ahorros" },
  { id: "legal-reserve", phase: "ingresos", title: "Reserva legal", shortTitle: "Reserva legal" },
  { id: "social-fund", phase: "ingresos", title: "Fondo social", shortTitle: "Fondo social" },
  { id: "withdrawals", phase: "egresos", title: "Retiros de ahorros", shortTitle: "Retiros" },
  { id: "dividends", phase: "egresos", title: "Utilidades repartidas", shortTitle: "Utilidades" },
  { id: "loans", phase: "egresos", title: "Préstamos vigentes", shortTitle: "Préstamos" },
  { id: "savings-interest", phase: "egresos", title: "Interés pagado a los ahorristas", shortTitle: "Interés ahorristas" },
  { id: "administrative", phase: "egresos", title: "Gastos administrativos", shortTitle: "Gastos admin." },
  { id: "reconciliation", phase: "cierre", title: "Cuadre de caja", shortTitle: "Cuadre de caja" },
];

/** Último paso del flujo corto (comunidad nueva). */
export const NEW_COMMUNITY_LAST_STEP: StepId = "users";

/** Pasos visibles según el estado de la comunidad: nueva llega hasta socios, antigua ve todo. */
export function getVisibleSteps(mode: UnicaMode): StepDef[] {
  if (mode === "antigua") return STEPS;
  const cut = STEPS.findIndex((s) => s.id === NEW_COMMUNITY_LAST_STEP);
  return STEPS.slice(0, cut + 1);
}

export const PHASE_LABELS: Record<StepDef["phase"], string> = {
  config: "Tu comunidad",
  socios: "Socios",
  fecha: "Fecha de corte",
  acciones: "Acciones",
  ingresos: "Lo que entró",
  egresos: "Lo que salió",
  cierre: "Cierre",
};
