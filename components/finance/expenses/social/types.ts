import { ISocialFunds } from "@/types/ISocialFunds";
import { IUser } from "@/types/IUser";

export interface ISocialFundsExpenseTransaction {
  id: number;
  socialFundsId: number;
  amount: number;
  description: string;
  date: Date;
  userId: string;
  socialFunds: ISocialFunds;
  user: IUser;
}
