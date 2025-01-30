import { Button } from "@/components/ui/button";
import Container from "../../ui/Container";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { SocialLegalFundsWithdrawForm } from "@/components/forms/SocialLegalFundsExpenseForm";

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

export function EquityTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres y Appellidos</TableHead>
          <TableHead>Fondo Social</TableHead>
          <TableHead>Reserva Legal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {equityData.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.fullname}</TableCell>
            <TableCell className="font-medium">{item.socialFund}</TableCell>
            <TableCell className="font-medium">{item.reserveFund}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function LegalAndSocialPage() {
  return (
    <Container>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Fondo Social y Reserva Legal</h1>
        <DialogForm>
          <SocialLegalFundsWithdrawForm />
        </DialogForm>
      </div>
      <EquityTable />
    </Container>
  );
}
