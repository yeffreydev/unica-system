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
import { CapitalAndInterestForm } from "@/components/forms/CapitalAndInterestForm";

const capitalPayments = [
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
];

export function CapitalPaymentsTable() {
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
        {capitalPayments.map((deposit, i) => (
          <TableRow key={i}>
            <TableCell>{deposit.date}</TableCell>
            <TableCell>{deposit.fullname}</TableCell>
            <TableCell className="font-medium">{deposit.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function CapitalPaymentsPage() {
  return (
    <Container>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">
          Pagos de Capital e Intereses Recibidos
        </h1>
        <DialogForm>
          <CapitalAndInterestForm />
        </DialogForm>
      </div>
      <CapitalPaymentsTable />
    </Container>
  );
}
