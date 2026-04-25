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
  quantity: number;
  value: number;
}

interface IRow {
  userId: string;
  name: string;
  lastname: string;
  dni: string;
  byMonth: Record<string, ICell>;
  totalQty: number;
  totalValue: number;
}

interface IData {
  months: string[];
  rows: IRow[];
}

export default function StocksReportPage() {
  const { bank } = useContext(AppContext);
  const init = defaultRange();
  const [startMonth, setStartMonth] = useState(init.startVal);
  const [endMonth, setEndMonth] = useState(init.endVal);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IData>({ months: [], rows: [] });

  useEffect(() => {
    apiClient
      .get(`/reports/stocks/range?startDate=${monthValToISO(startMonth)}&endDate=${monthValToISO(endMonth, true)}`)
      .then(r => setData(r.data))
      .catch(() => {});
  }, [startMonth, endMonth]);

  const filtered = useMemo(
    () => data.rows.filter(r => `${r.name} ${r.lastname}`.toLowerCase().includes(search.toLowerCase())),
    [data.rows, search],
  );

  const period = rangeLabel(startMonth, endMonth);
  const monthOptions = generateMonthOptions();

  const columns: ReportColumn[] = [
    { header: "Apellidos", key: "lastname" },
    { header: "Nombres", key: "name" },
    { header: "DNI", key: "dni" },
    ...data.months.map<ReportColumn>(m => ({ header: monthShort(m), key: m })),
    { header: "Total Cant.", key: "totalQty", format: "number", align: "right" },
    { header: "Total Valor", key: "totalValue", format: "currency", align: "right" },
  ];

  const cellText = (c: ICell | undefined) => {
    if (!c || (!c.quantity && !c.value)) return "";
    return `${c.quantity} acc.\n${fmtCurrency(c.value)}`;
  };

  const exportRows = filtered.map(r => {
    const monthCols: Record<string, string> = {};
    for (const m of data.months) monthCols[m] = cellText(r.byMonth[m]);
    return {
      lastname: r.lastname, name: r.name, dni: r.dni,
      ...monthCols,
      totalQty: r.totalQty, totalValue: r.totalValue,
    };
  });

  const grandQty = filtered.reduce((a, r) => a + r.totalQty, 0);
  const grandVal = filtered.reduce((a, r) => a + r.totalValue, 0);

  const totalsRow: Record<string, unknown> = {
    lastname: "TOTAL", name: "", dni: "",
    totalQty: grandQty, totalValue: grandVal,
  };
  for (const m of data.months) {
    const t = filtered.reduce(
      (a, r) => {
        const c = r.byMonth[m];
        if (!c) return a;
        return { qty: a.qty + c.quantity, val: a.val + c.value };
      },
      { qty: 0, val: 0 },
    );
    totalsRow[m] = `${t.qty} acc.\n${fmtCurrency(t.val)}`;
  }

  const meta = {
    title: "Reporte de Acciones",
    bankName: bank?.bank?.name,
    period,
    fileName: `reporte-acciones-${startMonth}_a_${endMonth}`,
  };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Reporte de Acciones</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">Cantidad y valor por mes y socio. Suma total al final.</p>
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
                  <th className="sticky left-0 bg-muted z-20 text-left px-3 py-2 border-b min-w-[140px]">Apellidos</th>
                  <th className="text-left px-3 py-2 border-b min-w-[120px]">Nombres</th>
                  <th className="text-left px-3 py-2 border-b min-w-[80px] hidden md:table-cell">DNI</th>
                  {data.months.map(m => (
                    <th key={m} className="text-center px-2 py-2 border-b min-w-[110px]">{monthShort(m)}</th>
                  ))}
                  <th className="text-right px-2 py-2 border-b min-w-[100px] bg-muted">Total Cant.</th>
                  <th className="text-right px-2 py-2 border-b min-w-[120px] bg-muted">Total Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4 + data.months.length + 2} className="text-center text-muted-foreground py-6">Sin registros</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.userId} className="hover:bg-muted/40">
                    <td className="sticky left-0 bg-background z-10 px-3 py-2 border-b font-medium">{r.lastname}</td>
                    <td className="px-3 py-2 border-b">{r.name}</td>
                    <td className="px-3 py-2 border-b hidden md:table-cell">{r.dni}</td>
                    {data.months.map(m => {
                      const c = r.byMonth[m];
                      if (!c || (!c.quantity && !c.value)) return <td key={m} className="text-center px-2 py-2 border-b text-muted-foreground">—</td>;
                      return (
                        <td key={m} className="text-right px-2 py-2 border-b text-[11px] leading-tight">
                          <div className="font-medium">{c.quantity} acc.</div>
                          <div>{fmtCurrency(c.value)}</div>
                        </td>
                      );
                    })}
                    <td className="text-right px-2 py-2 border-b font-medium">{r.totalQty}</td>
                    <td className="text-right px-2 py-2 border-b font-semibold">{fmtCurrency(r.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td className="sticky left-0 bg-muted z-10 px-3 py-2 border-t font-semibold" colSpan={3}>Totales</td>
                  {data.months.map(m => {
                    const t = filtered.reduce(
                      (a, r) => {
                        const c = r.byMonth[m];
                        if (!c) return a;
                        return { qty: a.qty + c.quantity, val: a.val + c.value };
                      },
                      { qty: 0, val: 0 },
                    );
                    return (
                      <td key={m} className="text-right px-2 py-2 border-t text-[11px]">
                        <div className="font-medium">{t.qty}</div>
                        <div>{fmtCurrency(t.val)}</div>
                      </td>
                    );
                  })}
                  <td className="text-right px-2 py-2 border-t font-bold">{grandQty}</td>
                  <td className="text-right px-2 py-2 border-t font-bold">{fmtCurrency(grandVal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
