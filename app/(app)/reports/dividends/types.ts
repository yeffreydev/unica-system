import { IUser } from "@/types/IUser";

export interface IProfits extends IUser {
    shares:  Record<string, [number, number]>
    profits:Record<string,number>;
}

export interface IProfitsResponse {
     partners: IUser[];
    incomes: {
      interests: Record<string, number>;
      others: Record<string, number>;
    };
    expenses: {
      payouts: Record<string, number>;
      others: Record<string, number>;
    };
    shares: Record<string, Record<string, [number, number]>>;// userId: { "month-year": [qty, value] }
}