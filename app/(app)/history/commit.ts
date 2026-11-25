import {
  buyShares,
  createAdminExpense,
  createDeposit,
  createDividend,
  createLoan,
  createLoanPayment,
  createOtherIncome,
  createSavingsInterestPayout,
  createSocialFundIncome,
  createWithdrawal,
  getDefaultLoanType,
  getMainStockId,
  getSocialFundsTypes,
} from "@/app/start/api";
import { OnboardingState } from "@/app/start/types";

interface Section {
  id: string;
  label: string;
  run: (s: OnboardingState) => Promise<void>;
}

const positive = (r: Record<string, number>) =>
  Object.entries(r).filter(([, v]) => (Number(v) || 0) > 0);

/**
 * Mismas escrituras que hace /start paso a paso, pero todas juntas al
 * finalizar el historial. Cada sección se marca al terminar para no
 * duplicarla si hay que reintentar tras un error.
 */
const SECTIONS: Section[] = [
  {
    id: "shares",
    label: "Acciones",
    run: async (s) => {
      const entries = positive(s.shares);
      if (!entries.length) return;
      const mainStockId = await getMainStockId();
      if (!mainStockId) throw new Error("No se encontró la acción base de la comunidad.");
      for (const [uid, qty] of entries) await buyShares(mainStockId, uid, qty, s.cutoffDate);
    },
  },
  {
    id: "other-incomes",
    label: "Otros ingresos",
    run: async (s) => {
      for (const e of s.otherIncomes.filter((x) => x.amount > 0)) await createOtherIncome(e, s.cutoffDate);
    },
  },
  {
    id: "capital-paid",
    label: "Capital devuelto",
    run: async (s) => {
      for (const [uid, v] of positive(s.capitalPaid)) await createLoanPayment(uid, v, 0, s.cutoffDate);
    },
  },
  {
    id: "interest-paid",
    label: "Interés cobrado",
    run: async (s) => {
      for (const [uid, v] of positive(s.interestPaid)) await createLoanPayment(uid, 0, v, s.cutoffDate);
    },
  },
  {
    id: "deposits",
    label: "Ahorros",
    run: async (s) => {
      for (const [uid, v] of positive(s.deposits)) await createDeposit(uid, v, s.cutoffDate);
    },
  },
  {
    id: "social-funds",
    label: "Reserva legal y fondo social",
    run: async (s) => {
      if (!(s.legalReserve > 0) && !(s.socialFund > 0)) return;
      const funds = await getSocialFundsTypes();
      if (s.legalReserve > 0) {
        const legal = funds.find((f) => f.name === "LEGAL");
        if (!legal) throw new Error("No se encontró el fondo de reserva legal.");
        await createSocialFundIncome(legal.id, s.legalReserve, s.cutoffDate, "Reserva legal acumulada");
      }
      if (s.socialFund > 0) {
        const social = funds.find((f) => f.name === "SOCIAL");
        if (!social) throw new Error("No se encontró el fondo social.");
        await createSocialFundIncome(social.id, s.socialFund, s.cutoffDate, "Fondo social acumulado");
      }
    },
  },
  {
    id: "withdrawals",
    label: "Retiros",
    run: async (s) => {
      for (const [uid, v] of positive(s.withdrawals)) await createWithdrawal(uid, v, s.cutoffDate);
    },
  },
  {
    id: "dividends",
    label: "Utilidades repartidas",
    run: async (s) => {
      for (const [uid, v] of positive(s.dividends)) await createDividend(uid, v, s.cutoffDate);
    },
  },
  {
    id: "loans",
    label: "Préstamos vigentes",
    run: async (s) => {
      const loans = Object.entries(s.loans).filter(([, l]) => l && l.amount > 0 && l.months > 0);
      if (!loans.length) return;
      const loanTypeId = s.loanTypeId ?? (await getDefaultLoanType());
      if (!loanTypeId) throw new Error("No hay tipos de préstamo configurados.");
      const rate = (s.bank.loanInterestRate || 0) / 100;
      for (const [uid, l] of loans) await createLoan(uid, l, loanTypeId, rate, s.cutoffDate);
    },
  },
  {
    id: "savings-interest",
    label: "Interés a ahorristas",
    run: async (s) => {
      for (const [uid, v] of positive(s.savingsInterest)) await createSavingsInterestPayout(uid, v, s.cutoffDate);
    },
  },
  {
    id: "administrative",
    label: "Gastos administrativos",
    run: async (s) => {
      for (const e of s.administrative.filter((x) => x.amount > 0)) await createAdminExpense(e, s.cutoffDate);
    },
  },
];

export async function commitHistory(
  state: OnboardingState,
  posted: string[],
  onSectionDone: (posted: string[]) => Promise<void>
) {
  const done = [...posted];
  for (const section of SECTIONS) {
    if (done.includes(section.id)) continue;
    try {
      await section.run(state);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      throw new Error(`No se pudo registrar "${section.label}": ${msg}`);
    }
    done.push(section.id);
    await onSectionDone(done);
  }
  return done;
}
