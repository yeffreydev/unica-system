import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const capitalPayments = [
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    deposit: "1000",
    capitalPayments: "1000",
    interests: "1000",
    stocks: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
];

function IncomesReportTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres y Appellidos</TableHead>
          <TableHead>Deposito Ahorros</TableHead>
          <TableHead>Pagos de Capital</TableHead>
          <TableHead>Intereses Recibidos </TableHead>
          <TableHead>Acciones</TableHead>
          <TableHead>Reserva Legal</TableHead>
          <TableHead>Fondo Social</TableHead>
          <TableHead>Otros</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {capitalPayments.map((deposit, i) => (
          <TableRow key={i}>
            <TableCell>{deposit.date}</TableCell>
            <TableCell>{deposit.fullname}</TableCell>
            <TableCell>{deposit.deposit}</TableCell>
            <TableCell>{deposit.capitalPayments}</TableCell>
            <TableCell>{deposit.interests}</TableCell>
            <TableCell>{deposit.stocks}</TableCell>
            <TableCell>{deposit.reserve}</TableCell>
            <TableCell>{deposit.socialFund}</TableCell>
            <TableCell>{deposit.others}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Total Ingresos del Mes
          </TableCell>
          <TableCell>S/. 00</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Ingresos Acumulados del Mes Anterior
          </TableCell>
          <TableCell>S/. 00</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Total de Ingresos Acumulados a la Fecha
          </TableCell>
          <TableCell>S/. 00</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
export default function IncomesReportPage() {
  return (
    <>
      <div>
        <h1>Reporte de Ingresos</h1>
      </div>
      <IncomesReportTable />
    </>
  );
}
