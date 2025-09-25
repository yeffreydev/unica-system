import { IUser } from "@/types/IUser";
import { IWithdrawal } from "../../expenses/withdrawls/types";
import { ILoan } from "@/types/ILoan";
import { IPayout } from "../../expenses/payouts/types";
import { ISocialFundsExpenseTransaction } from "../../expenses/social/types";
import { IOtherExpense } from "../../expenses/others/types";
import { IAdministrativeExpense } from "../../expenses/administrative/types";
import { IDividendsWithdraw } from "../../expenses/dividends/types";
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