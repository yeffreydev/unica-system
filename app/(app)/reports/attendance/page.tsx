"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { exportToExcel, exportToPDF, ReportColumn } from "@/lib/reportExport";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";

interface IParticipant {
  id: string;
  userId: string | null;
  status: string;
  user?: { id: string; name: string; lastname: string; dni?: string };
  name?: string;
  lastname?: string;
}

interface IRun {
  id: string;
  topic: string;
  startAt: string | null;
  createdAt: string;
  schedule?: { id: string; topic: string };
  participants: IParticipant[];
}

interface IUserLite {
  id: string;
  name: string;
  lastname: string;
  dni?: string;
}

interface IAttendanceData {
  runs: IRun[];
  users: IUserLite[];
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
    const startM = y === startYear ? 0 : 0;
    const endM = y === now.getFullYear() ? now.getMonth() : 11;
    for (let m = startM; m <= endM; m++) {
      options.push({ value: `${y}-${m}`, label: `${months[m]} ${y}` });
    }
  }
  return options;
};

const statusLabel = (s: string) => {
  switch (s) {
    case "attended": return "Asistio";
    case "late": return "Tardanza";
    case "absent": return "Falta";
    case "confirmed": return "Confirmado";
    case "declined": return "Rechazo";
    default: return "Registrado";
  }
};

export default function AttendanceReportPage() {
  const { bank } = useContext(AppContext);
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${now.getMonth()}`);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IAttendanceData>({ runs: [], users: [] });

  useEffect(() => {
    const [y, m] = month.split("-").map(Number);
    const ref = new Date(y, m, 15).toISOString();
    apiClient.get(`/reports/attendance/month?date=${ref}`).then(r => setData(r.data)).catch(() => {});
  }, [month]);

  const monthLabel = (() => {
    const [y, m] = month.split("-").map(Number);
    return `${months[m]} ${y}`;
  })();

  const flatRows = useMemo(() => {
    const list: {
      date: string;
      runId: string;
      topic: string;
      userId: string | null;
      lastname: string;
      name: string;
      dni: string;
      status: string;
    }[] = [];
    for (const run of data.runs) {
      for (const p of run.participants) {
        list.push({
          date: run.startAt ?? run.createdAt,
          runId: run.id,
          topic: run.schedule?.topic ?? run.topic,
          userId: p.userId,
          lastname: p.user?.lastname ?? p.lastname ?? "",
          name: p.user?.name ?? p.name ?? "",
          dni: p.user?.dni ?? "",
          status: statusLabel(p.status),
        });
      }
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const filtered = flatRows.filter(r =>
    `${r.name} ${r.lastname}`.toLowerCase().includes(search.toLowerCase()),
  );

  const summary = useMemo(() => {
    const map: Record<string, { name: string; lastname: string; attended: number; late: number; absent: number; total: number }> = {};
    for (const u of data.users) map[u.id] = { name: u.name, lastname: u.lastname, attended: 0, late: 0, absent: 0, total: 0 };
    for (const r of flatRows) {
      if (!r.userId) continue;
      if (!map[r.userId]) map[r.userId] = { name: r.name, lastname: r.lastname, attended: 0, late: 0, absent: 0, total: 0 };
      map[r.userId].total++;
      if (r.status === "Asistio") map[r.userId].attended++;
      if (r.status === "Tardanza") map[r.userId].late++;
      if (r.status === "Falta") map[r.userId].absent++;
    }
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [flatRows, data.users]);

  const columns: ReportColumn[] = [
    { header: "Fecha", key: "date", format: "date" },
    { header: "Asamblea", key: "topic" },
    { header: "Apellidos", key: "lastname" },
    { header: "Nombres", key: "name" },
    { header: "DNI", key: "dni" },
    { header: "Estado", key: "status", align: "center" },
  ];

  const meta = {
    title: "Reporte de Asistencia",
    bankName: bank?.bank?.name,
    period: monthLabel,
    fileName: `reporte-asistencia-${month}`,
  };

  return (
    <div className="space-y-6 py-5">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <CardTitle>Reporte de Asistencia</CardTitle>
              <p className="text-sm text-muted-foreground">Asistencia a asambleas por mes</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Buscar nombre..." value={search} onChange={e => setSearch(e.target.value)} className="w-[200px]" />
              <Button onClick={() => exportToPDF(meta, columns, filtered)} className="bg-red-600 hover:bg-red-700 text-white">
                <FileText className="w-4 h-4 mr-2" />PDF
              </Button>
              <Button onClick={() => exportToExcel(meta, columns, filtered)} className="bg-green-600 hover:bg-green-700 text-white">
                <FileSpreadsheet className="w-4 h-4 mr-2" />Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Detalle</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Asamblea</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin registros</TableCell></TableRow>
                ) : filtered.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(r.date).toLocaleDateString("es-PE")}</TableCell>
                    <TableCell>{r.topic}</TableCell>
                    <TableCell>{r.lastname}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.dni}</TableCell>
                    <TableCell>{r.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Resumen por socio</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead className="text-right">Asistencias</TableHead>
                  <TableHead className="text-right">Tardanzas</TableHead>
                  <TableHead className="text-right">Faltas</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary
                  .filter(u => `${u.name} ${u.lastname}`.toLowerCase().includes(search.toLowerCase()))
                  .map(u => (
                    <TableRow key={u.id}>
                      <TableCell>{u.lastname}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell className="text-right">{u.attended}</TableCell>
                      <TableCell className="text-right">{u.late}</TableCell>
                      <TableCell className="text-right">{u.absent}</TableCell>
                      <TableCell className="text-right">{u.total}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-medium text-right">Totales</TableCell>
                  <TableCell className="text-right">{summary.reduce((a, u) => a + u.attended, 0)}</TableCell>
                  <TableCell className="text-right">{summary.reduce((a, u) => a + u.late, 0)}</TableCell>
                  <TableCell className="text-right">{summary.reduce((a, u) => a + u.absent, 0)}</TableCell>
                  <TableCell className="text-right">{summary.reduce((a, u) => a + u.total, 0)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
