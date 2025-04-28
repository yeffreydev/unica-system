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
import { InterestPaymentForm } from "@/app/(app)/expenses/interest/InterestPaymentForm";
import apiClient from "@/config/apiClient";
import { useEffect, useState } from "react";
import { IPayout } from "./types";

function InterestTable() {
  const [payouts, setPayouts] = useState<IPayout[]>([]);

  const fetchPayouts = async () => {
    const response = await apiClient.get("/payouts");
    const { data } = response;
    setPayouts(data);
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
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date.toLocaleString()}</TableCell>
            <TableCell>{item.user.name}</TableCell>
            <TableCell className="font-medium">{item.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function InterestPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Intereses Pagados</h1>
        <DialogForm>
          <InterestPaymentForm />
        </DialogForm>
      </div>
      <InterestTable />
    </>
  );
}
