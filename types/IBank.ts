import { IStock } from "./IStock";

export interface IBank {
  bank: {
    name: string;
    avatar?: string;
    loanInterestRate?: number;
    savingsInterestRate?: number;
  };
  mainStock: IStock;
}
