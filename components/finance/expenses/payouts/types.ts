import { IUser } from "@/types/IUser";

export interface IPayout {
  id: number;
  description: string;
  amount: number;
  date: Date;
  userId: string;
  user: IUser;
}
