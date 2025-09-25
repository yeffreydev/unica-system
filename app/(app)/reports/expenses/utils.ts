import { IDataExpenses } from "./types";

export const getExpensesSum = (data: IDataExpenses) => {
  const sum = {
    withdrawals: data.withdrawals.reduce((acc, i) => acc + i.amount, 0),
    loans: data.loans.reduce((acc, i) => acc + i.amount, 0),
    payouts: data.payouts.reduce((acc, i) => acc + i.amount, 0),
    administrative: data.administrative.reduce((acc, i) => acc + i.amount, 0),
    dividends: data.dividends.reduce((acc, i) => acc + i.amount, 0),
    socialFundsLegal: data.socialFunds.filter(item => item.socialFunds.name === 'LEGAL').reduce((acc, i) => acc + i.amount, 0),
    socialFundsSocial: data.socialFunds.filter(item => item.socialFunds.name === 'SOCIAL').reduce((acc, i) => acc + i.amount, 0),
    others: data.others.reduce((acc, i) => acc + i.amount, 0),
  };
  return sum;
}