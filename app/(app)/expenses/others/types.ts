import { IUser } from "@/types/IUser";

export interface IExpense {
  id: number;
  amount: number;
  date: string;
  description: string;
  user: IUser;
}
