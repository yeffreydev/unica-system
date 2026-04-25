"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Download, Eye, FileCheck, FileX, Loader2 } from "lucide-react";
import { apiGetActaByRun, apiListAssemblyRuns, apiSetActaConfirmation } from "../api";
import { sileo } from "sileo";
import { formatCurrency } from "@/lib/utils";

type RunRow = Awaited<ReturnType<typeof apiListAssemblyRuns>>[number];

export default function AssemblyListPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiListAssemblyRuns();
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownloadActa = async (run: RunRow) => {
    setDownloadingId(run.id);
    try {
      const resp = await apiGetActaByRun(run.id);
      const html = buildActaHtml(resp, run);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const date = new Date(run.startAt).toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `acta-${date}-${run.id.slice(0, 8)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      sileo.success({ title: "Acta descargada" });
    } catch (err) {
      console.error(err);
      sileo.error({ title: "No se pudo descargar el acta" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleToggleConfirm = async (run: RunRow) => {
    if (run.status !== "completed") {
      sileo.error({ title: "Solo asambleas finalizadas pueden tener acta confirmada." });
      return;
    }
    setTogglingId(run.id);
    try {
      const next = !(run.acta?.confirmed ?? false);
      await apiSetActaConfirmation(run.id, { confirmed: next });
      await load();
      sileo.success({ title: next ? "Acta confirmada" : "Confirmación retirada" });
    } catch (err) {
      console.error(err);
      sileo.error({ title: "No se pudo actualizar el acta" });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Asambleas realizadas</h1>
          <p className="text-sm text-muted-foreground">Historial de sesiones con su acta y estado de confirmación.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/assembly">Volver</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && (
            <div className="py-10 flex justify-center text-muted-foreground gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
            </div>
          )}
          {!loading && runs.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No hay asambleas registradas.</div>
          )}
          {!loading && runs.map((r) => {
            const isCompleted = r.status === "completed";
            const isInProgress = r.status === "in_progress";
            const confirmed = r.acta?.confirmed ?? false;
            const date = new Date(r.startAt);
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border bg-card">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-sm">{r.topic || "Asamblea"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {date.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                    {" · "}{date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {isCompleted && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Finalizada
                    </Badge>
                  )}
                  {isInProgress && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Clock className="w-3 h-3 mr-1" /> En curso
                    </Badge>
                  )}
                  {!isCompleted && !isInProgress && (
                    <Badge variant="outline">{r.status}</Badge>
                  )}
                  {isCompleted && (
                    confirmed ? (
                      <Badge className="bg-emerald-600 text-white"><FileCheck className="w-3 h-3 mr-1" /> Acta confirmada</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <FileX className="w-3 h-3 mr-1" /> Acta sin confirmar
                      </Badge>
                    )
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/assembly/view?id=${r.id}`}><Eye className="w-3.5 h-3.5 mr-1" /> Ver</Link>
                  </Button>
                  {isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadActa(r)}
                      disabled={downloadingId === r.id}
                      title="Descargar acta"
                    >
                      {downloadingId === r.id
                        ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        : <Download className="w-3.5 h-3.5 mr-1" />}
                      Descargar
                    </Button>
                  )}
                  {isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => handleToggleConfirm(r)}
                      disabled={togglingId === r.id}
                      variant={confirmed ? "outline" : "default"}
                    >
                      {togglingId === r.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <FileCheck className="w-3.5 h-3.5 mr-1" />}
                      {confirmed ? "Quitar confirmación" : "Confirmar acta"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// Helpers ----------------------------------------------------------------

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function userLabel(u: any): string {
  if (!u) return "-";
  const last = u.lastname ?? "";
  const name = u.name ?? "";
  return [last, name].filter(Boolean).join(", ") || "-";
}

function buildActaHtml(acta: any, run: RunRow): string {
  const c = acta?.content ?? {};
  const r = c.run ?? run;
  const startAt = r?.startAt ? new Date(r.startAt) : new Date(run.startAt);
  const endAt = r?.endAt ? new Date(r.endAt) : (run.endAt ? new Date(run.endAt) : null);
  const dateLabel = startAt.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const timeLabel = startAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  const confirmed = !!acta?.confirmed;
  const confirmedAtRaw = acta?.confirmedAt;
  const confirmedAtLabel = confirmedAtRaw ? new Date(confirmedAtRaw).toLocaleString("es-PE") : null;

  const participants: any[] = r?.participants ?? [];
  const fines: any[] = c.fines ?? [];
  const shares: any[] = c.shares ?? [];
  const payments: any[] = c.payments ?? [];
  const otherIncomes: any[] = c.otherIncomes ?? [];
  const savingsDeposits: any[] = c.savingsDeposits ?? [];
  const savingsPayouts: any[] = c.savingsPayouts ?? [];
  const creditApplications: any[] = c.creditApplications ?? [];

  const row = (label: string, value: string) => `
    <div class="kv"><span class="k">${escapeHtml(label)}</span><span class="v">${value}</span></div>`;

  const tableRows = (items: any[], cols: { head: string; cell: (it: any) => string }[]) => {
    if (!items?.length) return `<p class="muted">— Sin movimientos.</p>`;
    return `<table>
      <thead><tr>${cols.map(c => `<th>${escapeHtml(c.head)}</th>`).join("")}</tr></thead>
      <tbody>${items.map(it => `<tr>${cols.map(c => `<td>${c.cell(it)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
  };

  const fmt = (n: any) => escapeHtml(formatCurrency(Number(n ?? 0)));

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Acta Asamblea — ${escapeHtml(startAt.toISOString().slice(0, 10))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#111; max-width: 880px; margin: 32px auto; padding: 0 24px; line-height: 1.45; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 28px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
  .muted { color: #6b7280; font-size: 12px; }
  .badge { display:inline-block; padding: 2px 8px; font-size: 11px; border-radius: 999px; border: 1px solid #d1d5db; background: #f9fafb; }
  .badge.ok { color: #047857; border-color: #a7f3d0; background: #ecfdf5; }
  .badge.warn { color: #92400e; border-color: #fcd34d; background: #fffbeb; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 16px; }
  .kv { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed #f3f4f6; }
  .kv .k { color: #6b7280; }
  .kv .v { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
  th { background: #f9fafb; font-weight: 600; color: #374151; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .totals { display: flex; flex-wrap: wrap; gap: 16px; margin: 8px 0 16px; }
  .total { background: #f3f4f6; padding: 8px 12px; border-radius: 6px; font-size: 13px; }
  .total b { display: block; font-size: 16px; }
  header.cover { display:flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  footer { margin-top: 36px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @media print { body { margin: 0; } h2 { page-break-after: avoid; } table { page-break-inside: avoid; } }
</style>
</head>
<body>
  <header class="cover">
    <div>
      <h1>Acta de Asamblea</h1>
      <div class="muted">${escapeHtml(r?.topic ?? "Asamblea General")}</div>
    </div>
    <div>
      ${confirmed
        ? `<span class="badge ok">Acta confirmada${confirmedAtLabel ? " · " + escapeHtml(confirmedAtLabel) : ""}</span>`
        : `<span class="badge warn">Acta sin confirmar</span>`}
    </div>
  </header>

  <h2>Sesión</h2>
  <div class="grid">
    ${row("Fecha", escapeHtml(dateLabel))}
    ${row("Hora", escapeHtml(timeLabel))}
    ${row("Estado", escapeHtml(r?.status ?? run.status))}
    ${row("Finalizada", endAt ? escapeHtml(endAt.toLocaleString("es-PE")) : "—")}
  </div>

  <h2>Resumen económico</h2>
  <div class="totals">
    <div class="total"><b>${fmt(c.totalCollected)}</b>Total recaudado</div>
    <div class="total"><b>${fmt(c.sharesTotal)}</b>Acciones</div>
    <div class="total"><b>${fmt(c.paymentsTotal)}</b>Pagos préstamos</div>
    <div class="total"><b>${fmt(c.savingsDepositsTotal)}</b>Ahorros</div>
    <div class="total"><b>${fmt(c.finesTotal)}</b>Multas</div>
    <div class="total"><b>${fmt(c.otherIncomesTotal)}</b>Otros ingresos</div>
  </div>

  <h2>Asistencia (${participants.length})</h2>
  ${tableRows(participants, [
    { head: "Socio", cell: (p) => escapeHtml(userLabel(p.user) || p.name) },
    { head: "Estado", cell: (p) => escapeHtml(p.status ?? "-") },
  ])}

  <h2>Compra de acciones</h2>
  ${tableRows(shares, [
    { head: "Socio", cell: (s) => escapeHtml(userLabel(s.user)) },
    { head: "Cantidad", cell: (s) => `<span class="num">${escapeHtml(s.quantity ?? 0)}</span>` },
    { head: "Precio", cell: (s) => `<span class="num">${fmt(s.price)}</span>` },
    { head: "Total", cell: (s) => `<span class="num">${fmt((s.quantity ?? 0) * (s.price ?? 0))}</span>` },
  ])}

  <h2>Pagos de préstamos</h2>
  ${tableRows(payments, [
    { head: "Socio", cell: (p) => escapeHtml(userLabel(p.user)) },
    { head: "Capital", cell: (p) => `<span class="num">${fmt(p.amount)}</span>` },
    { head: "Interés", cell: (p) => `<span class="num">${fmt(p.interest)}</span>` },
    { head: "Total", cell: (p) => `<span class="num">${fmt((p.amount ?? 0) + Number(p.interest ?? 0))}</span>` },
  ])}

  <h2>Depósitos de ahorro</h2>
  ${tableRows(savingsDeposits, [
    { head: "Socio", cell: (d) => escapeHtml(userLabel(d.user)) },
    { head: "Monto", cell: (d) => `<span class="num">${fmt(d.amount)}</span>` },
  ])}

  <h2>Pagos a ahorristas</h2>
  ${tableRows(savingsPayouts, [
    { head: "Socio", cell: (p) => escapeHtml(userLabel(p.user)) },
    { head: "Descripción", cell: (p) => escapeHtml(p.description ?? "-") },
    { head: "Monto", cell: (p) => `<span class="num">${fmt(p.amount)}</span>` },
  ])}

  <h2>Multas (tardanza/falta)</h2>
  ${tableRows(fines, [
    { head: "Socio", cell: (f) => escapeHtml(userLabel(f.user) || f.description) },
    { head: "Descripción", cell: (f) => escapeHtml(f.description ?? "-") },
    { head: "Monto", cell: (f) => `<span class="num">${fmt(f.amount)}</span>` },
  ])}

  <h2>Otros ingresos</h2>
  ${tableRows(otherIncomes, [
    { head: "Descripción", cell: (o) => escapeHtml(o.description ?? "-") },
    { head: "Monto", cell: (o) => `<span class="num">${fmt(o.amount)}</span>` },
  ])}

  <h2>Solicitudes de crédito</h2>
  ${tableRows(creditApplications, [
    { head: "Socio", cell: (a) => escapeHtml(userLabel(a.user)) },
    { head: "Monto", cell: (a) => `<span class="num">${fmt(a.amount)}</span>` },
    { head: "Propósito", cell: (a) => escapeHtml(a.purpose ?? "-") },
    { head: "Estado", cell: (a) => escapeHtml(a.status ?? "-") },
  ])}

  <footer>
    Generado el ${escapeHtml(new Date().toLocaleString("es-PE"))} desde Unica · ID: ${escapeHtml(run.id)}
  </footer>
</body>
</html>`;
}
