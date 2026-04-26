"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { exportToExcel, exportToPDF, ReportColumn } from "@/lib/reportExport";
import {
  defaultRange, fmtCurrency, generateMonthOptions, monthFull, monthValToISO, rangeLabel,
} from "@/lib/reportRange";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useContext, useEffect, useState } from "react";

interface IRow {
  month: string;
  previousBalance: number;
  monthIncomes: number;
  grossBalance: number;
  monthExpenses: number;
  netBalance: number;
  accIncomes: number;
  accExpenses: number;
}

interface IData {
  months: string[];
  rows: IRow[];
}

export default function CashCountReportPage() {
  const { bank } = useContext(AppContext);
  const init = defaultRange();
  const [startMonth, setStartMonth] = useState(init.startVal);
  const [endMonth, setEndMonth] = useState(init.endVal);
  const [data, setData] = useState<IData>({ months: [], rows: [] });

  useEffect(() => {
    apiClient
      .get(`/reports/cash-count/range?startDate=${monthValToISO(startMonth)}&endDate=${monthValToISO(endMonth, true)}`)
      .then(r => setData(r.data))
      .catch(() => {});
  }, [startMonth, endMonth]);

  const period = rangeLabel(startMonth, endMonth);
  const monthOptions = generateMonthOptions();

  const columns: ReportColumn[] = [
    { header: "Mes", key: "month" },
    { header: "Saldo del mes anterior", key: "previousBalance", format: "currency", align: "right" },
    { header: "Ingresos del mes", key: "monthIncomes", format: "currency", align: "right" },
    { header: "Saldo Bruto del Mes", key: "grossBalance", format: "currency", align: "right" },
    { header: "Egresos del Mes", key: "monthExpenses", format: "currency", align: "right" },
    { header: "Saldo Neto del Mes", key: "netBalance", format: "currency", align: "right" },
    { header: "Total Ingresos Acumulados", key: "accIncomes", format: "currency", align: "right" },
    { header: "Total Egresos Acumulados", key: "accExpenses", format: "currency", align: "right" },
  ];

  const exportRows = data.rows.map(r => ({
    month: monthFull(r.month),
    previousBalance: r.previousBalance,
    monthIncomes: r.monthIncomes,
    grossBalance: r.grossBalance,
    monthExpenses: r.monthExpenses,
    netBalance: r.netBalance,
    accIncomes: r.accIncomes,
    accExpenses: r.accExpenses,
  }));

  const totals = data.rows.reduce(
    (a, r) => ({
      monthIncomes: a.monthIncomes + r.monthIncomes,
      monthExpenses: a.monthExpenses + r.monthExpenses,
    }),
    { monthIncomes: 0, monthExpenses: 0 },
  );
  const lastRow = data.rows[data.rows.length - 1];

  const totalsRow: Record<string, unknown> = {
    month: "TOTAL",
    previousBalance: "",
    monthIncomes: totals.monthIncomes,
    grossBalance: "",
    monthExpenses: totals.monthExpenses,
    netBalance: lastRow?.netBalance ?? 0,
    accIncomes: lastRow?.accIncomes ?? 0,
    accExpenses: lastRow?.accExpenses ?? 0,
  };

  const meta = {
    title: "Reporte de Cuadre de Caja",
    bankName: bank?.bank?.name,
    period,
    fileName: `reporte-cuadre-caja-${startMonth}_a_${endMonth}`,
  };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Reporte de Cuadre de Caja</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">Una fila por mes. Saldo neto del mes anterior se acarrea al siguiente.</p>
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2">
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger className="w-full md:w-[170px]"><SelectValue placeholder="Desde" /></SelectTrigger>
                <SelectContent>{monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={endMonth} onValueChange={setEndMonth}>
                <SelectTrigger className="w-full md:w-[170px]"><SelectValue placeholder="Hasta" /></SelectTrigger>
                <SelectContent>{monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={() => exportToPDF(meta, columns, exportRows, totalsRow)} className="bg-red-600 hover:bg-red-700 text-white">
                <FileText className="w-4 h-4 mr-1" />PDF
              </Button>
              <Button onClick={() => exportToExcel(meta, columns, exportRows, totalsRow)} className="bg-green-600 hover:bg-green-700 text-white">
                <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0 md:p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 bg-muted z-20 text-left px-3 py-2 border-b min-w-[140px]">Mes</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px]">Saldo Anterior</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px]">Ingresos</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px]">Saldo Bruto</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px]">Egresos</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px] bg-muted">Saldo Neto</th>
                  <th className="text-right px-2 py-2 border-b min-w-[140px]">Acum. Ingresos</th>
                  <th className="text-right px-2 py-2 border-b min-w-[140px]">Acum. Egresos</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted-foreground py-6">Sin registros</td></tr>
                ) : data.rows.map(r => (
                  <tr key={r.month} className="hover:bg-muted/40">
                    <td className="sticky left-0 bg-background z-10 px-3 py-2 border-b font-medium">{monthFull(r.month)}</td>
                    <td className="text-right px-2 py-2 border-b">{fmtCurrency(r.previousBalance)}</td>
                    <td className="text-right px-2 py-2 border-b text-green-700">{fmtCurrency(r.monthIncomes)}</td>
                    <td className="text-right px-2 py-2 border-b">{fmtCurrency(r.grossBalance)}</td>
                    <td className="text-right px-2 py-2 border-b text-red-700">{fmtCurrency(r.monthExpenses)}</td>
                    <td className="text-right px-2 py-2 border-b font-semibold">{fmtCurrency(r.netBalance)}</td>
                    <td className="text-right px-2 py-2 border-b text-muted-foreground">{fmtCurrency(r.accIncomes)}</td>
                    <td className="text-right px-2 py-2 border-b text-muted-foreground">{fmtCurrency(r.accExpenses)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td className="sticky left-0 bg-muted z-10 px-3 py-2 border-t font-semibold">Totales</td>
                  <td className="text-right px-2 py-2 border-t text-muted-foreground">—</td>
                  <td className="text-right px-2 py-2 border-t font-semibold text-green-700">{fmtCurrency(totals.monthIncomes)}</td>
                  <td className="text-right px-2 py-2 border-t text-muted-foreground">—</td>
                  <td className="text-right px-2 py-2 border-t font-semibold text-red-700">{fmtCurrency(totals.monthExpenses)}</td>
                  <td className="text-right px-2 py-2 border-t font-bold">{fmtCurrency(lastRow?.netBalance ?? 0)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(lastRow?.accIncomes ?? 0)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(lastRow?.accExpenses ?? 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
