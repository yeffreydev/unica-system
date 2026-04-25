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

interface IStockRow {
  id: string;
  date: string;
  userId: string;
  name: string;
  lastname: string;
  dni: string;
  stockName: string;
  quantity: number;
  price: number;
  value: number;
}

interface IStocksResp {
  rows: IStockRow[];
  totals: { quantity: number; value: number };
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

export default function StocksReportPage() {
  const { bank } = useContext(AppContext);
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${now.getMonth()}`);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IStocksResp>({ rows: [], totals: { quantity: 0, value: 0 } });

  useEffect(() => {
    const [y, m] = month.split("-").map(Number);
    const ref = new Date(y, m, 15).toISOString();
    apiClient.get(`/reports/stocks/month?date=${ref}`).then(r => setData(r.data)).catch(() => {});
  }, [month]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return `${months[m]} ${y}`;
  }, [month]);

  const filtered = data.rows.filter(r =>
    `${r.name} ${r.lastname}`.toLowerCase().includes(search.toLowerCase()),
  );

  const subtotals = filtered.reduce(
    (acc, r) => ({ quantity: acc.quantity + r.quantity, value: acc.value + r.value }),
    { quantity: 0, value: 0 },
  );

  const columns: ReportColumn[] = [
    { header: "Fecha", key: "date", format: "date" },
    { header: "Apellidos", key: "lastname" },
    { header: "Nombres", key: "name" },
    { header: "DNI", key: "dni" },
    { header: "Accion", key: "stockName" },
    { header: "Cantidad", key: "quantity", format: "number", align: "right" },
    { header: "Precio Unit.", key: "price", format: "currency", align: "right" },
    { header: "Valor", key: "value", format: "currency", align: "right" },
  ];

  const totalsRow = {
    date: "",
    lastname: "TOTAL",
    name: "",
    dni: "",
    stockName: "",
    quantity: subtotals.quantity,
    price: "",
    value: subtotals.value,
  };

  const meta = {
    title: "Reporte de Acciones por Mes",
    bankName: bank?.bank?.name,
    period: monthLabel,
    fileName: `reporte-acciones-${month}`,
  };

  return (
    <div className="space-y-6 py-5">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <CardTitle>Reporte de Acciones</CardTitle>
              <p className="text-sm text-muted-foreground">Cantidad y socio por mes con suma total</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Buscar nombre..." value={search} onChange={e => setSearch(e.target.value)} className="w-[200px]" />
              <Button onClick={() => exportToPDF(meta, columns, filtered, totalsRow)} className="bg-red-600 hover:bg-red-700 text-white">
                <FileText className="w-4 h-4 mr-2" />PDF
              </Button>
              <Button onClick={() => exportToExcel(meta, columns, filtered, totalsRow)} className="bg-green-600 hover:bg-green-700 text-white">
                <FileSpreadsheet className="w-4 h-4 mr-2" />Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Sin registros</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString("es-PE")}</TableCell>
                    <TableCell>{r.lastname}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.dni}</TableCell>
                    <TableCell>{r.stockName}</TableCell>
                    <TableCell className="text-right">{r.quantity}</TableCell>
                    <TableCell className="text-right">{fmt(r.price)}</TableCell>
                    <TableCell className="text-right">{fmt(r.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted">
                  <TableCell colSpan={5} className="text-right font-medium">Total del mes</TableCell>
                  <TableCell className="text-right font-medium">{subtotals.quantity}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-medium">{fmt(subtotals.value)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
