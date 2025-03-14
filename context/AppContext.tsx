"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  RefObject,
  useRef,
} from "react";
import apiClient from "@/config/apiClient";
import { IUser } from "@/types/IUser";
import { IBank } from "@/types/IBank";
import { AuthContext } from "./auth/AuthContex";

interface AppContextType {
  users: IUser[];
  formCloseModalRef: RefObject<HTMLButtonElement> | null;
  setUsers?: (users: IUser[]) => void;
  addUser?: (user: IUser) => void;
  deleteUser?: (id: string) => void;
  updateUser?: (user: IUser) => void;
  bank: IBank;
}

const initialState: AppContextType = {
  formCloseModalRef: null,
  users: [],
  setUsers: () => {},
  addUser: () => {},
  deleteUser: () => {},
  updateUser: () => {},
  bank: {
    bank: {
      name: "",
      avatar: "",
    },
    mainStock: {
      name: "",
      price: 0,
    },
  },
};

export const AppContext = createContext<AppContextType>(initialState);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<IUser[]>(initialState.users);
  const [bank, setBank] = useState<IBank>(initialState.bank);
  const { auth } = useContext(AuthContext);
  const formCloseModalRef = useRef<HTMLButtonElement>(null);

  const addUser = (user: IUser) => {
    setUsers([...users, user]);
  };
  const deleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const updateUser = (user: IUser) => {
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      setUsers([...users]);
    }
  };

  const removeUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth.authenticated) fetchUsers();
    return () => {
      setUsers([]);
    };
  }, [auth]);

  const fetchBank = async () => {
    try {
      const res = await apiClient.get("/banks");

      //obtener data del localstorage.
      const data = localStorage.getItem("bank") as string;
      const bank = data ? JSON.parse(data) : null;
      console.log(bank);
      if (bank) {
        setBank(bank);
      } else {
        setBank(res.data);
        localStorage.setItem("bank", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth.authenticated) fetchBank();
  }, [auth]);

  return (
    <AppContext.Provider
      value={{
        formCloseModalRef,
        users,
        setUsers,
        bank,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
