import { IStock } from "./IStock";

export interface IBank {
  bank: {
    name: string;
    avatar?: string;
    loanInterestRate?: number;
    savingsInterestRate?: number;
    loanInterestRoundingMode?: "NORMAL" | "UP" | "DOWN";
    loanInterestRoundingDigits?: number;
  };
  mainStock: IStock;
}
