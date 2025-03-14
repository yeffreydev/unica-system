"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import apiClient from "@/config/apiClient";
import { AuthContext } from "@/context/auth/AuthContex";
import { IDeposit } from "@/types/ITransaction";

interface DepositContextType {
  deposits: IDeposit[];
  setDeposits?: (deposit: IDeposit[]) => void;
  addDeposit?: (deposit: IDeposit) => void;
  deleteDeposit?: (id: string) => void;
  updateDeposit?: (deposit: IDeposit) => void;
}

const initialState: DepositContextType = {
  deposits: [],
  setDeposits: () => {},
  addDeposit: () => {},
  deleteDeposit: () => {},
  updateDeposit: () => {},
};

export const DepositContext = createContext<DepositContextType>(initialState);

interface DepositProviderProps {
  children: ReactNode;
}

export const DepositProvider: React.FC<DepositProviderProps> = ({
  children,
}) => {
  const [deposits, setDeposits] = useState<IDeposit[]>(initialState.deposits);
  const { auth } = useContext(AuthContext);

  const addDeposit = (deposit: IDeposit) => {
    setDeposits([...deposits, deposit]);
  };

  // const deleteDeposit = (id: string) => {
  //   setDeposits(deposits.filter((deposit) => deposit.id !== id));
  // };

  // const updateDeposit = (deposit: IDeposit) => {
  //   const index = deposits.findIndex((u) => u.id === deposit.id);
  //   if (index !== -1) {
  //     deposits[index] = deposit;
  //     setDeposits([...deposits]);
  //   }
  // };

  // const removeDeposit = (id: string) => {
  //   setDeposits(deposits.filter((deposit) => deposit.id !== id));
  // };

  const fetchDeposit = async () => {
    try {
      const res = await apiClient.get("/transactions/deposits");
      console.log(res.data);
      setDeposits(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth.authenticated) {
      fetchDeposit();
    }
  }, [auth.authenticated]);

  return (
    <DepositContext.Provider
      value={{
        deposits,
        addDeposit,
        setDeposits,
      }}
    >
      {children}
    </DepositContext.Provider>
  );
};
