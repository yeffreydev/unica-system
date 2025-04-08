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
import { OtherIncomeForm } from "@/app/(app)/incomes/others/OtherIncomeForm";
import { useContext, useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { IIncome } from "./types";
import { AppContext } from "@/context/AppContext";

function OtherIncomesTable() {
  const [otherIncomes, setOtherIncomes] = useState<IIncome[]>([]);
  const {
    bank: { bank },
  } = useContext(AppContext);

  useEffect(() => {
    const fetchOtherIncomes = async () => {
      const response = await apiClient.get("/incomes/others");
      const data = response.data;

      console.log(data);

      setOtherIncomes(data);
    };
    fetchOtherIncomes();
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
        {otherIncomes.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              {item.user
                ? item.user.name + " " + item.user.lastname
                : bank.name}
            </TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell className="font-medium">{item.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function OtherIncomesPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Otros Ingresos</h1>
        <DialogForm>
          <OtherIncomeForm />
        </DialogForm>
      </div>
      <OtherIncomesTable />
    </>
  );
}
