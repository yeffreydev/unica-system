"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import apiClient from "@/config/apiClient";
import { IStock } from "@/types/IStock";
import { AuthContext } from "@/context/auth/AuthContex";

interface StockContextType {
  stocks: IStock[];
  setStocks?: (Stocks: IStock[]) => void;
  addStock?: (Stock: IStock) => void;
  deleteStock?: (id: string) => void;
  updateStock?: (Stock: IStock) => void;
  // edit dialog state
  editingStock?: IStock | null;
  setEditingStock?: (stock: IStock | null) => void;
  isEditOpen?: boolean;
  setIsEditOpen?: (open: boolean) => void;
  openEdit?: (stock: IStock) => void;
  closeEdit?: () => void;
}

const initialState: StockContextType = {
  stocks: [],
  setStocks: () => {},
  addStock: () => {},
  deleteStock: () => {},
  updateStock: () => {},
  editingStock: null,
  setEditingStock: () => {},
  isEditOpen: false,
  setIsEditOpen: () => {},
  openEdit: () => {},
  closeEdit: () => {},
};

export const StockContext = createContext<StockContextType>(initialState);

interface StockProviderProps {
  children: ReactNode;
}

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const [stocks, setStocks] = useState<IStock[]>(initialState.stocks);
  const { auth } = useContext(AuthContext);
  const [editingStock, setEditingStock] = useState<IStock | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const addStock = (stock: IStock) => {
    setStocks([stock, ...stocks]);
  };

  // const deleteStock = (id: string) => {
  //   setStocks(stocks.filter((Stock) => Stock.id !== id));
  // };

  // const updateStock = (Stock: IStock) => {
  //   const index = stocks.findIndex((u) => u.id === Stock.id);
  //   if (index !== -1) {
  //     stocks[index] = Stock;
  //     setStocks([...stocks]);
  //   }
  // };

  // const removeStock = (id: string) => {
  //   setStocks(stocks.filter((Stock) => Stock.id !== id));
  // };

  const fetchStocks = async () => {
    try {
      const res = await apiClient.get("/stocks");
      setStocks(res.data.reverse());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth.authenticated) {
      fetchStocks();
    }
  }, [auth.authenticated]);

  const openEdit = (stock: IStock) => {
    setEditingStock(stock);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingStock(null);
  };

  return (
    <StockContext.Provider
      value={{
        stocks,
        addStock,
        setStocks,
        editingStock,
        setEditingStock,
        isEditOpen,
        setIsEditOpen,
        openEdit,
        closeEdit,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};
