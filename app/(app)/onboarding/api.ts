import apiClient from "@/config/apiClient";
import { IUser } from "@/types/IUser";
import {
  FreeMoneyEntry,
  LoanEntry,
  OnboardingBank,
  OnboardingFrequency,
} from "./types";

export async function saveBank(data: OnboardingBank) {
  const res = await apiClient.put("/banks", {
    name: data.name,
    loanInterestRate: Number(data.loanInterestRate) / 100,
    savingsInterestRate: Number(data.savingsInterestRate) / 100,
    loanInterestRoundingMode: "NORMAL",
    loanInterestRoundingDigits: 2,
    savingsInterestRoundingMode: "NORMAL",
    savingsInterestRoundingDigits: 2,
  });
  return res.data;
}

export async function saveFrequency(data: OnboardingFrequency) {
  const payload: Record<string, unknown> = {
    frequencyType: data.frequencyType,
    hour: data.hour,
    minute: data.minute,
  };
  if (data.frequencyType === "simple") {
    payload.dayOfMonth = data.dayOfMonth ?? 15;
  } else {
    payload.weekOccurrence = data.weekOccurrence ?? "first";
    payload.weekDay = data.weekDay ?? "saturday";
  }
  const res = await apiClient.post("/settings/assembly/config", payload);
  return res.data;
}

export async function addParticipant(userId: string) {
  await apiClient.post(`/settings/participants/${userId}`, { action: "add" });
}

export async function createUser(input: Omit<IUser, "id">) {
  const res = await apiClient.post("/users", input);
  return res.data as IUser;
}

export async function getSocialFundsTypes() {
  const res = await apiClient.get<{ id: string; name: "LEGAL" | "SOCIAL" }[]>(
    "/banks/social-funds-types"
  );
  return res.data;
}

export async function getMainStockId(): Promise<string | undefined> {
  try {
    const res = await apiClient.get("/banks");
    return res.data?.mainStock?.id;
  } catch {
    return undefined;
  }
}

export async function getDefaultLoanType(): Promise<string | undefined> {
  try {
    const res = await apiClient.get("/loans/types");
    const list = res.data as { id: string; name: string }[];
    return list?.find((t) => t.name === "FIXED")?.id ?? list?.[0]?.id;
  } catch {
    return undefined;
  }
}

export async function buyShares(
  mainStockId: string,
  userId: string,
  quantity: number,
  date: string
) {
  await apiClient.post("/stocks/buy", {
    id: mainStockId,
    userId,
    quantity,
    date,
    name: "",
    price: 0,
  });
}

export async function createDeposit(userId: string, amount: number, date: string) {
  await apiClient.post("/deposits", { userId, amount, date });
}

export async function createWithdrawal(userId: string, amount: number, date: string) {
  await apiClient.post("/withdrawals/create-transaction", {
    userId,
    amount,
    description: "Retiro acumulado (carga inicial)",
    date: new Date(date),
  });
}

export async function createLoanPayment(
  userId: string,
  capital: number,
  interest: number,
  date: string
) {
  await apiClient.post("/incomes/loan-payments", {
    userId,
    amount: capital,
    interest,
    date,
  });
}

export async function createOtherIncome(entry: FreeMoneyEntry, date: string) {
  await apiClient.post("/incomes/others/create-transaction", {
    amount: entry.amount,
    description: entry.description || "Otro ingreso (carga inicial)",
    userId: entry.userId ?? null,
    date: new Date(date),
    tag: "UNCLASSIFIED",
  });
}

export async function createSocialFundIncome(
  socialFundsId: string,
  amount: number,
  date: string,
  description: string
) {
  await apiClient.post("/incomes/social-funds/create-transaction", {
    socialFundsId,
    amount,
    description,
    date: new Date(date),
    userId: null,
  });
}

export async function createDividend(userId: string, amount: number, date: string) {
  await apiClient.post("/expenses/dividends/create-transaction", {
    amount,
    description: "Utilidades distribuidas (carga inicial)",
    userId,
    date: new Date(date),
  });
}

export async function createSavingsInterestPayout(
  userId: string,
  amount: number,
  date: string
) {
  await apiClient.post("/payouts/create-transaction", {
    amount,
    description: "Interés a ahorristas (carga inicial)",
    userId,
    date: new Date(date),
  });
}

export async function createAdminExpense(entry: FreeMoneyEntry, date: string) {
  await apiClient.post("/expenses/administrative/create-transaction", {
    amount: entry.amount,
    description: entry.description || "Gasto administrativo (carga inicial)",
    userId: entry.userId ?? null,
    date: new Date(date),
  });
}

export async function createLoan(
  userId: string,
  loan: LoanEntry,
  loanTypeId: string,
  interestRate: number,
  date: string
) {
  await apiClient.post("/loans", {
    amount: loan.amount,
    userId,
    loanTypeId,
    initalInstallments: loan.months,
    interestRate,
    date: new Date(date + "T00:00:00-05:00"),
  });
}
