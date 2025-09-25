import { IUser } from "@/types/IUser";

export interface IOtherExpense {
  id: number;
  amount: number;
  date: string;
  description: string;
  userId: string;
  user: IUser;
}
