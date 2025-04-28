"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { ISocialFundsExpenseTransaction } from "./types";
import { useContext, useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { SocialLegalFundsExpenseForm } from "./SocialLegalFundsExpenseForm";
import { ISocialFunds } from "@/types/ISocialFunds";
import { AppContext } from "@/context/AppContext";

function EquityTable() {
  const {
    bank: { bank },
  } = useContext(AppContext);
  const [socialFundsTransactions, setSocialFundsTransactions] = useState<
    ISocialFundsExpenseTransaction[]
  >([]);

  const fetchPayouts = async () => {
    const response = await apiClient.get("/expenses/social-funds/transactions");
    const { data } = response;
    setSocialFundsTransactions(data);
  };

  useEffect(() => {
    fetchPayouts();
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres y Appellidos</TableHead>
          <TableHead>Tipo de Fondo</TableHead>
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {socialFundsTransactions.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date.toLocaleString()}</TableCell>
            <TableCell>{item.user ? item.user.name : bank.name}</TableCell>
            <TableCell className="font-medium">
              {item.socialFunds.name}
            </TableCell>
            <TableCell className="font-medium">{item.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function LegalAndSocialPage() {
  const [socialFunds, setSocialFunds] = useState<ISocialFunds[]>([]);

  useEffect(() => {
    const fetchSocialFunds = async () => {
      const response = await apiClient.get("/social-funds");
      const data = response.data;

      setSocialFunds(data);
    };
    fetchSocialFunds();
  }, []);
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Fondo Social y Reserva Legal</h1>
        <DialogForm>
          <SocialLegalFundsExpenseForm socialFunds={socialFunds} />
        </DialogForm>
      </div>
      <EquityTable />
    </>
  );
}
