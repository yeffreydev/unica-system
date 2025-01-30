import { Button } from "@/components/ui/button";
import Container from "../../ui/Container";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const interestIncomes = [
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

export function InterestIncomeTable() {
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
        {interestIncomes.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.fullname}</TableCell>
            <TableCell className="font-medium">{item.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function InterestIncomePage() {
  return (
    <Container>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Intereses Recibidos</h1>
        <Button>Agregar</Button>
      </div>
      <InterestIncomeTable />
    </Container>
  );
}
