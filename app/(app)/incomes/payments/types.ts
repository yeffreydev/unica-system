import { IUser } from "@/types/IUser";

export interface ILoanPayment {
    id?: string;
    userId: string;
    user?:IUser,
    date: string;
    amount: number;
    interest: number;
}