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
import { AdminExpenseForm } from "@/app/(app)/expenses/administrative/AdminExpenseForm";
import { useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { IAdministrativeExpense } from "./types";

function AdministrativeTable() {
  const [administrativeExpenses, setAdministrativeExpenses] = useState<
    IAdministrativeExpense[]
  >([]);
  const fetchAdministrativeExpenses = async () => {
    const response = await apiClient.get("/expenses/administrative");
    const { data } = response;
    setAdministrativeExpenses(data);
  };

  useEffect(() => {
    fetchAdministrativeExpenses();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres</TableHead>
          <TableHead>Descripcion</TableHead>
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {administrativeExpenses.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date.toLocaleString()}</TableCell>
            <TableCell>{item.user.name + " " + item.user.lastname}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell className="font-medium">{item.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function AdministrativePage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Gastos Administrativos</h1>
        <DialogForm>
          <AdminExpenseForm />
        </DialogForm>
      </div>
      <AdministrativeTable />
    </>
  );
}
