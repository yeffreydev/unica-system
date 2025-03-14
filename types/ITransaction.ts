import { IUser } from "./IUser";

export interface ITransaction {
  id?: string;
  amount: number;
  createdAt?: Date;
}

export interface IDeposit extends ITransaction {
  user?: IUser;
  userId?: string;
}
