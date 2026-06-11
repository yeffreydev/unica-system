"use client";

import React from "react";

/**
 * Diseño unificado de actas (estilo documento formal / LaTeX).
 *
 * Todas las vistas y exportaciones (pantalla, PDF, HTML descargable) comparten
 * la misma tipografía serif, los mismos rótulos en español y la misma jerarquía
 * de secciones, reglas tipo "booktabs" y bloque de firmas.
 *
 * Todo el texto va en español. Los estados (asistencia, sesión, crédito) se
 * traducen siempre mediante los mapas de abajo.
 */

// ── Rótulos de estado (siempre en español) ─────────────────────────────────

export const PARTICIPANT_STATUS_LABEL: Record<string, string> = {
  registered: "Registrado",
  confirmed: "Confirmado",
  declined: "Rechazado",
  attended: "Asistió",
  late: "Tardanza",
  absent: "Ausente",
};

export const RUN_STATUS_LABEL: Record<string, string> = {
  scheduled: "Programada",
  completed: "Finalizada",
  in_progress: "En curso",
  cancelled: "Cancelada",
};

export const CREDIT_STATUS_LABEL: Record<string, string> = {
  approved: "Aprobado",
  rejected: "Rechazado",
  pending: "Pendiente",
};

export const participantStatusLabel = (s?: string | null) =>
  PARTICIPANT_STATUS_LABEL[(s ?? "").toLowerCase()] ?? (s ?? "—");

export const runStatusLabel = (s?: string | null) =>
  RUN_STATUS_LABEL[(s ?? "").toLowerCase()] ?? (s ?? "—");

export const creditStatusLabel = (s?: string | null) =>
  CREDIT_STATUS_LABEL[(s ?? "").toLowerCase()] ?? (s ?? "—");

// ── Utilidades ──────────────────────────────────────────────────────────────

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"];
export const toRoman = (n: number) => ROMAN[n] ?? String(n);

export const fmtDateLong = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "—";

export const fmtDateShort = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export const fmtTimeShort = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) : "—";

// ── Componentes React (pantalla) ─────────────────────────────────────────────

/** Hoja del acta: tipografía serif y ancho de documento. */
export function ActaPaper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`font-serif text-foreground leading-relaxed [&_*]:font-serif ${className}`}
      style={{ fontFeatureSettings: '"liga" 1, "onum" 1' }}
    >
      {children}
    </div>
  );
}

/** Encabezado tipo \maketitle: organización, título, subtítulo y metadatos centrados. */
export function ActaTitle({
  org = "Asamblea General de Socios",
  title = "Acta de Asamblea",
  subtitle,
  meta = [],
  badge,
}: {
  org?: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  badge?: React.ReactNode;
}) {
  return (
    <header className="text-center pb-5 mb-7 border-b-[3px] border-double border-foreground/70">
      <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{org}</div>
      <h1 className="text-2xl sm:text-[28px] font-bold uppercase tracking-[0.06em] leading-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm italic text-muted-foreground">{subtitle}</p>}
      {meta.length > 0 && (
        <div className="mt-3 flex justify-center items-center flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          {meta.map((m, i) => (
            <React.Fragment key={m.label}>
              {i > 0 && <span className="text-foreground/30">·</span>}
              <span>
                {m.label}: <strong className="text-foreground font-semibold not-italic">{m.value}</strong>
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      {badge && <div className="mt-3 flex justify-center">{badge}</div>}
    </header>
  );
}

/** Sección numerada con regla inferior (numeración romana por defecto). */
export function ActaSection({
  numeral,
  title,
  children,
  right,
}: {
  numeral: string | number;
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h2 className="flex items-baseline justify-between gap-3 text-[14px] sm:text-[15px] font-bold uppercase tracking-[0.08em] mb-3 pb-1 border-b border-foreground/40">
        <span>
          <span className="mr-2 tabular-nums">{numeral}.</span>
          {title}
        </span>
        {right && <span className="text-[11px] font-normal normal-case tracking-normal text-muted-foreground shrink-0">{right}</span>}
      </h2>
      <div className="text-[13px]">{children}</div>
    </section>
  );
}

export function ActaEmpty({ text = "Sin movimientos registrados." }: { text?: string }) {
  return <p className="italic text-muted-foreground text-[12px] py-1">— {text}</p>;
}

export type ActaColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
  render?: (row: any) => React.ReactNode;
};

/** Tabla con reglas tipo "booktabs" (regla superior gruesa, inferior gruesa, sin verticales). */
export function ActaTable({
  columns,
  rows,
  totals,
  empty,
}: {
  columns: ActaColumn[];
  rows: any[];
  totals?: Record<string, React.ReactNode>;
  empty?: string;
}) {
  if (!rows?.length) return <ActaEmpty text={empty} />;
  const align = (a?: string) => (a === "right" ? "text-right tabular-nums" : "text-left");
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-t-2 border-b border-foreground/70">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`py-2 px-2 text-[10px] uppercase tracking-[0.06em] font-semibold text-muted-foreground ${align(c.align)}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-foreground/10 ${!totals && i === rows.length - 1 ? "border-b-2 !border-foreground/70" : ""}`}>
              {columns.map((c) => (
                <td key={c.key} className={`py-1.5 px-2 ${align(c.align)}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {totals && (
          <tfoot>
            <tr className="border-b-2 border-foreground/70 font-semibold">
              {columns.map((c) => (
                <td key={c.key} className={`py-2 px-2 ${align(c.align)}`}>
                  {totals[c.key] ?? ""}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/** Fórmula de cierre formal. */
export function ActaClosing({ timeLabel }: { timeLabel?: string }) {
  return (
    <p className="mt-7 text-[12.5px] italic leading-relaxed text-justify text-foreground/90">
      En constancia de lo actuado{timeLabel ? ` y siendo las ${timeLabel} horas` : ""}, se levanta la sesión y se firma la
      presente acta en señal de plena conformidad con los acuerdos adoptados por la asamblea.
    </p>
  );
}

/** Estado de confirmación del acta (reemplaza al bloque de firmas). */
export function ActaConfirmation({ confirmed }: { confirmed: boolean }) {
  return (
    <div className="mt-12 flex justify-center break-inside-avoid">
      <div
        className={`inline-flex items-center rounded-sm border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${
          confirmed
            ? "border-emerald-700 text-emerald-700 dark:text-emerald-400"
            : "border-amber-700 text-amber-700 dark:text-amber-500"
        }`}
      >
        {confirmed ? "Acta confirmada por el administrador" : "Acta no confirmada por el administrador"}
      </div>
    </div>
  );
}

// ── CSS para exportación HTML (mismo lenguaje visual) ────────────────────────

export const ACTA_PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: "Latin Modern Roman", Georgia, "Times New Roman", Times, serif; color:#1a1a1a; max-width: 780px; margin: 42px auto; padding: 0 32px; line-height: 1.5; font-size: 13px; }
  .doc-title { text-align:center; border-bottom: 3px double #1a1a1a; padding-bottom: 18px; margin-bottom: 28px; }
  .doc-title .org { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color:#555; margin-bottom: 6px; }
  .doc-title h1 { font-size: 28px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin: 0; }
  .doc-title .subtitle { font-style: italic; color:#555; margin-top: 4px; font-size: 13px; }
  .doc-title .meta { margin-top: 12px; font-size: 12px; color:#555; }
  .doc-title .meta strong { color:#1a1a1a; font-weight: 600; }
  .doc-title .meta .sep { color:#bbb; margin: 0 6px; }
  .badge { display:inline-block; padding: 2px 10px; font-size: 11px; border: 1px solid #1a1a1a; border-radius: 2px; margin-top: 10px; }
  .badge.ok { color:#15603a; border-color:#15603a; }
  .badge.warn { color:#8a5a00; border-color:#8a5a00; }
  h2.section { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin: 26px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #999; }
  h2.section .num { margin-right: 8px; }
  .muted { color:#666; font-style: italic; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 6px 0 4px; }
  thead th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color:#555; font-weight: 600; padding: 6px 8px; border-top: 2px solid #1a1a1a; border-bottom: 1px solid #1a1a1a; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #ddd; }
  tbody tr:last-child td { border-bottom: 2px solid #1a1a1a; }
  tfoot td { padding: 6px 8px; font-weight: 700; border-bottom: 2px solid #1a1a1a; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px 28px; margin: 4px 0; }
  .kv { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 4px 0; border-bottom: 1px dotted #ccc; }
  .kv .k { color:#555; } .kv .v { font-weight: 600; }
  .totals { display: flex; flex-wrap: wrap; gap: 14px; margin: 10px 0 6px; }
  .total { border: 1px solid #ccc; padding: 8px 14px; font-size: 12px; text-align: center; min-width: 120px; }
  .total b { display: block; font-size: 16px; margin-bottom: 2px; }
  .closing { font-style: italic; text-align: justify; margin-top: 24px; font-size: 12px; }
  .confirmation { text-align: center; margin-top: 48px; }
  .confirmation .badge { font-weight: 600; text-transform: uppercase; letter-spacing: .06em; padding: 8px 18px; }
  footer { margin-top: 44px; border-top: 1px solid #ccc; padding-top: 8px; font-size: 10px; color:#777; text-align: center; }
  @media print { body { margin: 0; } h2.section { page-break-after: avoid; } table { page-break-inside: avoid; } .confirmation { page-break-inside: avoid; } }
`;

// ── Tema y ayudantes para PDF (jsPDF) ────────────────────────────────────────

export const ACTA_PDF = {
  ink: [26, 26, 26] as [number, number, number],
  muted: [90, 90, 90] as [number, number, number],
  faint: [150, 150, 150] as [number, number, number],
  rule: [40, 40, 40] as [number, number, number],
  hair: [210, 210, 210] as [number, number, number],
  green: [21, 96, 58] as [number, number, number],
  red: [150, 30, 30] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  serif: "times" as const,
};
