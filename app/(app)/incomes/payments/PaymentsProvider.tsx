"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import apiClient from "@/config/apiClient";
import { ILoanInstallment } from "@/types/ILoan";
import { AuthContext } from "@/context/auth/AuthContex";
interface PaymentsContextType {
  payments: ILoanInstallment[];
  setPayments?: (payments: ILoanInstallment[]) => void;
  addPayment?: (payment: ILoanInstallment) => void;
}

const initialState: PaymentsContextType = {
  payments: [],
  setPayments: () => {},
  addPayment: () => {},
};

export const PaymentsContext = createContext<PaymentsContextType>(initialState);

interface PaymentsProviderProps {
  children: ReactNode;
}

export const PaymentsProvider: React.FC<PaymentsProviderProps> = ({
  children,
}) => {
  const [payments, setPayments] = useState<ILoanInstallment[]>(
    initialState.payments
  );
  const { auth } = useContext(AuthContext);

  const addPayment = (payment: ILoanInstallment) => {
    setPayments([...payments, payment]);
  };

  const fetchPayments = async () => {
    try {
      const res = await apiClient.get("/loans/paid-installments");
      setPayments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth.authenticated) {
      fetchPayments();
    }
  }, [auth.authenticated]);

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        addPayment,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
};
