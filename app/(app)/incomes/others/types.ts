import { IUser } from "@/types/IUser";

export interface IIncome {
  id: number;
  amount: number;
  date: string;
  description: string;
  user?: IUser;
}
