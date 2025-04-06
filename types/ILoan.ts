import exp from "constants";
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

export interface ILoanInstallment {
  id?: string;
  loanId: string;
  payment: number;
  interest: number;
  date: Date;
  status?: string;
  user?: IUser;
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
