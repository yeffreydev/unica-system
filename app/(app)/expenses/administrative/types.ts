import { IUser } from "@/types/IUser";

export interface IAdministrativeExpense {
  id: number;
  userId: number;
  description: string;
  amount: number;
  date: Date;
  user: IUser;
}
