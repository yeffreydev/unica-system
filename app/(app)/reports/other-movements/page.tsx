"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { exportToExcel, exportToPDF, ReportColumn } from "@/lib/reportExport";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";

interface IMovementRow {
  id: string;
  date: string;
  type: string;
  category: string;
  flow: string;
  description: string;
  userId: string | null;
  name: string;
  lastname: string;
  amount: number;
}

interface IMovementsResp {
  rows: IMovementRow[];
  totals: {
    incomes: number; expenses: number;
    legalIn: number; legalOut: number;
    socialIn: number; socialOut: number;
  };
}

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const generateMonthOptions = () => {
  const options: { value: string; label: string }[] = [];
  const startYear = 2024;
  const now = new Date();
  for (let y = startYear; y <= now.getFullYear(); y++) {
    const endM = y === now.getFullYear() ? now.getMonth() : 11;
    for (let m = 0; m <= endM; m++) options.push({ value: `${y}-${m}`, label: `${months[m]} ${y}` });
  }
  return options;
};

const fmt = (n: number) =>
  `S/. ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const typeLabel = (t: string) => {
  if (t === "LEGAL") return "Reserva Legal";
  if (t === "SOCIAL") return "Fondo Social";
  return t;
};

export default function OtherMovementsReportPage() {
  const { bank } = useContext(AppContext);
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${now.getMonth()}`);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IMovementsResp>({
    rows: [],
    totals: { incomes: 0, expenses: 0, legalIn: 0, legalOut: 0, socialIn: 0, socialOut: 0 },
  });

  useEffect(() => {
    const [y, m] = month.split("-").map(Number);
    const ref = new Date(y, m, 15).toISOString();
    apiClient.get(`/reports/other-movements/month?date=${ref}`).then(r => setData(r.data)).catch(() => {});
  }, [month]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return `${months[m]} ${y}`;
  }, [month]);

  const filtered = data.rows.filter(r => {
    const q = search.toLowerCase();
    return (
      `${r.name} ${r.lastname}`.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    );
  });

  const subtotals = filtered.reduce(
    (acc, r) => {
      if (r.flow === "INGRESO") acc.incomes += r.amount;
      else acc.expenses += r.amount;
      return acc;
    },
    { incomes: 0, expenses: 0 },
  );

  const exportRows = filtered.map(r => ({
    ...r,
    typeLabel: typeLabel(r.type),
  }));

  const columns: ReportColumn[] = [
    { header: "Fecha", key: "date", format: "date" },
    { header: "Categoria", key: "category" },
    { header: "Tipo", key: "typeLabel" },
    { header: "Flujo", key: "flow" },
    { header: "Apellidos", key: "lastname" },
    { header: "Nombres", key: "name" },
    { header: "Descripcion", key: "description" },
    { header: "Monto", key: "amount", format: "currency", align: "right" },
  ];

  const totalsRow = {
    date: "",
    category: "",
    typeLabel: "TOTAL",
    flow: `Ingresos ${fmt(subtotals.incomes)} | Egresos ${fmt(subtotals.expenses)}`,
    lastname: "",
    name: "",
    description: "Neto",
    amount: subtotals.incomes - subtotals.expenses,
  };

  const meta = {
    title: "Reporte de Otros Movimientos",
    subtitle: "Fondo Social, Reserva Legal y Otros",
    bankName: bank?.bank?.name,
    period: monthLabel,
    fileName: `reporte-otros-movimientos-${month}`,
  };

  return (
    <div className="space-y-6 py-5">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <CardTitle>Reporte de Otros Movimientos</CardTitle>
              <p className="text-sm text-muted-foreground">Fondo Social, Reserva Legal, otros tipos y descripciones</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-[200px]" />
              <Button onClick={() => exportToPDF(meta, columns, exportRows, totalsRow)} className="bg-red-600 hover:bg-red-700 text-white">
                <FileText className="w-4 h-4 mr-2" />PDF
              </Button>
              <Button onClick={() => exportToExcel(meta, columns, exportRows, totalsRow)} className="bg-green-600 hover:bg-green-700 text-white">
                <FileSpreadsheet className="w-4 h-4 mr-2" />Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Reserva Legal</p>
          <p className="text-sm">Ingresos: <span className="font-medium">{fmt(data.totals.legalIn)}</span></p>
          <p className="text-sm">Egresos: <span className="font-medium">{fmt(data.totals.legalOut)}</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Fondo Social</p>
          <p className="text-sm">Ingresos: <span className="font-medium">{fmt(data.totals.socialIn)}</span></p>
          <p className="text-sm">Egresos: <span className="font-medium">{fmt(data.totals.socialOut)}</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-sm">Ingresos: <span className="font-medium">{fmt(data.totals.incomes)}</span></p>
          <p className="text-sm">Egresos: <span className="font-medium">{fmt(data.totals.expenses)}</span></p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Flujo</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Sin registros</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString("es-PE")}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{typeLabel(r.type)}</TableCell>
                    <TableCell>
                      <span className={r.flow === "INGRESO" ? "text-green-600" : "text-red-600"}>{r.flow}</span>
                    </TableCell>
                    <TableCell>{r.lastname}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{r.description}</TableCell>
                    <TableCell className="text-right">{fmt(r.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted">
                  <TableCell colSpan={7} className="text-right font-medium">
                    Ingresos: {fmt(subtotals.incomes)} | Egresos: {fmt(subtotals.expenses)}
                  </TableCell>
                  <TableCell className="text-right font-medium">{fmt(subtotals.incomes - subtotals.expenses)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
