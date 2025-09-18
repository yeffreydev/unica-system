"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { AuthContext } from "@/context/auth/AuthContex";
import { apiGetLoanPayments } from "./api";
import { ILoanPayment } from "./types";
interface PaymentsContextType {
  payments: ILoanPayment[];
  setPayments?: (payments: ILoanPayment[]) => void;
  removePayment?: (id: string) => void;
  addPayment?: (payment: ILoanPayment) => void;
}

const initialState: PaymentsContextType = {
  payments: [],
  setPayments: () => {},
  addPayment: () => {},
  removePayment: () => {},
};

export const PaymentsContext = createContext<PaymentsContextType>(initialState);

interface PaymentsProviderProps {
  children: ReactNode;
}

export const PaymentsProvider: React.FC<PaymentsProviderProps> = ({
  children,
}) => {
  const [payments, setPayments] = useState<ILoanPayment[]>(
    initialState.payments
  );
  const { auth } = useContext(AuthContext);

  const addPayment = (payment: ILoanPayment) => {
    setPayments([...payments, payment]);
  };
  const removePayment = (id: string) => {
    setPayments(payments.filter((payment) => payment.id !== id));
  }
  const fetchPayments = async () => {
    try {
      const data = await apiGetLoanPayments()
      console.log("Fetched payments:", data);
      setPayments(data);
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
        removePayment,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
};
