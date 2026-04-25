"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileCheck, FileX, Loader2 } from "lucide-react";
import { apiGetActaByRun } from "../../api";
import { formatCurrency } from "@/lib/utils";

// Acta read-only viewer. Reproduce el resumen de la asamblea
// (snapshot guardado en `Acta.content` o resumen vivo si no se generó).
// Sin botones de edición.

type ActaResponse = {
  confirmed?: boolean;
  generatedAt?: string | null;
  content?: any;
  scheduleRunId?: string;
};

export default function AssemblyViewPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ActaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGetActaByRun(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="py-10 flex justify-center text-muted-foreground gap-2 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
    </div>;
  }

  const content = data?.content || {};
  const run = content.run;
  const fines = content.fines ?? [];
  const shares = content.shares ?? [];
  const payments = content.payments ?? [];
  const otherIncomes = content.otherIncomes ?? [];
  const savingsDeposits = content.savingsDeposits ?? [];
  const savingsPayouts = content.savingsPayouts ?? [];
  const creditApplications = content.creditApplications ?? [];

  const startAt = run?.startAt ? new Date(run.startAt) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/assembly/list"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Link>
          </Button>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Acta de asamblea</h1>
        </div>
        {data?.confirmed ? (
          <Badge className="bg-emerald-600 text-white"><FileCheck className="w-3 h-3 mr-1" /> Confirmada</Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <FileX className="w-3 h-3 mr-1" /> Sin confirmar
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sesión</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><div className="text-[10px] uppercase text-muted-foreground">Fecha</div><div className="font-medium">{startAt ? startAt.toLocaleDateString("es-PE") : "-"}</div></div>
          <div><div className="text-[10px] uppercase text-muted-foreground">Hora</div><div className="font-medium">{startAt ? startAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) : "-"}</div></div>
          <div><div className="text-[10px] uppercase text-muted-foreground">Estado</div><div className="font-medium">{run?.status ?? "-"}</div></div>
          <div><div className="text-[10px] uppercase text-muted-foreground">Recaudado</div><div className="font-semibold tabular-nums">{formatCurrency(content.totalCollected ?? 0)}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          {(run?.participants ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin participantes.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Socio</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(run?.participants ?? []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.user ? `${p.user.lastname ?? ""}, ${p.user.name ?? ""}` : (p.name ?? "-")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Acciones compradas</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">Total: <span className="font-semibold text-foreground">{formatCurrency(content.sharesTotal ?? 0)}</span></div>
            {shares.length === 0 ? <p className="text-xs text-muted-foreground">Sin movimientos.</p> : (
              <ul className="space-y-1">
                {shares.map((s: any) => (
                  <li key={s.id} className="flex justify-between text-xs">
                    <span>{s.user ? `${s.user.lastname}, ${s.user.name}` : "-"}</span>
                    <span className="tabular-nums">{s.quantity} × {formatCurrency(s.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pagos de préstamos</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">Capital: <span className="font-semibold text-foreground">{formatCurrency(content.paymentsCapital ?? 0)}</span> · Interés: <span className="font-semibold text-foreground">{formatCurrency(content.paymentsInterest ?? 0)}</span></div>
            {payments.length === 0 ? <p className="text-xs text-muted-foreground">Sin pagos.</p> : (
              <ul className="space-y-1">
                {payments.map((p: any) => (
                  <li key={p.id} className="flex justify-between text-xs">
                    <span>{p.user ? `${p.user.lastname}, ${p.user.name}` : "-"}</span>
                    <span className="tabular-nums">{formatCurrency((p.amount ?? 0) + Number(p.interest ?? 0))}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Ahorros (depósitos)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">Total: <span className="font-semibold text-foreground">{formatCurrency(content.savingsDepositsTotal ?? 0)}</span></div>
            {savingsDeposits.length === 0 ? <p className="text-xs text-muted-foreground">Sin depósitos.</p> : (
              <ul className="space-y-1">
                {savingsDeposits.map((d: any) => (
                  <li key={d.id} className="flex justify-between text-xs">
                    <span>{d.user ? `${d.user.lastname}, ${d.user.name}` : "-"}</span>
                    <span className="tabular-nums">{formatCurrency(d.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pagos a ahorristas</CardTitle></CardHeader>
          <CardContent>
            {savingsPayouts.length === 0 ? <p className="text-xs text-muted-foreground">Sin pagos.</p> : (
              <ul className="space-y-1">
                {savingsPayouts.map((p: any) => (
                  <li key={p.id} className="flex justify-between text-xs">
                    <span>{p.user ? `${p.user.lastname}, ${p.user.name}` : "-"}</span>
                    <span className="tabular-nums">{formatCurrency(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Multas</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">Total: <span className="font-semibold text-foreground">{formatCurrency(content.finesTotal ?? 0)}</span></div>
            {fines.length === 0 ? <p className="text-xs text-muted-foreground">Sin multas.</p> : (
              <ul className="space-y-1">
                {fines.map((f: any) => (
                  <li key={f.id} className="flex justify-between text-xs">
                    <span>{f.user ? `${f.user.lastname}, ${f.user.name}` : (f.description ?? "-")}</span>
                    <span className="tabular-nums">{formatCurrency(f.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Otros ingresos</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">Total: <span className="font-semibold text-foreground">{formatCurrency(content.otherIncomesTotal ?? 0)}</span></div>
            {otherIncomes.length === 0 ? <p className="text-xs text-muted-foreground">Sin movimientos.</p> : (
              <ul className="space-y-1">
                {otherIncomes.map((o: any) => (
                  <li key={o.id} className="flex justify-between text-xs">
                    <span>{o.description ?? "-"}</span>
                    <span className="tabular-nums">{formatCurrency(o.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Solicitudes de crédito</CardTitle></CardHeader>
          <CardContent>
            {creditApplications.length === 0 ? <p className="text-xs text-muted-foreground">Sin solicitudes.</p> : (
              <ul className="space-y-1">
                {creditApplications.map((c: any) => (
                  <li key={c.id} className="flex justify-between text-xs">
                    <span>{c.user ? `${c.user.lastname}, ${c.user.name}` : "-"}</span>
                    <span className="tabular-nums">{formatCurrency(c.amount)} · {c.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
