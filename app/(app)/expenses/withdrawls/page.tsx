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
import { WithdrawForm } from "@/app/(app)/expenses/withdrawls/WithdrawForm";
import { useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { IWithdrawal } from "./types";

function WithdrawlsTable() {
  const [withdrawls, setWithdrawls] = useState<IWithdrawal[]>([]);

  const fetchWithdrawls = async () => {
    const response = await apiClient.get("/withdrawals");
    const { data } = response;
    setWithdrawls(data);
  };

  useEffect(() => {
    fetchWithdrawls();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres</TableHead>
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {withdrawls.map((item, i) => (
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
export default function WithdrawlsPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Retiros</h1>
        <DialogForm>
          <WithdrawForm />
        </DialogForm>
      </div>
      <WithdrawlsTable />
    </>
  );
}
