import jsPDF from "jspdf";
import { formatCurrency } from "@/lib/utils";
import {
  ACTA_PDF,
  participantStatusLabel,
  creditStatusLabel,
  runStatusLabel,
  fmtDateShort,
  fmtTimeShort,
} from "./acta-theme";

export type PdfCol = { key: string; title: string; w: number; align?: "right"; get: (r: any) => string | number };

const userLabel = (u: any) =>
  u ? `${u?.lastname ?? ""}, ${u?.name ?? ""}`.replace(/^,\s*|,\s*$/g, "") || "—" : "—";

/**
 * Constructor de actas en PDF con el mismo lenguaje visual formal (estilo LaTeX)
 * que las vistas en pantalla y la exportación HTML.
 */
export class ActaPdf {
  doc: jsPDF;
  C = ACTA_PDF;
  pageWidth: number;
  pageHeight: number;
  margin = 20;
  contentWidth: number;
  y: number;

  constructor() {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.margin * 2;
    this.y = this.margin;
  }

  money(n: number) {
    return `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private checkPage(need: number) {
    if (this.y + need > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.y = this.margin;
    }
  }

  private ruleAt(yy: number, w = 0.5, color: [number, number, number] = this.C.rule) {
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(w);
    this.doc.line(this.margin, yy, this.pageWidth - this.margin, yy);
  }

  title({
    org = "ASAMBLEA GENERAL DE SOCIOS",
    title = "ACTA DE ASAMBLEA",
    subtitle,
    meta = [],
  }: {
    org?: string;
    title?: string;
    subtitle?: string;
    meta?: { label: string; value: string }[];
  }) {
    const { doc, C } = this;
    const cx = this.pageWidth / 2;
    doc.setFont(C.serif, "normal"); doc.setFontSize(9); doc.setTextColor(...C.muted);
    doc.text(org, cx, this.y + 2, { align: "center", charSpace: 1.4 });
    this.y += 8;
    doc.setFont(C.serif, "bold"); doc.setFontSize(22); doc.setTextColor(...C.ink);
    doc.text(title, cx, this.y + 4, { align: "center", charSpace: 0.8 });
    this.y += 9;
    if (subtitle) {
      doc.setFont(C.serif, "italic"); doc.setFontSize(11); doc.setTextColor(...C.muted);
      doc.text(subtitle, cx, this.y + 2, { align: "center" });
      this.y += 7;
    }
    if (meta.length) {
      doc.setFont(C.serif, "normal"); doc.setFontSize(9); doc.setTextColor(...C.muted);
      doc.text(meta.map((m) => `${m.label}: ${m.value}`).join("     ·     "), cx, this.y + 2, { align: "center" });
      this.y += 5;
    }
    this.ruleAt(this.y, 0.6);
    this.ruleAt(this.y + 1.3, 0.6);
    this.y += 8;
  }

  section(num: string, t: string) {
    const { doc, C } = this;
    this.checkPage(14);
    doc.setFont(C.serif, "bold"); doc.setFontSize(11); doc.setTextColor(...C.ink);
    doc.text(`${num}.  ${t.toUpperCase()}`, this.margin, this.y + 3, { charSpace: 0.4 });
    this.y += 5;
    this.ruleAt(this.y, 0.4, C.hair);
    this.y += 4;
  }

  table(cols: PdfCol[], rows: any[], footer?: Record<string, string | number>, emptyMsg?: string) {
    const { doc, C } = this;
    if (!rows?.length) {
      doc.setFont(C.serif, "italic"); doc.setFontSize(9); doc.setTextColor(...C.muted);
      doc.text(`— ${emptyMsg || "Sin movimientos registrados."}`, this.margin, this.y + 2);
      this.y += 8;
      return;
    }
    let x = this.margin;
    const cs = cols.map((c) => { const o = { ...c, x }; x += c.w; return o; });
    const xt = (c: (typeof cs)[number]) => (c.align === "right" ? c.x + c.w : c.x);
    const opt = (c: (typeof cs)[number]) => (c.align === "right" ? { align: "right" as const } : undefined);

    this.checkPage(16);
    this.ruleAt(this.y, 0.6); this.y += 2.4;
    doc.setFont(C.serif, "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.muted);
    cs.forEach((c) => doc.text(c.title.toUpperCase(), xt(c), this.y + 1, { ...opt(c), charSpace: 0.3 }));
    this.y += 3.4; this.ruleAt(this.y, 0.3, C.rule); this.y += 3;

    doc.setFont(C.serif, "normal"); doc.setFontSize(9); doc.setTextColor(...C.ink);
    rows.forEach((r) => {
      this.checkPage(8);
      cs.forEach((c) => {
        let txt = String(c.get(r) ?? "");
        if (c.align !== "right") txt = doc.splitTextToSize(txt, c.w - 3)[0] || "";
        doc.text(txt, xt(c), this.y + 2, opt(c));
      });
      this.y += 5;
      doc.setDrawColor(...C.hair); doc.setLineWidth(0.15);
      doc.line(this.margin, this.y - 1.4, this.pageWidth - this.margin, this.y - 1.4);
    });

    if (footer) {
      this.checkPage(8);
      doc.setFont(C.serif, "bold"); doc.setFontSize(9); doc.setTextColor(...C.ink);
      cs.forEach((c) => { const v = footer[c.key]; if (v != null) doc.text(String(v), xt(c), this.y + 2.5, opt(c)); });
      this.y += 5;
    }
    this.ruleAt(this.y, 0.6); this.y += 6;
  }

  closing(timeLabel?: string) {
    const { doc, C } = this;
    this.checkPage(28); this.y += 2;
    doc.setFont(C.serif, "italic"); doc.setFontSize(9.5); doc.setTextColor(...C.ink);
    doc.text(
      `En constancia de lo actuado${timeLabel ? ` y siendo las ${timeLabel} horas` : ""}, se levanta la sesión y se firma la presente acta en señal de plena conformidad con los acuerdos adoptados por la asamblea.`,
      this.margin, this.y + 2, { maxWidth: this.contentWidth, align: "justify" }
    );
    this.y += 18;
  }

  confirmation(confirmed: boolean) {
    const { doc, C } = this;
    this.checkPage(24); this.y += 12;
    const label = confirmed ? "ACTA CONFIRMADA POR EL ADMINISTRADOR" : "ACTA NO CONFIRMADA POR EL ADMINISTRADOR";
    const color = confirmed ? C.green : ([138, 90, 0] as [number, number, number]);
    doc.setFont(C.serif, "bold"); doc.setFontSize(9.5);
    const tw = doc.getTextWidth(label) + 12;
    const cx = this.pageWidth / 2;
    doc.setDrawColor(...color); doc.setLineWidth(0.4);
    doc.roundedRect(cx - tw / 2, this.y - 2, tw, 9, 1, 1, "S");
    doc.setTextColor(...color);
    doc.text(label, cx, this.y + 4, { align: "center", charSpace: 0.3 });
    this.y += 12;
  }

  footer(extra?: string) {
    const { doc, C } = this;
    const fy = this.pageHeight - 10;
    doc.setFont(C.serif, "normal"); doc.setFontSize(7); doc.setTextColor(...C.faint);
    doc.text(
      `Documento generado el ${new Date().toLocaleDateString("es-PE")} a las ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}${extra ? " · " + extra : ""}`,
      this.pageWidth / 2, fy, { align: "center" }
    );
  }

  save(fileName: string) {
    this.doc.save(fileName);
  }
}

/**
 * Genera y descarga el acta en PDF a partir del documento guardado (content).
 * Misma estructura I–VIII que las vistas en pantalla.
 */
export function downloadActaPdf(acta: any, run: any) {
  const c = acta?.content ?? {};
  const r = c.run ?? run;
  const startAt = r?.startAt ?? run?.startAt;
  const endAt = r?.endAt ?? run?.endAt ?? null;
  const closeTime = endAt ? fmtTimeShort(endAt) : fmtTimeShort(startAt);
  const confirmed = !!acta?.confirmed;

  const participants: any[] = r?.participants ?? [];
  const fines: any[] = c.fines ?? [];
  const shares: any[] = c.shares ?? [];
  const payments: any[] = c.payments ?? [];
  const otherIncomes: any[] = c.otherIncomes ?? [];
  const savingsDeposits: any[] = c.savingsDeposits ?? [];
  const savingsPayouts: any[] = c.savingsPayouts ?? [];
  const creditApplications: any[] = c.creditApplications ?? [];

  const A = new ActaPdf();
  const m = A.money.bind(A);

  A.title({
    subtitle: r?.topic || "Asamblea General de Socios",
    meta: [
      { label: "Fecha", value: fmtDateShort(startAt) },
      { label: "Hora", value: `${fmtTimeShort(startAt)}${endAt ? ` – ${fmtTimeShort(endAt)}` : ""}` },
      ...(r?.place ? [{ label: "Lugar", value: String(r.place) }] : []),
      { label: "Estado", value: runStatusLabel(r?.status ?? run?.status) },
      { label: "Total recaudado", value: m(c.totalCollected) },
    ],
  });

  A.section("I", "Control de asistencia");
  A.table(
    [
      { key: "socio", title: "Socio", w: 120, get: (p) => (p.user ? userLabel(p.user) : p.name ?? "—") },
      { key: "estado", title: "Estado", w: 50, align: "right", get: (p) => participantStatusLabel(p.status) },
    ],
    participants, undefined, "Sin participantes registrados."
  );

  A.section("II", "Multas");
  A.table(
    [
      { key: "socio", title: "Socio", w: 80, get: (f) => userLabel(f.user) || (f.description ?? "Sin socio") },
      { key: "motivo", title: "Motivo", w: 60, get: (f) => f.description || "Multa" },
      { key: "monto", title: "Monto", w: 30, align: "right", get: (f) => m(f.amount) },
    ],
    fines, { socio: "Total", monto: m(c.finesTotal) }, "Sin multas registradas."
  );

  A.section("III", "Compra de acciones");
  A.table(
    [
      { key: "socio", title: "Socio", w: 110, get: (s) => userLabel(s.user) },
      { key: "cant", title: "Cantidad", w: 30, align: "right", get: (s) => s.quantity ?? 0 },
      { key: "monto", title: "Monto", w: 30, align: "right", get: (s) => m((s.quantity ?? 0) * (s.price ?? 0)) },
    ],
    shares, { socio: "Total", monto: m(c.sharesTotal) }, "Sin compras de acciones."
  );

  A.section("IV", "Recuperación de préstamos");
  A.table(
    [
      { key: "socio", title: "Socio", w: 70, get: (p) => userLabel(p.user) },
      { key: "interes", title: "Interés", w: 33, align: "right", get: (p) => m(Number(p.interest ?? 0)) },
      { key: "capital", title: "Capital", w: 33, align: "right", get: (p) => m(p.amount) },
      { key: "total", title: "Total", w: 34, align: "right", get: (p) => m((p.amount ?? 0) + Number(p.interest ?? 0)) },
    ],
    payments,
    { socio: "Totales", interes: m(c.paymentsInterest), capital: m(c.paymentsCapital), total: m(c.paymentsTotal) },
    "Sin pagos de préstamos."
  );

  A.section("V", "Depósitos de ahorro");
  A.table(
    [
      { key: "socio", title: "Socio", w: 120, get: (d) => userLabel(d.user) },
      { key: "monto", title: "Monto", w: 50, align: "right", get: (d) => m(d.amount) },
    ],
    savingsDeposits, { socio: "Total", monto: m(c.savingsDepositsTotal) }, "Sin depósitos registrados."
  );

  A.section("VI", "Pagos a ahorristas");
  A.table(
    [
      { key: "socio", title: "Socio", w: 80, get: (p) => userLabel(p.user) },
      { key: "desc", title: "Descripción", w: 60, get: (p) => p.description ?? "—" },
      { key: "monto", title: "Monto", w: 30, align: "right", get: (p) => m(p.amount) },
    ],
    savingsPayouts, undefined, "Sin pagos a ahorristas."
  );

  A.section("VII", "Otros ingresos");
  A.table(
    [
      { key: "desc", title: "Descripción", w: 120, get: (o) => o.description ?? "—" },
      { key: "monto", title: "Monto", w: 50, align: "right", get: (o) => m(o.amount) },
    ],
    otherIncomes, { desc: "Total", monto: m(c.otherIncomesTotal) }, "Sin otros ingresos."
  );

  A.section("VIII", "Solicitudes de crédito");
  A.table(
    [
      { key: "socio", title: "Socio", w: 70, get: (a) => userLabel(a.user) },
      { key: "monto", title: "Monto", w: 33, align: "right", get: (a) => m(a.amount) },
      { key: "prop", title: "Propósito", w: 37, get: (a) => a.purpose ?? "—" },
      { key: "estado", title: "Estado", w: 30, align: "right", get: (a) => creditStatusLabel(a.status) },
    ],
    creditApplications, undefined, "Sin solicitudes de crédito."
  );

  A.closing(closeTime);
  A.confirmation(confirmed);
  A.footer(confirmed ? "Acta confirmada" : "Acta sin confirmar");

  const dateSlug = new Date(startAt).toISOString().slice(0, 10);
  A.save(`Acta_${dateSlug}.pdf`);
}
