import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { ISocialFunds, ISocialFundsTransaction } from "@/types/ISocialFunds";
import { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LegalsDialog } from "./LegalsDialog";
import { SocialLegalFundsForm } from "./SocialLegalFundsForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LegalsTable() {
  const [socialFundsTransactions, setSocialFundsTransactions] = useState<
    ISocialFundsTransaction[]
  >([]);

  const {
    bank: { bank },
  } = useContext(AppContext);
  const [socialFunds, setSocialFunds] = useState<ISocialFunds[]>([]);

  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchSocialFunds = async () => {
      const response = await apiClient.get("/social-funds");
      const data = response.data;

      setSocialFunds(data);
    };
    fetchSocialFunds();
  }, []);

  useEffect(() => {
    const fetchSocialFundsTransactions = async () => {
      const response = await apiClient.get("/social-funds/transactions");
      const data = response.data;

      console.log(data);

      setSocialFundsTransactions(data);
    };
    fetchSocialFundsTransactions();
  }, []);
  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar nombres..."
          className="max-w-sm mr-auto bg-background border-border"
        />
        <LegalsDialog open={openDialog} onOpenChange={setOpenDialog}>
          <SocialLegalFundsForm
            socialFunds={socialFunds}
            setOpenDialog={setOpenDialog}
            socialFundsTransactions={socialFundsTransactions}
            setSocialFundsTransactions={setSocialFundsTransactions}
          />
        </LegalsDialog>
      </div>
      <Table className="bg-background border-border">
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Nombres </TableHead>
            <TableHead>Nombre del Fondo</TableHead>
            <TableHead>Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody cy-data="loans-table-body">
          {socialFundsTransactions.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{item.date.toLocaleString()}</TableCell>
              <TableCell>{bank.name}</TableCell>
              <TableCell className="font-medium">
                {socialFunds.find((fund) => fund.name === item.socialFunds.name)
                  ?.name || ""}
              </TableCell>
              <TableCell className="font-medium">{item.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
