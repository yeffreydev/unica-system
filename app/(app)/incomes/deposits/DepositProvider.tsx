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
import { IDeposit } from "./types";


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
    setDeposits((prev) => [deposit, ...prev]);
  };

  const updateDeposit = (deposit: IDeposit) => {
    setDeposits((prev) => prev.map((d) => (d.id === deposit.id ? deposit : d)));
  };

  const fetchDeposit = async () => {
    try {
      const res = await apiClient.get("/deposits");
      console.log(res.data);
      setDeposits(res.data.reverse());
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
        updateDeposit,
        setDeposits,
      }}
    >
      {children}
    </DepositContext.Provider>
  );
};
