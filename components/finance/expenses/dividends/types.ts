import { IUser } from "@/types/IUser";

export interface IDividendsWithdraw {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: Date;
  user: IUser;
}
