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

interface ISavingsRow {
  userId: string;
  name: string;
  lastname: string;
  dni?: string;
  monthDeposits: number;
  monthWithdrawals: number;
  monthInterestPaid: number;
  balance: number;
  totalInterestPaid: number;
}

interface ISavingsResp {
  rows: ISavingsRow[];
  totals: {
    monthDeposits: number;
    monthWithdrawals: number;
    monthInterestPaid: number;
    balance: number;
    totalInterestPaid: number;
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

export default function SavingsReportPage() {
  const { bank } = useContext(AppContext);
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${now.getMonth()}`);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ISavingsResp>({
    rows: [],
    totals: { monthDeposits: 0, monthWithdrawals: 0, monthInterestPaid: 0, balance: 0, totalInterestPaid: 0 },
  });

  useEffect(() => {
    const [y, m] = month.split("-").map(Number);
    const ref = new Date(y, m, 15).toISOString();
    apiClient.get(`/reports/savings/month?date=${ref}`).then(r => setData(r.data)).catch(() => {});
  }, [month]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return `${months[m]} ${y}`;
  }, [month]);

  const filtered = data.rows.filter(r =>
    `${r.name} ${r.lastname}`.toLowerCase().includes(search.toLowerCase()),
  );

  const subtotals = filtered.reduce(
    (acc, r) => ({
      monthDeposits: acc.monthDeposits + r.monthDeposits,
      monthWithdrawals: acc.monthWithdrawals + r.monthWithdrawals,
      monthInterestPaid: acc.monthInterestPaid + r.monthInterestPaid,
      balance: acc.balance + r.balance,
      totalInterestPaid: acc.totalInterestPaid + r.totalInterestPaid,
    }),
    { monthDeposits: 0, monthWithdrawals: 0, monthInterestPaid: 0, balance: 0, totalInterestPaid: 0 },
  );

  const columns: ReportColumn[] = [
    { header: "Apellidos", key: "lastname" },
    { header: "Nombres", key: "name" },
    { header: "DNI", key: "dni" },
    { header: "Deposito Mes", key: "monthDeposits", format: "currency", align: "right" },
    { header: "Retiro Mes", key: "monthWithdrawals", format: "currency", align: "right" },
    { header: "Interes Mes", key: "monthInterestPaid", format: "currency", align: "right" },
    { header: "Saldo", key: "balance", format: "currency", align: "right" },
    { header: "Interes Acumulado", key: "totalInterestPaid", format: "currency", align: "right" },
  ];

  const totalsRow = {
    lastname: "TOTAL",
    name: "",
    dni: "",
    monthDeposits: subtotals.monthDeposits,
    monthWithdrawals: subtotals.monthWithdrawals,
    monthInterestPaid: subtotals.monthInterestPaid,
    balance: subtotals.balance,
    totalInterestPaid: subtotals.totalInterestPaid,
  };

  const meta = {
    title: "Reporte de Ahorros por Mes",
    bankName: bank?.bank?.name,
    period: monthLabel,
    fileName: `reporte-ahorros-${month}`,
  };

  return (
    <div className="space-y-6 py-5">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <CardTitle>Reporte de Ahorros</CardTitle>
              <p className="text-sm text-muted-foreground">Depositos, intereses pagados y saldo por socio</p>
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
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead className="text-right">Deposito Mes</TableHead>
                  <TableHead className="text-right">Retiro Mes</TableHead>
                  <TableHead className="text-right">Interes Mes</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Interes Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Sin registros</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.userId}>
                    <TableCell>{r.lastname}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.dni}</TableCell>
                    <TableCell className="text-right">{fmt(r.monthDeposits)}</TableCell>
                    <TableCell className="text-right">{fmt(r.monthWithdrawals)}</TableCell>
                    <TableCell className="text-right">{fmt(r.monthInterestPaid)}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(r.balance)}</TableCell>
                    <TableCell className="text-right">{fmt(r.totalInterestPaid)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted">
                  <TableCell colSpan={3} className="text-right font-medium">Totales</TableCell>
                  <TableCell className="text-right">{fmt(subtotals.monthDeposits)}</TableCell>
                  <TableCell className="text-right">{fmt(subtotals.monthWithdrawals)}</TableCell>
                  <TableCell className="text-right">{fmt(subtotals.monthInterestPaid)}</TableCell>
                  <TableCell className="text-right">{fmt(subtotals.balance)}</TableCell>
                  <TableCell className="text-right">{fmt(subtotals.totalInterestPaid)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
