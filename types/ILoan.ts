import exp from "constants";
import { IUser } from "./IUser";

export interface ILoan {
  user?: IUser;
  loanType?: ILoanType;
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
  loanInstallments?: ILoanInstallment[];
}

export interface ILoanInstallment {
  id?: string;
  loanId: string;
  payment: number;
  interest: number;
  date: Date;
  loan?: ILoan;
  status?: string;
  user?: IUser;
  installment_number?: number;
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
