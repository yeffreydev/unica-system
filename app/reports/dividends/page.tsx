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

const dividendsData = [
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

export function DividendsTable() {
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
        {dividendsData.map((item, i) => (
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
export default function DividendsPage() {
  return (
    <Container>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Utilidades Distribuidas</h1>
        <Button>Agregar</Button>
      </div>
      <DividendsTable />
    </Container>
  );
}
