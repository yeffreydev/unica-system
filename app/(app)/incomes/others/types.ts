import { IUser } from "@/types/IUser";

export interface IOtherIncome {
  id: string;
  amount: number;
  date: string;
  description: string;
  user?: IUser;
  userId?: string;
}
