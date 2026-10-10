import { IUser } from "@/types/IUser";
import { IWithdrawal } from "@/components/finance/expenses/withdrawls/types";
import { ILoan } from "@/types/ILoan";
import { IPayout } from "@/components/finance/expenses/payouts/types";
import { ISocialFundsExpenseTransaction } from "@/components/finance/expenses/social/types";
import { IOtherExpense } from "@/components/finance/expenses/others/types";
import { IAdministrativeExpense } from "@/components/finance/expenses/administrative/types";
import { IDividendsWithdraw } from "@/components/finance/expenses/dividends/types";
export interface IDataExpenses {
    withdrawals: IWithdrawal[],
  loans: ILoan[],
  payouts: IPayout[],
  socialFunds: ISocialFundsExpenseTransaction[],
  others: IOtherExpense[],
  dividends: IDividendsWithdraw[],
  administrative: IAdministrativeExpense[],
}
export interface IDataStateExpenses extends IDataExpenses{
  users: IUser[],
  accumulated: {
    withdrawals: number;
    loans: number;
    administrative: number;
    dividends: number;
    payouts: number;
    socialFundsSocial: number;
    socialFundsLegal: number;
    others: number;
  }
}