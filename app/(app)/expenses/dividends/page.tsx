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
import { DividendsWithdrawForm } from "@/app/(app)/expenses/dividends/DividendsWithdrawForm";
import apiClient from "@/config/apiClient";
import { useEffect, useState } from "react";
import { IDividendsWithdraw } from "./types";

function DividendsTable() {
  const [dividends, setDividends] = useState<IDividendsWithdraw[]>([]);
  const fetchDividendsExpenses = async () => {
    const response = await apiClient.get("/expenses/dividends");
    const { data } = response;
    setDividends(data);
  };

  useEffect(() => {
    fetchDividendsExpenses();
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres y Appellidos</TableHead>
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dividends.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date.toLocaleString()}</TableCell>
            <TableCell>{item.user.name + " " + item.user.lastname}</TableCell>
            <TableCell className="font-medium">{item.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function DividendsPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Utilidades Distribuidas</h1>
        <DialogForm>
          <DividendsWithdrawForm />
        </DialogForm>
      </div>
      <DividendsTable />
    </>
  );
}
