import { IUser } from "@/types/IUser";

export interface IDividendsWithdraw {
  id: number;
  userId: number;
  description: string;
  amount: number;
  date: Date;
  user: IUser;
}
