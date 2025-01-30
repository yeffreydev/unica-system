import { IUser } from "./IUser";

export interface ILoan {
  user?: IUser;
  id?: string;
  amount?: number;
  loanTypeId: string;
  userId?: string;
  createdAt?: Date;
  months?: number;
}

export interface ILoanType {
  id?: string;
  name: string;
}
