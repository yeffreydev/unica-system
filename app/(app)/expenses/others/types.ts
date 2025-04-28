import { IUser } from "@/types/IUser";

export interface IExpense {
  amount: number;
  date: string;
  description: string;
  user: IUser;
}
