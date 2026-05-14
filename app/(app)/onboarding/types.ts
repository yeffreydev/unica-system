import { IUser } from "@/types/IUser";

export type FrequencyType = "simple" | "advanced";

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
  { id: "bank", phase: "config", title: "Datos de la úNICA", shortTitle: "úNICA" },
  { id: "frequency", phase: "config", title: "Frecuencia de la asamblea", shortTitle: "Frecuencia" },
  { id: "users", phase: "socios", title: "Socios", shortTitle: "Socios" },
  { id: "cutoff", phase: "fecha", title: "Fecha de corte", shortTitle: "Fecha de corte" },
  { id: "shares", phase: "acciones", title: "Acciones acumuladas por socio", shortTitle: "Acciones" },
  { id: "other-incomes", phase: "ingresos", title: "Otros ingresos acumulados", shortTitle: "Otros ingresos" },
  { id: "capital-paid", phase: "ingresos", title: "Capital pagado acumulado", shortTitle: "Capital pagado" },
  { id: "interest-paid", phase: "ingresos", title: "Interés pagado acumulado (préstamos)", shortTitle: "Interés cobrado" },
  { id: "deposits", phase: "ingresos", title: "Depósitos acumulados por socio", shortTitle: "Depósitos" },
  { id: "legal-reserve", phase: "ingresos", title: "Reserva legal", shortTitle: "Reserva legal" },
  { id: "social-fund", phase: "ingresos", title: "Fondo social", shortTitle: "Fondo social" },
  { id: "withdrawals", phase: "egresos", title: "Retiros acumulados por socio", shortTitle: "Retiros" },
  { id: "dividends", phase: "egresos", title: "Utilidades distribuidas", shortTitle: "Utilidades" },
  { id: "loans", phase: "egresos", title: "Préstamos acumulados por socio", shortTitle: "Préstamos" },
  { id: "savings-interest", phase: "egresos", title: "Interés pagado a ahorristas", shortTitle: "Interés ahorristas" },
  { id: "administrative", phase: "egresos", title: "Gastos administrativos", shortTitle: "Gastos admin." },
  { id: "reconciliation", phase: "cierre", title: "Cuadre de caja", shortTitle: "Cuadre de caja" },
];

export const PHASE_LABELS: Record<StepDef["phase"], string> = {
  config: "Configuración",
  socios: "Socios",
  fecha: "Fecha de corte",
  acciones: "Acciones",
  ingresos: "Ingresos",
  egresos: "Egresos",
  cierre: "Cierre",
};
