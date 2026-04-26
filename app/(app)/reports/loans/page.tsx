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
  newLoans: number;
  capital: number;
  interest: number;
  balanceEnd: number;
}

interface IRow {
  userId: string;
  name: string;
  lastname: string;
  dni: string;
  loanTypes: string[];
  byMonth: Record<string, ICell>;
}

interface IData {
  months: string[];
  rows: IRow[];
}

export default function LoansReportPage() {
  const { bank } = useContext(AppContext);
  const init = defaultRange();
  const [startMonth, setStartMonth] = useState(init.startVal);
  const [endMonth, setEndMonth] = useState(init.endVal);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IData>({ months: [], rows: [] });

  useEffect(() => {
    apiClient
      .get(`/reports/loans/range?startDate=${monthValToISO(startMonth)}&endDate=${monthValToISO(endMonth, true)}`)
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
          newLoans: acc.newLoans + c.newLoans,
          capital: acc.capital + c.capital,
          interest: acc.interest + c.interest,
        };
      },
      { newLoans: 0, capital: 0, interest: 0 },
    );
    const lastMonth = data.months[data.months.length - 1];
    const finalBalance = lastMonth ? r.byMonth[lastMonth]?.balanceEnd ?? 0 : 0;
    return { ...r, ...totals, finalBalance };
  });

  const columns: ReportColumn[] = [
    { header: "Nombres", key: "name" },
    { header: "Apellidos", key: "lastname" },
    { header: "DNI", key: "dni" },
    { header: "Tipos", key: "loanTypesStr" },
    ...data.months.map<ReportColumn>(m => ({ header: monthShort(m), key: m })),
    { header: "Total Nuevos", key: "newLoans", format: "currency", align: "right" },
    { header: "Total Cap. Pagado", key: "capital", format: "currency", align: "right" },
    { header: "Total Int. Pagado", key: "interest", format: "currency", align: "right" },
    { header: "Saldo Restante", key: "finalBalance", format: "currency", align: "right" },
  ];

  const cellText = (c: ICell | undefined) => {
    if (!c) return "";
    const lines: string[] = [];
    if (c.newLoans) lines.push(`Saco ${fmtCurrency(c.newLoans)}`);
    if (c.interest) lines.push(`Int ${fmtCurrency(c.interest)}`);
    lines.push(`Cap ${fmtCurrency(c.capital)}`);
    lines.push(`Saldo ${fmtCurrency(c.balanceEnd)}`);
    return lines.join("\n");
  };

  const exportRows = summary.map(r => {
    const monthCols: Record<string, string> = {};
    for (const m of data.months) monthCols[m] = cellText(r.byMonth[m]);
    return {
      name: r.name, lastname: r.lastname, dni: r.dni,
      loanTypesStr: r.loanTypes.join(", "),
      ...monthCols,
      newLoans: r.newLoans, capital: r.capital, interest: r.interest, finalBalance: r.finalBalance,
    };
  });

  const totalsRow: Record<string, unknown> = {
    name: "TOTAL", lastname: "", dni: "", loanTypesStr: "",
    newLoans: summary.reduce((a, s) => a + s.newLoans, 0),
    capital: summary.reduce((a, s) => a + s.capital, 0),
    interest: summary.reduce((a, s) => a + s.interest, 0),
    finalBalance: summary.reduce((a, s) => a + s.finalBalance, 0),
  };
  for (const m of data.months) {
    const t = summary.reduce(
      (acc, r) => {
        const c = r.byMonth[m];
        if (!c) return acc;
        return { nl: acc.nl + c.newLoans, cap: acc.cap + c.capital, int: acc.int + c.interest };
      },
      { nl: 0, cap: 0, int: 0 },
    );
    totalsRow[m] = `Saco ${fmtCurrency(t.nl)}\nInt ${fmtCurrency(t.int)}\nCap ${fmtCurrency(t.cap)}`;
  }

  const meta = {
    title: "Reporte de Prestamos",
    bankName: bank?.bank?.name,
    period,
    fileName: `reporte-prestamos-${startMonth}_a_${endMonth}`,
  };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Reporte de Prestamos</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">Por socio. Cada mes: monto sacado, interes pagado y capital pagado (primordial). Saldo restante de todos sus prestamos al final.</p>
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
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="col-span-2 md:w-[180px]" />
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
                  <th className="sticky left-0 bg-muted z-20 text-left px-3 py-2 border-b min-w-[140px]">Nombres</th>
                  <th className="text-left px-3 py-2 border-b min-w-[140px]">Apellidos</th>
                  <th className="text-left px-3 py-2 border-b min-w-[80px] hidden md:table-cell">DNI</th>
                  <th className="text-left px-3 py-2 border-b min-w-[120px] hidden md:table-cell">Tipos</th>
                  {data.months.map(m => (
                    <th key={m} className="text-center px-2 py-2 border-b min-w-[150px]">{monthShort(m)}</th>
                  ))}
                  <th className="text-right px-2 py-2 border-b min-w-[110px] bg-muted">Tot. Sacado</th>
                  <th className="text-right px-2 py-2 border-b min-w-[110px] bg-muted">Tot. Int.</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px] bg-muted">Tot. Cap.</th>
                  <th className="text-right px-2 py-2 border-b min-w-[140px] bg-muted">Saldo Restante</th>
                </tr>
              </thead>
              <tbody>
                {summary.length === 0 ? (
                  <tr><td colSpan={5 + data.months.length + 4} className="text-center text-muted-foreground py-6">Sin registros</td></tr>
                ) : summary.map(r => (
                  <tr key={r.userId} className="hover:bg-muted/40">
                    <td className="sticky left-0 bg-background z-10 px-3 py-2 border-b font-medium">{r.name}</td>
                    <td className="px-3 py-2 border-b">{r.lastname}</td>
                    <td className="px-3 py-2 border-b hidden md:table-cell">{r.dni}</td>
                    <td className="px-3 py-2 border-b hidden md:table-cell text-[11px] text-muted-foreground">{r.loanTypes.join(", ")}</td>
                    {data.months.map(m => {
                      const c = r.byMonth[m];
                      return (
                        <td key={m} className="text-right px-2 py-2 border-b text-[11px] leading-tight">
                          {c?.newLoans ? <div className="text-amber-700">Saco {fmtCurrency(c.newLoans)}</div> : null}
                          {c?.interest ? <div className="text-blue-700">Int {fmtCurrency(c.interest)}</div> : null}
                          <div className="text-green-700 font-semibold">Cap {fmtCurrency(c?.capital ?? 0)}</div>
                          <div className="text-muted-foreground">Saldo {fmtCurrency(c?.balanceEnd ?? 0)}</div>
                        </td>
                      );
                    })}
                    <td className="text-right px-2 py-2 border-b text-amber-700">{fmtCurrency(r.newLoans)}</td>
                    <td className="text-right px-2 py-2 border-b text-blue-700">{fmtCurrency(r.interest)}</td>
                    <td className="text-right px-2 py-2 border-b text-green-700 font-semibold">{fmtCurrency(r.capital)}</td>
                    <td className="text-right px-2 py-2 border-b font-bold">{fmtCurrency(r.finalBalance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td className="sticky left-0 bg-muted z-10 px-3 py-2 border-t font-semibold" colSpan={4}>Totales</td>
                  {data.months.map(m => {
                    const t = summary.reduce((a, r) => {
                      const c = r.byMonth[m];
                      if (!c) return a;
                      return { nl: a.nl + c.newLoans, cap: a.cap + c.capital, int: a.int + c.interest };
                    }, { nl: 0, cap: 0, int: 0 });
                    return (
                      <td key={m} className="text-right px-2 py-2 border-t text-[11px]">
                        <div className="text-amber-700">{fmtCurrency(t.nl)}</div>
                        <div className="text-blue-700">{fmtCurrency(t.int)}</div>
                        <div className="text-green-700 font-semibold">{fmtCurrency(t.cap)}</div>
                      </td>
                    );
                  })}
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(totalsRow.newLoans as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(totalsRow.interest as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(totalsRow.capital as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-bold">{fmtCurrency(totalsRow.finalBalance as number)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
