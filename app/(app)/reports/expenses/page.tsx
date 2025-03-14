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
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
  {
    date: "2021-10-10",
    fullname: "nombres y apelliods",
    savings: "1000",
    loans: "1000",
    interests: "1000",
    adminexpenses: "1000",
    dividends: "1000",
    reserve: "1000",
    socialFund: "1000",
    others: "1000",
  },
];
function ExpensesReportTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres y Appellidos</TableHead>
          <TableHead>Retiro Ahorros</TableHead>
          <TableHead>Prestamos</TableHead>
          <TableHead>Intereses Pagados </TableHead>
          <TableHead>Gastos Administrativos </TableHead>
          <TableHead>Utilidad Distribuida</TableHead>
          <TableHead>Reserva Legal</TableHead>
          <TableHead>Fondo Social</TableHead>
          <TableHead>Otros</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {capitalPayments.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.fullname}</TableCell>
            <TableCell>{item.savings}</TableCell>
            <TableCell>{item.loans}</TableCell>
            <TableCell>{item.interests}</TableCell>
            <TableCell>{item.adminexpenses}</TableCell>
            <TableCell>{item.dividends}</TableCell>
            <TableCell>{item.reserve}</TableCell>
            <TableCell>{item.socialFund}</TableCell>
            <TableCell>{item.others}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Total de Egresos del Mes
          </TableCell>
          <TableCell>S/. 00</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Egresos acumulados al mes anterior
          </TableCell>
          <TableCell>S/. 00</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Total de egresos Acumulados a la Fecha
          </TableCell>
          <TableCell>S/. 00</TableCell>
          <TableCell>S/. 100</TableCell>
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
export default function ExpensesReportPage() {
  return (
    <>
      <div>
        <h1>Reporte de Egresos</h1>
      </div>
      <ExpensesReportTable />
    </>
  );
}
