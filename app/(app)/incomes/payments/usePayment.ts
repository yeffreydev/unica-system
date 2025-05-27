import apiClient from "@/config/apiClient";
import { ILoan, ILoanInstallment } from "@/types/ILoan";
import { IUser } from "@/types/IUser";
import { useEffect, useState } from "react";

export const usePayment = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loans, setLoans] = useState<ILoan[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<ILoan | null>(null);
  const [payment, setPayment] = useState({
    amount: 0,
    interest: 0,
  });

  const [payments, setPayments] = useState<ILoanInstallment[]>([]);

  const addPayment = (data: ILoanInstallment) => {
    console.log("Adding payment data", data);
    setPayments((prevPayments) => [...prevPayments, data]);
  };

  useEffect(() => {
    console.log(payments);
  }, [payments]);

  useEffect(() => {
    //get loans
    const fetchLoans = async () => {
      try {
        setLoans([]);
        if (!selectedUser) {
          return;
        }
        const response = await apiClient.get(
          `/loans/by-user/${selectedUser?.id}`
        );
        const data = response.data;
        if (!data) {
          console.error("No data found for the selected user");
          return;
        }
        setSelectedLoan(data[0]);
        setLoans(response.data);
      } catch (error) {
        console.error("Error fetching loans:", error);
      }
    };
    fetchLoans();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedLoan) {
      return;
    }

    const installments = selectedLoan.loanInstallments;

    if (!installments || installments.length === 0) {
      return;
    }
    const installment = installments[0];
    if (!installment) {
      return;
    }

    setPayment({
      amount: installment.payment ?? 0,
      interest: installment.interest ?? 0,
    });
  }, [selectedLoan]);

  //fetch payments
  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await apiClient.get("/loans/paid-installments");
        console.log(response);
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    }
    fetchPayments();
  }, []);

  return {
    openDialog,
    selectedUser,
    loans,
    setSelectedUser,
    selectedLoan,
    setSelectedLoan,
    payment,
    setPayment,
    setOpenDialog,
    payments,
    setPayments,
    addPayment,
  };
};
