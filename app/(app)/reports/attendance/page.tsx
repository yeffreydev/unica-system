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
  attended: number; late: number; absent: number; registered: number;
  fineAmount: number; runs: number;
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
  runsCount: Record<string, number>;
}

const cellText = (c: ICell) => {
  if (!c) return "";
  if (c.runs === 0) return "—";
  const parts: string[] = [];
  if (c.attended) parts.push(`A:${c.attended}`);
  if (c.late) parts.push(`T:${c.late}`);
  if (c.absent) parts.push(`F:${c.absent}`);
  if (parts.length === 0) parts.push("S/R");
  let txt = parts.join(" ");
  if (c.fineAmount > 0) txt += ` | Multa: ${fmtCurrency(c.fineAmount)}`;
  return txt;
};

export default function AttendanceReportPage() {
  const { bank } = useContext(AppContext);
  const init = defaultRange();
  const [startMonth, setStartMonth] = useState(init.startVal);
  const [endMonth, setEndMonth] = useState(init.endVal);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IData>({ months: [], rows: [], runsCount: {} });

  useEffect(() => {
    apiClient
      .get(`/reports/attendance/range?startDate=${monthValToISO(startMonth)}&endDate=${monthValToISO(endMonth, true)}`)
      .then(r => setData(r.data))
      .catch(() => {});
  }, [startMonth, endMonth]);

  const filtered = useMemo(
    () => data.rows.filter(r => `${r.name} ${r.lastname}`.toLowerCase().includes(search.toLowerCase())),
    [data.rows, search],
  );

  const monthOptions = generateMonthOptions();
  const period = rangeLabel(startMonth, endMonth);

  const summary = filtered.map(r => {
    const totals = data.months.reduce(
      (acc, m) => {
        const c = r.byMonth[m];
        if (!c) return acc;
        return {
          attended: acc.attended + c.attended,
          late: acc.late + c.late,
          absent: acc.absent + c.absent,
          fineAmount: acc.fineAmount + c.fineAmount,
        };
      },
      { attended: 0, late: 0, absent: 0, fineAmount: 0 },
    );
    return { ...r, ...totals };
  });

  const columns: ReportColumn[] = [
    { header: "Nombres", key: "name" },
    { header: "Apellidos", key: "lastname" },
    { header: "DNI", key: "dni" },
    ...data.months.map<ReportColumn>(m => ({ header: monthShort(m), key: m, align: "center" })),
    { header: "Asist", key: "attended", align: "right", format: "number" },
    { header: "Tard", key: "late", align: "right", format: "number" },
    { header: "Faltas", key: "absent", align: "right", format: "number" },
    { header: "Multas", key: "fineAmount", align: "right", format: "currency" },
  ];

  const exportRows = filtered.map(r => {
    const monthCols: Record<string, string> = {};
    for (const m of data.months) monthCols[m] = cellText(r.byMonth[m]);
    const t = summary.find(s => s.userId === r.userId)!;
    return {
      name: r.name, lastname: r.lastname, dni: r.dni,
      ...monthCols,
      attended: t.attended, late: t.late, absent: t.absent, fineAmount: t.fineAmount,
    };
  });

  const totalsRow: Record<string, unknown> = {
    name: "TOTAL", lastname: "", dni: "",
    attended: summary.reduce((a, s) => a + s.attended, 0),
    late: summary.reduce((a, s) => a + s.late, 0),
    absent: summary.reduce((a, s) => a + s.absent, 0),
    fineAmount: summary.reduce((a, s) => a + s.fineAmount, 0),
  };
  for (const m of data.months) totalsRow[m] = `${data.runsCount[m] ?? 0} asambleas`;

  const meta = {
    title: "Reporte de Asistencia",
    bankName: bank?.bank?.name,
    period,
    fileName: `reporte-asistencia-${startMonth}_a_${endMonth}`,
  };

  return (
    <div className="space-y-4 p-3 md:p-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Reporte de Asistencia</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">A: Asistio, T: Tardanza, F: Falta. Multa = monto pagado por inasistencias.</p>
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
          <div className="overflow-x-auto relative">
            <table className="w-full text-xs md:text-sm border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 bg-muted z-20 text-left px-3 py-2 border-b min-w-[140px]">Nombres</th>
                  <th className="text-left px-3 py-2 border-b min-w-[120px]">Apellidos</th>
                  <th className="text-left px-3 py-2 border-b min-w-[80px] hidden md:table-cell">DNI</th>
                  {data.months.map(m => (
                    <th key={m} className="text-center px-2 py-2 border-b min-w-[120px]">
                      <div>{monthShort(m)}</div>
                      <div className="text-[10px] font-normal text-muted-foreground">{data.runsCount[m] ?? 0} asam.</div>
                    </th>
                  ))}
                  <th className="text-right px-2 py-2 border-b min-w-[60px] bg-muted">Asist</th>
                  <th className="text-right px-2 py-2 border-b min-w-[60px] bg-muted">Tard</th>
                  <th className="text-right px-2 py-2 border-b min-w-[60px] bg-muted">Falt</th>
                  <th className="text-right px-2 py-2 border-b min-w-[100px] bg-muted">Multas</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4 + data.months.length + 4} className="text-center text-muted-foreground py-6">Sin registros</td></tr>
                ) : summary.map(r => (
                  <tr key={r.userId} className="hover:bg-muted/40">
                    <td className="sticky left-0 bg-background z-10 px-3 py-2 border-b font-medium">{r.name}</td>
                    <td className="px-3 py-2 border-b">{r.lastname}</td>
                    <td className="px-3 py-2 border-b hidden md:table-cell">{r.dni}</td>
                    {data.months.map(m => {
                      const c = r.byMonth[m];
                      if (!c || c.runs === 0) return <td key={m} className="text-center px-2 py-2 border-b text-muted-foreground">—</td>;
                      return (
                        <td key={m} className="text-center px-2 py-2 border-b">
                          <div className="flex justify-center gap-1 text-[11px]">
                            {c.attended > 0 && <span className="text-green-700">A:{c.attended}</span>}
                            {c.late > 0 && <span className="text-yellow-700">T:{c.late}</span>}
                            {c.absent > 0 && <span className="text-red-700">F:{c.absent}</span>}
                            {c.attended + c.late + c.absent === 0 && <span className="text-muted-foreground">S/R</span>}
                          </div>
                          {c.fineAmount > 0 && <div className="text-[10px] text-red-600">{fmtCurrency(c.fineAmount)}</div>}
                        </td>
                      );
                    })}
                    <td className="text-right px-2 py-2 border-b text-green-700">{r.attended}</td>
                    <td className="text-right px-2 py-2 border-b text-yellow-700">{r.late}</td>
                    <td className="text-right px-2 py-2 border-b text-red-700">{r.absent}</td>
                    <td className="text-right px-2 py-2 border-b">{fmtCurrency(r.fineAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td className="sticky left-0 bg-muted z-10 px-3 py-2 border-t font-semibold" colSpan={3}>Asambleas en mes</td>
                  {data.months.map(m => (
                    <td key={m} className="text-center px-2 py-2 border-t font-medium">{data.runsCount[m] ?? 0}</td>
                  ))}
                  <td className="text-right px-2 py-2 border-t font-semibold">{(totalsRow.attended as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{(totalsRow.late as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{(totalsRow.absent as number)}</td>
                  <td className="text-right px-2 py-2 border-t font-semibold">{fmtCurrency(totalsRow.fineAmount as number)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
