import { IProfits, IProfitsResponse } from "./types";

export interface DividendsResult {
  interests: number;
  othersIncomes: number;
  totalIncomes: number;
  totalPayouts: number;
  otherExpenses: number;
  totalExpenses: number;
  profits: number;
  netProfit: number;
  socialFunds: number;
  legalFunds: number;
}

export interface TransformPartnersProfitsResult {
  data: IProfits[];
  dividends: DividendsResult;
  shareWorks: Record<string, { works: number; totalShares: number; shareWorks: number }>;
  monthlyProfits: Record<string, { works: number; totalShares: number; shareWorks: number; profit: number }>;
}

export const transformPartnersProfits=(data: IProfitsResponse,startMonth:string,endMonth: string): TransformPartnersProfitsResult => {
    const monthlyProfits = transformProfitsPerShare(data, startMonth, endMonth);
    console.log({monthlyProfits});
    return {
      shareWorks: transformProfitPerShare(data, startMonth, endMonth),
      
      monthlyProfits,
      dividends: calculateDividends(data),
      data: data.partners.map(item => {
        const userShares = data.shares[item.id] ?? {}
        const profits: Record<string, number> = {};
        Object.entries(userShares).forEach(([month, [qty]]) => {
            profits[month] = qty * (monthlyProfits[month]?.profit || 0);
        });
        return {
            profits,
            shares: userShares,
            ...item,
        }
    })}
}

const calculateDividends = (data: IProfitsResponse): DividendsResult => {
    const interestsTotal: number = Object.values(data.incomes.interests).reduce((sum, value) => sum + value, 0);
    const totalOthersIncomes: number = Object.values(data.incomes.others).reduce((sum, value) => sum + value, 0);
    const totalIncomes = interestsTotal + totalOthersIncomes;
    const totalPayouts = Object.values(data.expenses.payouts).reduce((sum, value) => sum + value, 0);
    const totalOthersExpenses = Object.values(data.expenses.others).reduce((sum, value) => sum + value, 0);
    const totalExpenses = totalPayouts + totalOthersExpenses;
    const netProfit = totalIncomes - totalExpenses;
    const socialFunds = netProfit * 0.1;
    const legalFunds = netProfit * 0.1;
    return {
      interests: interestsTotal,
      othersIncomes: totalOthersIncomes,
      totalIncomes,
      totalPayouts,
      otherExpenses: totalOthersExpenses,
      netProfit: netProfit,
      socialFunds,
      legalFunds,
      profits: netProfit - socialFunds - legalFunds,
      totalExpenses,
    }
}

const transformProfitPerShare = (
  data: IProfitsResponse,
  startMonth: string,
  endMonth: string
): Record<string, { works: number; totalShares: number; shareWorks: number }> => {
  // Convierte "YYYY-M" a meses totales
  const toMonths = (date: string): number => {
    const [yyyy, mm] = date.split("-").map(Number);
    return yyyy * 12 + (mm - 1); // mm base 1
  };

  // Convierte meses totales a "MM-YYYY"
  const fromMonths = (total: number): string => {
    const yyyy = Math.floor(total / 12);
    const mm = (total % 12) + 1;
    return `${mm.toString().padStart(2, "0")}-${yyyy}`;
  };

  const start = toMonths(startMonth) + 1; // +1 para pasar a mes real
  const end = toMonths(endMonth) + 1;

  // Calcular totalShares por mes
  const totalSharesPerMonth: Record<string, number> = {};
  Object.values(data.shares).forEach(userShares => {
    Object.entries(userShares).forEach(([month, [qty]]) => {
      totalSharesPerMonth[month] = (totalSharesPerMonth[month] || 0) + qty;
    });
  });

  const result: Record<string, { works: number; totalShares: number; shareWorks: number }> = {};

  for (let i = start; i <= end; i++) {
    const key = fromMonths(i);
    const works = end - i;
    const totalShares = totalSharesPerMonth[key] || 0;
    result[key] = { works, totalShares, shareWorks: totalShares * works };
  }

  return result;
};


const transformProfitsPerShare = (
  data: IProfitsResponse,
  startMonth: string,
  endMonth: string
): Record<string, { works: number; totalShares: number; shareWorks: number; profit: number }> => {
  const profits = calculateDividends(data).profits;
  const shareWorks = transformProfitPerShare(data, startMonth, endMonth);
  const totalShareWorks = Object.values(shareWorks).reduce((sum, item) => sum + item.shareWorks, 0);
  const monthlyProfitPerShare = totalShareWorks ? profits / totalShareWorks : 0;

  const result: Record<string, { works: number; totalShares: number; shareWorks: number; profit: number }> = {};
  Object.entries(shareWorks).forEach(([key, value]) => {
    result[key] = {
      ...value,
      profit: value.works * monthlyProfitPerShare
    };
  });

  return result;
}