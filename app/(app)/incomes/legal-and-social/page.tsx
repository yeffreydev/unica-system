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
import { SocialLegalFundsForm } from "@/components/forms/SocialLegalFundsForm";
import { use, useContext, useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { ISocialFunds, ISocialFundsTransaction } from "@/types/ISocialFunds";
import { socialFundsData } from "@/constants";
import { AppContext } from "@/context/AppContext";

const equityData = [
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    socialFund: "1000",
    reserveFund: "1000",
    date: "2021-10-10",
  },
];

function EquityTable() {
  const [socialFundsTransactions, setSocialFundsTransactions] = useState<
    ISocialFundsTransaction[]
  >([]);

  const {
    bank: { bank },
  } = useContext(AppContext);

  useEffect(() => {
    const fetchSocialFundsTransactions = async () => {
      const response = await apiClient.get("/social-funds/transactions");
      const data = response.data;

      setSocialFundsTransactions(data);
    };
    fetchSocialFundsTransactions();
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres </TableHead>
          <TableHead>Nombre del Fondo</TableHead>
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {socialFundsTransactions.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date.toLocaleString()}</TableCell>
            <TableCell>{bank.name}</TableCell>
            <TableCell className="font-medium">
              {
                socialFundsData[
                  item.socialFunds.name as keyof typeof socialFundsData
                ]
              }
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
          <SocialLegalFundsForm socialFunds={socialFunds} />
        </DialogForm>
      </div>
      <EquityTable />
    </>
  );
}
