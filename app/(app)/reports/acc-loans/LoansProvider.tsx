"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import apiClient from "@/config/apiClient";
import { ILoanUser } from "@/types/ILoan";
import { AuthContext } from "@/context/auth/AuthContex";

interface LoansContextType {
  loans: ILoanUser[];
  setLoans?: (Loans: ILoanUser[]) => void;
  addLoan?: (Loan: ILoanUser) => void;
  deleteLoan?: (id: string) => void;
  updateLoan?: (Loan: ILoanUser) => void;
}

const initialState: LoansContextType = {
  loans: [],
  setLoans: () => {},
  addLoan: () => {},
  deleteLoan: () => {},
  updateLoan: () => {},
};

export const LoansContext = createContext<LoansContextType>(initialState);

interface LoanProviderProps {
  children: ReactNode;
}

export const LoansProvider: React.FC<LoanProviderProps> = ({ children }) => {
  const [loans, setLoans] = useState<ILoanUser[]>(initialState.loans);
  const { auth } = useContext(AuthContext);

  const addLoan = (Loan: ILoanUser) => {
    setLoans([...loans, Loan]);
  };

  // const deleteLoan = (id: string) => {
  //   setLoans(loans.filter((Loan) => Loan.id !== id));
  // };

  // const updateLoan = (Loan: ILoanUser) => {
  //   const index = loans.findIndex((u) => u.id === Loan.id);
  //   if (index !== -1) {
  //     loans[index] = Loan;
  //     setLoans([...loans]);
  //   }
  // };

  // const removeLoan = (id: string) => {
  //   setLoans(loans.filter((Loan) => Loan.id !== id));
  // };

  const fetchLoans = async () => {
    try {
      const res = await apiClient.get("/loans/users");
      console.log(res.data);
      setLoans(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth.authenticated) {
      fetchLoans();
    }
  }, [auth.authenticated]);

  return (
    <LoansContext.Provider
      value={{
        loans,
        addLoan,
        setLoans,
      }}
    >
      {children}
    </LoansContext.Provider>
  );
};
