import { useContext, useEffect, useState } from "react";
import { IIncome } from "./types";
import { AppContext } from "@/context/AppContext";
import apiClient from "@/config/apiClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OtherIncomeForm } from "./OtherIncomeForm";
import { OthersDialog } from "./OthersDialog";
import { Input } from "@/components/ui/input";

export default function OthersTable() {
  const [otherIncomes, setOtherIncomes] = useState<IIncome[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  const {
    bank: { bank },
  } = useContext(AppContext);

  useEffect(() => {
    const fetchOtherIncomes = async () => {
      const response = await apiClient.get("/incomes/others");
      const data = response.data;

      console.log(data);

      setOtherIncomes(data.reverse());
    };
    fetchOtherIncomes();
  }, []);
  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar nombres..."
          className="max-w-sm mr-auto bg-background border-border"
        />
        <OthersDialog open={openDialog} onOpenChange={setOpenDialog}>
          <OtherIncomeForm
            otherIncomes={otherIncomes}
            setOtherIncomes={setOtherIncomes}
            setOpenDialog={setOpenDialog}
          />
        </OthersDialog>
      </div>

      <Table className="bg-background border-border">
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Nombres</TableHead>
            <TableHead>Descripcion</TableHead>
            <TableHead>Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody cy-data="loans-table-body">
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
    </div>
  );
}
