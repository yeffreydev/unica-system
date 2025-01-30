import { IUser } from "./IUser";

export interface IStock {
  id?: string;
  name: string;
  price: number;
  user?: IUser;
  userId?: string;
  quantity?: number;
}
