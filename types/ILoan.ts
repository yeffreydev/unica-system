import exp from "constants";
import { IUser } from "./IUser";

export interface ILoan {
  user?: IUser;
  loanType?: ILoanType;
  id?: string;
  amount: number;
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
  balance?: number;
}

export interface ILoanInstallment {
  id?: string;
  loanId: string;
  payment: number;
  interest: number;
  date: Date;
  loan?: ILoan;
  status?: string;
  paid?: boolean;
  user?: IUser;
  installment_number?: number;
  isAssemblyMonth?: boolean;
  paymentDescription?: string | null;
  paymentAmount?: number | null;
  paymentInterest?: number | null;
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
