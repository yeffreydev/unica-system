import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function BalanceTable() {
  return (
    <Table className="w-max">
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="font-semibold text-center">
            S/.
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>1. Saldo del mes anterior</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>2. Ingresos del mes</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>3. Saldo Bruto del Mes (2+1)</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Egresos del Mes</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Saldo Neto del Mes (3-4)</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
export function CashCountTable() {
  return (
    <Table className="w-max">
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="font-semibold text-center">
            Arqueo de Caja
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Valor Efectivo</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Depósitos en Bancos o cooperativas</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Sobrante</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Faltante</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export function AccumulatedTable() {
  return (
    <Table className="w-max">
      <TableBody>
        <TableRow>
          <TableCell>TOTAL DE INGRESOS ACUMULADOS A LA FECHA (*) S/.</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>TOTAL DE EGRESOS ACUMULADOS A LA FECHA (*) S/.</TableCell>
          <TableCell>S/. 100</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default function CashCountPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Arqueo de Caja</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tablas</h2>
        <div className="ml-4">
          <h3 className="text-lg font-medium mb-2">Saldos</h3>
          <BalanceTable />
        </div>
        <div className="ml-4 mt-4">
          <h3 className="text-lg font-medium mb-2">Arqueo de Caja</h3>
          <CashCountTable />
        </div>
        <div className="ml-4 mt-4">
          <h3 className="text-lg font-medium mb-2">Acumulados</h3>
          <AccumulatedTable />
        </div>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Abreviaturas</h2>
        <div className="ml-4">
          <p>A = Pagos de Capital Acumulado.</p>
          <p>B = Prestamos Acumulados</p>
          <p>PV = Prestamo Vigente</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Formulas</h2>
        <div className="ml-4">
          <p>A = Pagos de Capital Acumulado.</p>
          <p>B = Prestamos Acumulados</p>
          <p>PV = Prestamo Vigente</p>
        </div>
      </section>
    </>
  );
}
