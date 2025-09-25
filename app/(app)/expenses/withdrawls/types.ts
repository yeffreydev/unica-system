import { IUser } from "@/types/IUser";

export interface IWithdrawal {
  id: number;
  userId?: string;
  description: string;
  amount: number;
  date: string;
  user?: IUser;
}
