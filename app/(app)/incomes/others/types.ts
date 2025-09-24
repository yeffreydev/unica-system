import { IUser } from "@/types/IUser";

export interface IOtherIncome {
  id: number;
  amount: number;
  date: string;
  description: string;
  user?: IUser;
  userId?: string;
}
