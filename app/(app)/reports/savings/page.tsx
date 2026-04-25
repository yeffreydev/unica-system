"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { exportToExcel, exportToPDF, ReportColumn } from "@/lib/reportExport";
import {
  defaultRange, fmtCurrency, generateMonthOptions, monthShort, monthValToISO, rangeLabel,
} from "@/lib/reportRange";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";

interface ICell {
  deposits: number;
  withdrawals: number;
  interestPaid: number;
  balanceEnd: number;
}

interface IRow {
  userId: string;
  name: string;
  lastname: string;
  dni: string;
  byMonth: Record<string, ICell>;
}

interface IData {
  months: string[];
  rows: IRow[];
}

export default function SavingsReportPage() {
  const { bank } = useContext(AppContext);
  const init = defaultRange();
  const [startMonth, setStartMonth] = useState(init.startVal);
  const [endMonth, setEndMonth] = useState(init.endVal);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IData>({ months: [], rows: [] });

  useEffect(() => {
    apiClient
      .get(`/reports/savings/range?startDate=${monthValToISO(startMonth)}&endDate=${monthValToISO(endMonth, true)}`)
      .then(r => setData(r.data))
      .catch(() => {});
  }, [startMonth, endMonth]);

  const filtered = useMemo(
    () => data.rows.filter(r => `${r.name} ${r.lastname}`.toLowerCase().includes(search.toLowerCase())),
    [data.rows, search],
  );

  const period = rangeLabel(startMonth, endMonth);
  const monthOptions = generateMonthOptions();

  const summary = filtered.map(r => {
    const totals = data.months.reduce(
      (acc, m) => {
        const c = r.byMonth[m];
        if (!c) return acc;
        return {
          deposits: acc.deposits + c.deposits,
          withdrawals: acc.withdrawals + c.withdrawals,
          interestPaid: acc.interestPaid + c.interestPaid,
        };
      },
      { deposits: 0, withdrawals: 0, interestPaid: 0 },
    );
    const lastMonth = data.months[data.months.length - 1];
    const finalBalance = lastMonth ? r.byMonth[lastMonth]?.balanceEnd ?? 0 : 0;
    return { ...r, ...totals, finalBalance };
  });

  const columns: ReportColumn[] = [
    { header: "Apellidos", key: "lastname" },
    { header: "Nombres", key: "name" },
    { header: "DNI", key: "dni" },
    ...data.months.map<ReportColumn>(m => ({ header: monthShort(m), key: m })),
    { header: "Total Dep", key: "deposits", format: "currency", align: "right" },
    { header: "Total Ret", key: "withdrawals", format: "currency", align: "right" },
    { header: "Total Int", key: "interestPaid", format: "currency", align: "right" },
    { header: "Saldo Final", key: "finalBalance", format: "currency", align: "right" },
  ];

  const cellText = (c: ICell | undefined) => {
    if (!c) return "";
    const lines: string[] = [];
    if (c.deposits) lines.push(`Dep ${fmtCurrency(c.deposits)}`);
    if (c.withdrawals) lines.push(`Ret ${fmtCurrency(c.withdrawals)}`);
    if (c.interestPaid) lines.push(`Int ${fmtCurrency(c.interestPaid)}`);
    lines.push(`Saldo ${fmtCurrency(c.balanceEnd)}`);
    return lines.join("\n");
  };

  const exportRows = summary.map(r => {
    const monthCols: Record<string, string> = {};
    for (const m of data.months) monthCols[m] = cellText(r.byMonth[m]);
    return {
      lastname: r.lastname, name: r.name, dni: r.dni,
      ...monthCols,
      deposits: r.deposits, withdrawals: r.withdrawals, interestPaid: r.interestPaid, finalBalance: r.finalBalance,
    };
  });

  const totalsRow: Record<string, unknown> = {
    lastname: "TOTAL", name: "", dni: "",
    deposits: summary.reduce((a, s) => a + s.deposits, 0),
    withdrawals: summary.reduce((a, s) => a + s.withdrawals, 0),
    interestPaid: summary.reduce((a, s) => a + s.interestPaid, 0),
    finalBalance: summary.reduce((a, s) => a + s.finalBalance, 0),
  };
  for (const m of data.months) {
    const colTotals = summary.reduce(
      (acc, r) => {
        const c = r.byMonth[m];
        if (!c) return acc;
        return { dep: acc.dep + c.deposits, int: acc.int + c.interestPaid };
      },
      { dep: 0, int: 0 },
    );
    totalsRow[m] = `Dep ${fmtCurrency(colTotals.dep)}\nInt ${fmtCurrency(colTotals.int)}`;
  }

  const meta = {
    title: "Reporte de Ahorros por Mes",
    bankName: bank?.bank?.name,
    period,
    fileName: `reporte-ahorros-${startMonth}_a_${endMonth}`,
  };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Reporte de Ahorros</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">Deposito, retiro, interes pagado y saldo acumulado por socio.</p>
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
              <Input placeholder="Buscar nombre..." value={search} onChange={e => setSearch(e.target.value)} className="col-span-2 md:w-[180px]" />
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
                  <th className="sticky left-0 bg-muted z-20 text-left px-3 py-2 border-b min-w-[140px]">Apellidos</th>
                  <th className="text-left px-3 py-2 border-b min-w-[120px]">Nombres</th>
                  <th className="text-left px-3 py-2 border-b min-w-[80px] hidden md:table-cell">DNI</th>
                  {data.months.map(m => (
                    <th key={m} className="text-center px-2 py-2 border-b min-w-[150px]">{monthShort(m)}</th>
                  ))}
                  <th className="text-right px-2 py-2 border-b min-w-[110px] bg-muted">Total Dep</th>
                  <th className="text-right px-2 py-2 border-b min-w-[110px] bg-muted">Total Int</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px] bg-muted">Saldo Final</th>
                </tr>
              </thead>
              <tbody>
                {summary.length === 0 ? (
                  <tr><td colSpan={4 + data.months.length + 3} className="text-center text-muted-foreground py-6">Sin registros</td></tr>
                ) : summary.map(r => (
                  <tr key={r.userId} className="hover:bg-muted/40">
                    <td className="sticky left-0 bg-background z-10 px-3 py-2 border-b font-medium">{r.lastname}</td>
                    <td className="px-3 py-2 border-b">{r.name}</td>
                    <td className="px-3 py-2 border-b hidden md:table-cell">{r.dni}</td>
                    {data.months.map(m => {
                      const c = r.byMonth[m];
                      return (
                        <td key={m} className="text-right px-2 py-2 border-b text-[11px] leading-tight">
                          {c?.deposits ? <div className="text-green-700">+{fmtCurrency(c.deposits)}</div> : null}
                          {c?.withdrawals ? <div className="text-red-700">-{fmtCurrency(c.withdrawals)}</div> : null}
                          {c?.interestPaid ? <div className="text-blue-700">i {fmtCurrency(c.interestPaid)}</div> : null}
                          <div className="font-medium">{fmtCurrency(c?.balanceEnd ?? 0)}</div>
                        </td>
                      );
                    })}
                    <td className="text-right px-2 py-2 border-b">{fmtCurrency(r.deposits)}</td>
                    <td className="text-right px-2 py-2 border-b">{fmtCurrency(r.interestPaid)}</td>
                    <td className="text-right px-2 py-2 border-b font-semibold">{fmtCurrency(r.finalBalance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td className="sticky left-0 bg-muted z-10 px-3 py-2 border-t font-semibold" colSpan={3}>Totales</td>
                  {data.months.map(m => {
                    const t = summary.reduce((a, r) => {
                      const c = r.byMonth[m];
                      if (!c) return a;
                      return { dep: a.dep + c.deposits, int: a.int + c.interestPaid, bal: a.bal + c.balanceEnd };
                    }, { dep: 0, int: 0, bal: 0 });
                    return (
                      <td key={m} className="text-right px-2 py-2 border-t text-[11px]">
                        <div className="text-green-700">{fmtCurrency(t.dep)}</div>
                        <div className="text-blue-700">{fmtCurrency(t.int)}</div>
                        <div className="font-medium">{fmtCurrency(t.bal)}</div>
                      </td>
                    );
                  })}
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(totalsRow.deposits as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(totalsRow.interestPaid as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(totalsRow.finalBalance as number)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
