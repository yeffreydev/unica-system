import { IStock } from "./IStock";

export interface IBank {
  bank: {
    name: string;
    avatar?: string;
  };
  mainStock: IStock;
}
