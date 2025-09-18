import apiClient from "@/config/apiClient";
import { ILoanPayment } from "./types";

export const apiCreateLoanPayment = async (data: ILoanPayment ) => {
    const response = await apiClient.post("/incomes/loan-payments", data);
    return response.data;
}

export const apiGetLoanPayments = async () => {
    const response = await apiClient.get<ILoanPayment[]>("/incomes/loan-payments");
    return response.data;
}

export const apiDeleteLoanPayment = async (id: string) => {
    const response = await apiClient.delete(`/incomes/loan-payments/${id}`);
    return response.data;
}