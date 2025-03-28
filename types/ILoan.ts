import { IUser } from "./IUser";

export interface ILoan {
  user?: IUser;
  id?: string;
  amount?: number;
  loanTypeId: string;
  userId?: string;
  createdAt?: Date;
  date?: Date;
  status?: string;
  initalInstallments?: number;
  _totalLoans?: number;
  _totalPaid?: number;
  interestRate?: number;
}

export interface ILoanType {
  id?: string;
  name: string;
}
export interface ILoanUser extends IUser {
  _totalLoans: number;
  _totalPaid: number;
  loans: ILoan[];
}
