import { IUser } from "@/types/IUser";

export interface IWithdrawal {
  id: number;
  userId: number;
  description: string;
  amount: number;
  date: Date;
  user: IUser;
}
