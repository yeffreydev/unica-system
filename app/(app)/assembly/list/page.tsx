"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Coins, Download, Eye, FileCheck, FileText, FileX, Loader2 } from "lucide-react";
import { apiGetActaByRun, apiListAssemblyRuns, apiSetActaConfirmation } from "../api";
import { sileo } from "sileo";
import { formatCurrency } from "@/lib/utils";
import { downloadActaPdf } from "../acta-pdf";
import {
  ACTA_PRINT_CSS,
  participantStatusLabel,
  runStatusLabel,
  creditStatusLabel,
  fmtDateLong,
  fmtTimeShort,
} from "../acta-theme";

type RunRow = Awaited<ReturnType<typeof apiListAssemblyRuns>>[number];

export default function AssemblyListPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [finesLoadingId, setFinesLoadingId] = useState<string | null>(null);
  const [finesCache, setFinesCache] = useState<Record<string, any[]>>({});

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

  const handleDownloadPdf = async (run: RunRow) => {
    setDownloadingPdfId(run.id);
    try {
      const resp = await apiGetActaByRun(run.id);
      downloadActaPdf(resp, run);
      sileo.success({ title: "Acta descargada (PDF)" });
    } catch (err) {
      console.error(err);
      sileo.error({ title: "No se pudo descargar el acta en PDF" });
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleToggleMultas = async (run: RunRow) => {
    if (expandedId === run.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(run.id);
    if (finesCache[run.id]) return;
    setFinesLoadingId(run.id);
    try {
      const resp = await apiGetActaByRun(run.id);
      setFinesCache((prev) => ({ ...prev, [run.id]: resp?.content?.fines ?? [] }));
    } catch (err) {
      console.error(err);
      setFinesCache((prev) => ({ ...prev, [run.id]: [] }));
      sileo.error({ title: "No se pudieron cargar las multas" });
    } finally {
      setFinesLoadingId(null);
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
              <div key={r.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-3">
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
                      <Badge variant="outline">{runStatusLabel(r.status)}</Badge>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/assembly/view?id=${r.id}`}><Eye className="w-3.5 h-3.5 mr-1" /> Ver</Link>
                    </Button>
                    {isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleMultas(r)}
                        title="Ver quiénes pagaron multas"
                      >
                        <Coins className="w-3.5 h-3.5 mr-1" /> Multas
                        {expandedId === r.id ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                      </Button>
                    )}
                    {isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPdf(r)}
                        disabled={downloadingPdfId === r.id}
                        title="Descargar acta en PDF"
                      >
                        {downloadingPdfId === r.id
                          ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          : <FileText className="w-3.5 h-3.5 mr-1" />}
                        PDF
                      </Button>
                    )}
                    {isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadActa(r)}
                        disabled={downloadingId === r.id}
                        title="Descargar acta en HTML"
                      >
                        {downloadingId === r.id
                          ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          : <Download className="w-3.5 h-3.5 mr-1" />}
                        HTML
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

                {expandedId === r.id && (
                  <div className="border-t bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                      <Coins className="w-3.5 h-3.5" /> Socios que pagaron multas
                    </div>
                    {finesLoadingId === r.id ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando…
                      </div>
                    ) : (finesCache[r.id]?.length ?? 0) === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-1">No se registraron multas en esta asamblea.</p>
                    ) : (
                      <ul className="divide-y">
                        {finesCache[r.id].map((f: any) => {
                          const who = f.user ? `${f.user.lastname ?? ""}, ${f.user.name ?? ""}`.replace(/^,\s*|,\s*$/g, "") : (f.description || "Sin socio");
                          return (
                            <li key={f.id} className="flex justify-between items-center gap-3 py-1.5 text-sm">
                              <div className="min-w-0">
                                <span className="font-medium">{who}</span>
                                {f.description && <span className="text-[11px] text-muted-foreground ml-2 truncate">{f.description}</span>}
                              </div>
                              <span className="font-semibold tabular-nums shrink-0">{formatCurrency(f.amount ?? 0)}</span>
                            </li>
                          );
                        })}
                        <li className="flex justify-between items-center gap-3 pt-2 text-sm font-semibold">
                          <span>Total</span>
                          <span className="tabular-nums">
                            {formatCurrency(finesCache[r.id].reduce((s: number, f: any) => s + (f.amount ?? 0), 0))}
                          </span>
                        </li>
                      </ul>
                    )}
                  </div>
                )}
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
  const dateLabel = fmtDateLong(startAt);
  const timeLabel = fmtTimeShort(startAt);
  const confirmed = !!acta?.confirmed;
  const confirmedAtRaw = acta?.confirmedAt;
  const confirmedAtLabel = confirmedAtRaw ? new Date(confirmedAtRaw).toLocaleString("es-PE") : null;
  const closingTime = endAt ? fmtTimeShort(endAt) : timeLabel;

  const participants: any[] = r?.participants ?? [];
  const fines: any[] = c.fines ?? [];
  const shares: any[] = c.shares ?? [];
  const payments: any[] = c.payments ?? [];
  const otherIncomes: any[] = c.otherIncomes ?? [];
  const savingsDeposits: any[] = c.savingsDeposits ?? [];
  const savingsPayouts: any[] = c.savingsPayouts ?? [];
  const creditApplications: any[] = c.creditApplications ?? [];

  const fmt = (n: any) => escapeHtml(formatCurrency(Number(n ?? 0)));

  const section = (num: string, title: string, right: string, body: string) =>
    `<h2 class="section"><span class="num">${num}.</span>${escapeHtml(title)}${right ? `<span style="float:right;font-weight:400;text-transform:none;letter-spacing:0;color:#666;font-size:12px;">${right}</span>` : ""}</h2>${body}`;

  const table = (
    items: any[],
    cols: { head: string; num?: boolean; cell: (it: any) => string }[],
    foot?: string[],
  ) => {
    if (!items?.length) return `<p class="muted">— Sin movimientos registrados.</p>`;
    const head = `<thead><tr>${cols.map(co => `<th class="${co.num ? "num" : ""}">${escapeHtml(co.head)}</th>`).join("")}</tr></thead>`;
    const body = `<tbody>${items.map(it => `<tr>${cols.map(co => `<td class="${co.num ? "num" : ""}">${co.cell(it)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    const footer = foot ? `<tfoot><tr>${foot.map((f, i) => `<td class="${cols[i]?.num ? "num" : ""}">${f}</td>`).join("")}</tr></tfoot>` : "";
    return `<table>${head}${body}${footer}</table>`;
  };

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Acta de Asamblea — ${escapeHtml(startAt.toISOString().slice(0, 10))}</title>
<style>${ACTA_PRINT_CSS}</style>
</head>
<body>
  <div class="doc-title">
    <div class="org">Asamblea General de Socios</div>
    <h1>Acta de Asamblea</h1>
    <div class="subtitle">${escapeHtml(r?.topic ?? "Asamblea General de Socios")}</div>
    <div class="meta">
      Fecha: <strong>${escapeHtml(dateLabel)}</strong><span class="sep">·</span>
      Hora: <strong>${escapeHtml(timeLabel)}</strong><span class="sep">·</span>
      ${r?.place ? `Lugar: <strong>${escapeHtml(r.place)}</strong><span class="sep">·</span>` : ""}
      Estado: <strong>${escapeHtml(runStatusLabel(r?.status ?? run.status))}</strong><span class="sep">·</span>
      Total recaudado: <strong>${fmt(c.totalCollected)}</strong>
    </div>
    <div>
      ${confirmed
        ? `<span class="badge ok">Acta confirmada${confirmedAtLabel ? " · " + escapeHtml(confirmedAtLabel) : ""}</span>`
        : `<span class="badge warn">Acta sin confirmar</span>`}
    </div>
  </div>

  ${section("I", "Control de asistencia", `${participants.length} convocados`, table(participants, [
    { head: "Socio", cell: (p) => escapeHtml(userLabel(p.user) || p.name) },
    { head: "Estado", num: true, cell: (p) => escapeHtml(participantStatusLabel(p.status)) },
  ]))}

  ${section("II", "Compra de acciones", fmt(c.sharesTotal), table(shares, [
    { head: "Socio", cell: (s) => escapeHtml(userLabel(s.user)) },
    { head: "Cantidad", num: true, cell: (s) => escapeHtml(s.quantity ?? 0) },
    { head: "Precio", num: true, cell: (s) => fmt(s.price) },
    { head: "Total", num: true, cell: (s) => fmt((s.quantity ?? 0) * (s.price ?? 0)) },
  ], ["Total", "", "", fmt(c.sharesTotal)]))}

  ${section("III", "Recuperación de préstamos", "", table(payments, [
    { head: "Socio", cell: (p) => escapeHtml(userLabel(p.user)) },
    { head: "Interés", num: true, cell: (p) => fmt(p.interest) },
    { head: "Capital", num: true, cell: (p) => fmt(p.amount) },
    { head: "Total", num: true, cell: (p) => fmt((p.amount ?? 0) + Number(p.interest ?? 0)) },
  ], ["Totales", fmt(c.paymentsInterest), fmt(c.paymentsCapital), fmt(c.paymentsTotal)]))}

  ${section("IV", "Depósitos de ahorro", fmt(c.savingsDepositsTotal), table(savingsDeposits, [
    { head: "Socio", cell: (d) => escapeHtml(userLabel(d.user)) },
    { head: "Monto", num: true, cell: (d) => fmt(d.amount) },
  ], ["Total", fmt(c.savingsDepositsTotal)]))}

  ${section("V", "Pagos a ahorristas", "", table(savingsPayouts, [
    { head: "Socio", cell: (p) => escapeHtml(userLabel(p.user)) },
    { head: "Descripción", cell: (p) => escapeHtml(p.description ?? "—") },
    { head: "Monto", num: true, cell: (p) => fmt(p.amount) },
  ]))}

  ${section("VI", "Multas", fmt(c.finesTotal), table(fines, [
    { head: "Socio", cell: (f) => escapeHtml(userLabel(f.user) || f.description) },
    { head: "Descripción", cell: (f) => escapeHtml(f.description ?? "—") },
    { head: "Monto", num: true, cell: (f) => fmt(f.amount) },
  ], ["Total", "", fmt(c.finesTotal)]))}

  ${section("VII", "Otros ingresos", fmt(c.otherIncomesTotal), table(otherIncomes, [
    { head: "Descripción", cell: (o) => escapeHtml(o.description ?? "—") },
    { head: "Monto", num: true, cell: (o) => fmt(o.amount) },
  ], ["Total", fmt(c.otherIncomesTotal)]))}

  ${section("VIII", "Solicitudes de crédito", "", table(creditApplications, [
    { head: "Socio", cell: (a) => escapeHtml(userLabel(a.user)) },
    { head: "Monto", num: true, cell: (a) => fmt(a.amount) },
    { head: "Propósito", cell: (a) => escapeHtml(a.purpose ?? "—") },
    { head: "Estado", num: true, cell: (a) => escapeHtml(creditStatusLabel(a.status)) },
  ]))}

  <p class="closing">En constancia de lo actuado y siendo las ${escapeHtml(closingTime)} horas, se levanta la sesión y se firma la presente acta en señal de plena conformidad con los acuerdos adoptados por la asamblea.</p>

  <div class="confirmation">
    <span class="badge ${confirmed ? "ok" : "warn"}">
      ${confirmed ? "Acta confirmada por el administrador" : "Acta no confirmada por el administrador"}
    </span>
  </div>

  <footer>
    Documento generado el ${escapeHtml(new Date().toLocaleString("es-PE"))} desde Unica · ID: ${escapeHtml(run.id)}
  </footer>
</body>
</html>`;
}
