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
  amount: number;
  descriptions: string[];
}

interface IRow {
  category: string;
  type: string;
  flow: string;
  byMonth: Record<string, ICell>;
}

interface IData {
  months: string[];
  rows: IRow[];
}

const typeLabel = (t: string) => {
  if (t === "LEGAL") return "Reserva Legal";
  if (t === "SOCIAL") return "Fondo Social";
  if (t === "OTRO") return "Otros";
  if (t === "FINE") return "Multa";
  if (t === "LATE_FEE") return "Tardanza";
  if (t === "ABSENCE_FEE") return "Falta";
  if (t === "DONATION") return "Donacion";
  if (t === "OPERATIONS") return "Operaciones";
  if (t === "UNCLASSIFIED") return "Sin Clasif.";
  return t;
};

export default function OtherMovementsReportPage() {
  const { bank } = useContext(AppContext);
  const init = defaultRange();
  const [startMonth, setStartMonth] = useState(init.startVal);
  const [endMonth, setEndMonth] = useState(init.endVal);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IData>({ months: [], rows: [] });

  useEffect(() => {
    apiClient
      .get(`/reports/other-movements/range?startDate=${monthValToISO(startMonth)}&endDate=${monthValToISO(endMonth, true)}`)
      .then(r => setData(r.data))
      .catch(() => {});
  }, [startMonth, endMonth]);

  const filtered = useMemo(
    () => data.rows.filter(r => `${r.category} ${typeLabel(r.type)} ${r.flow}`.toLowerCase().includes(search.toLowerCase())),
    [data.rows, search],
  );

  const period = rangeLabel(startMonth, endMonth);
  const monthOptions = generateMonthOptions();

  const summary = filtered.map(r => {
    const total = data.months.reduce((a, m) => a + (r.byMonth[m]?.amount ?? 0), 0);
    return { ...r, total };
  });

  const columns: ReportColumn[] = [
    { header: "Categoria", key: "category" },
    { header: "Tipo", key: "typeLabel" },
    { header: "Flujo", key: "flow" },
    ...data.months.map<ReportColumn>(m => ({ header: monthShort(m), key: m, format: "currency", align: "right" })),
    { header: "Total", key: "total", format: "currency", align: "right" },
    { header: "Descripciones", key: "descriptions" },
  ];

  const exportRows = summary.map(r => {
    const monthCols: Record<string, number> = {};
    const allDesc: string[] = [];
    for (const m of data.months) {
      monthCols[m] = r.byMonth[m]?.amount ?? 0;
      if (r.byMonth[m]?.descriptions?.length) allDesc.push(...r.byMonth[m].descriptions);
    }
    return {
      category: r.category, typeLabel: typeLabel(r.type), flow: r.flow,
      ...monthCols,
      total: r.total,
      descriptions: Array.from(new Set(allDesc)).slice(0, 8).join(" | "),
    };
  });

  const grandIngresos = summary.filter(r => r.flow === "INGRESO").reduce((a, r) => a + r.total, 0);
  const grandEgresos = summary.filter(r => r.flow === "EGRESO").reduce((a, r) => a + r.total, 0);

  const totalsRow: Record<string, unknown> = {
    category: "TOTAL", typeLabel: "", flow: `In ${fmtCurrency(grandIngresos)} | Eg ${fmtCurrency(grandEgresos)}`,
    total: grandIngresos - grandEgresos, descriptions: "",
  };
  for (const m of data.months) {
    totalsRow[m] = summary.reduce((a, r) => a + (r.byMonth[m]?.amount ?? 0) * (r.flow === "INGRESO" ? 1 : -1), 0);
  }

  const meta = {
    title: "Reporte de Otros Movimientos",
    subtitle: "Fondo Social, Reserva Legal y Otros",
    bankName: bank?.bank?.name,
    period,
    fileName: `reporte-otros-movimientos-${startMonth}_a_${endMonth}`,
  };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Reporte de Otros Movimientos</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">Fondo Social, Reserva Legal y otros tipos. Pivote por tipo y mes.</p>
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
                  <th className="sticky left-0 bg-muted z-20 text-left px-3 py-2 border-b min-w-[100px]">Categoria</th>
                  <th className="text-left px-3 py-2 border-b min-w-[140px]">Tipo</th>
                  <th className="text-left px-3 py-2 border-b min-w-[90px]">Flujo</th>
                  {data.months.map(m => (
                    <th key={m} className="text-right px-2 py-2 border-b min-w-[110px]">{monthShort(m)}</th>
                  ))}
                  <th className="text-right px-2 py-2 border-b min-w-[120px] bg-muted">Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.length === 0 ? (
                  <tr><td colSpan={4 + data.months.length} className="text-center text-muted-foreground py-6">Sin registros</td></tr>
                ) : summary.map(r => (
                  <tr key={`${r.category}-${r.type}-${r.flow}`} className="hover:bg-muted/40">
                    <td className="sticky left-0 bg-background z-10 px-3 py-2 border-b font-medium">{r.category}</td>
                    <td className="px-3 py-2 border-b">{typeLabel(r.type)}</td>
                    <td className="px-3 py-2 border-b">
                      <span className={r.flow === "INGRESO" ? "text-green-700" : "text-red-700"}>{r.flow}</span>
                    </td>
                    {data.months.map(m => {
                      const c = r.byMonth[m];
                      if (!c || c.amount === 0) return <td key={m} className="text-right px-2 py-2 border-b text-muted-foreground">—</td>;
                      return (
                        <td key={m} className="text-right px-2 py-2 border-b text-[11px]" title={c.descriptions.slice(0, 5).join(" | ")}>
                          <div className={r.flow === "INGRESO" ? "text-green-700" : "text-red-700"}>{fmtCurrency(c.amount)}</div>
                          {c.descriptions.length > 0 && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                              {c.descriptions[0]}{c.descriptions.length > 1 ? ` (+${c.descriptions.length - 1})` : ""}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-right px-2 py-2 border-b font-semibold">{fmtCurrency(r.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td className="sticky left-0 bg-muted z-10 px-3 py-2 border-t font-semibold" colSpan={3}>
                    Neto (In - Eg)
                  </td>
                  {data.months.map(m => {
                    const v = summary.reduce((a, r) => a + (r.byMonth[m]?.amount ?? 0) * (r.flow === "INGRESO" ? 1 : -1), 0);
                    return (
                      <td key={m} className={`text-right px-2 py-2 border-t font-medium ${v >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {fmtCurrency(v)}
                      </td>
                    );
                  })}
                  <td className="text-right px-2 py-2 border-t font-bold">{fmtCurrency(grandIngresos - grandEgresos)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Ingresos</p>
              <p className="text-lg font-semibold text-green-700">{fmtCurrency(grandIngresos)}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Egresos</p>
              <p className="text-lg font-semibold text-red-700">{fmtCurrency(grandEgresos)}</p>
            </CardContent></Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
