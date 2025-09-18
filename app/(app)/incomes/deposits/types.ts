import { IUser } from "@/types/IUser";


export interface IDeposit  {
    id?: string;
    amount: number;
  user?: IUser;
  date: string;
  userId?: string;
}
