import { IUser } from "@/types/IUser";

export interface IIncome {
  amount: number;
  date: string;
  description: string;
  user: IUser;
}
