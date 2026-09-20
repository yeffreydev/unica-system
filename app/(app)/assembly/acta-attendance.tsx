"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ActaColumn, participantStatusLabel, ACTA_PDF } from "./acta-theme";
import type { IFinesConfig } from "./api";

/**
 * Control de asistencia del acta con el detalle de multas.
 *
 * Cada participante muestra el estado, la multa que le corresponde según la
 * configuración vigente y cuánto pagó efectivamente (0 si no pagó). Las faltas
 * y tardanzas se resaltan en rojo en pantalla, PDF y HTML, manteniendo la misma
 * tipografía serif del resto del acta.
 */

export const DEFAULT_FINES_CONFIG: IFinesConfig = {
  lateFineAmount: 0,
  absenceFineAmount: 0,
  consecutiveAbsencesLimit: 0,
  consecutiveAbsencesFine: 0,
};

const norm = (s?: string | null) => String(s ?? "").toLowerCase();

/** Faltas y tardanzas son los estados que generan multa. */
export const isPenalizedStatus = (status?: string | null) =>
  norm(status) === "late" || norm(status) === "absent";

/** Multa que le corresponde al participante según la configuración vigente. */
export function fineDueFor(participant: any, cfg: IFinesConfig = DEFAULT_FINES_CONFIG): number {
  const status = norm(participant?.status);
  if (status === "late") return Number(cfg?.lateFineAmount) || 0;
  if (status === "absent") {
    const consecutive = (Number(participant?.consecutiveAbsencesCount) || 0) + 1;
    const limit = Number(cfg?.consecutiveAbsencesLimit) || 0;
    if (limit > 0 && consecutive >= limit) return Number(cfg?.consecutiveAbsencesFine) || 0;
    return Number(cfg?.absenceFineAmount) || 0;
  }
  return 0;
}

const nameKey = (u: any) =>
  `${norm(u?.lastname)}|${norm(u?.name)}`.replace(/^\||\|$/g, "");

const userKeys = (row: any): string[] => {
  const keys: string[] = [];
  const id = row?.userId ?? row?.user?.id;
  if (id) keys.push(`id:${id}`);
  const nk = nameKey(row?.user);
  if (nk) keys.push(`name:${nk}`);
  return keys;
};

/** Suma de multas cobradas por socio (por id y, como respaldo, por nombre). */
export function paidFinesByUser(fines: any[] = []): Map<string, number> {
  const map = new Map<string, number>();
  fines.forEach((f) => {
    const amount = Number(f?.amount) || 0;
    userKeys(f).forEach((k) => map.set(k, (map.get(k) ?? 0) + amount));
  });
  return map;
}

export interface AttendanceRow {
  participant: any;
  user: any;
  status: string;
  statusLabel: string;
  penalized: boolean;
  /** Multa que corresponde (la mayor entre la configurada y la efectivamente cobrada). */
  due: number;
  /** Monto realmente pagado; 0 si no pagó. */
  paid: number;
  pending: number;
  paidInFull: boolean;
  absencesCount: number;
  consecutiveAbsencesCount: number;
}

export function buildAttendanceRows(
  participants: any[] = [],
  fines: any[] = [],
  cfg: IFinesConfig = DEFAULT_FINES_CONFIG
): AttendanceRow[] {
  const paidMap = paidFinesByUser(fines);

  return participants.map((p) => {
    const keys = userKeys(p);
    // Solo se cuenta una vez aunque el socio coincida por id y por nombre.
    const paid = keys.reduce((acc, k) => (paidMap.has(k) ? Math.max(acc, paidMap.get(k)!) : acc), 0);
    const penalized = isPenalizedStatus(p?.status);
    const configured = fineDueFor(p, cfg);
    const due = Math.max(configured, paid);

    return {
      participant: p,
      user: p?.user,
      status: String(p?.status ?? ""),
      statusLabel: participantStatusLabel(p?.status),
      penalized,
      due,
      paid,
      pending: Math.max(0, due - paid),
      paidInFull: due > 0 && paid >= due,
      absencesCount: Number(p?.absencesCount) || 0,
      consecutiveAbsencesCount: Number(p?.consecutiveAbsencesCount) || 0,
    };
  });
}

export function attendanceFineTotals(rows: AttendanceRow[]) {
  return rows.reduce(
    (acc, r) => ({
      due: acc.due + r.due,
      paid: acc.paid + r.paid,
      pending: acc.pending + r.pending,
    }),
    { due: 0, paid: 0, pending: 0 }
  );
}

const personLabel = (u: any, fallback?: string) => {
  if (!u) return fallback || "—";
  const label = [u.lastname, u.name].filter(Boolean).join(", ");
  return label || fallback || "—";
};

// ── Pantalla ────────────────────────────────────────────────────────────────

const RED = "text-red-700 dark:text-red-400 font-semibold";
const GREEN = "text-emerald-700 dark:text-emerald-400";

/** Columnas del control de asistencia para las vistas en pantalla. */
export function attendanceScreenColumns(opts: { withAbsences?: boolean } = {}): ActaColumn[] {
  const cols: ActaColumn[] = [
    {
      key: "socio",
      header: "Socio",
      render: (r: AttendanceRow) => personLabel(r.user, r.participant?.name),
    },
  ];

  if (opts.withAbsences) {
    cols.push({
      key: "faltas",
      header: "Faltas",
      align: "right",
      render: (r: AttendanceRow) =>
        r.absencesCount > 0
          ? `${r.absencesCount}${r.consecutiveAbsencesCount > 0 ? ` (${r.consecutiveAbsencesCount} consec.)` : ""}`
          : "—",
    });
  }

  cols.push(
    {
      key: "estado",
      header: "Estado",
      align: "right",
      render: (r: AttendanceRow) => (
        <span className={r.penalized ? RED : undefined}>{r.statusLabel}</span>
      ),
    },
    {
      key: "multa",
      header: "Multa",
      align: "right",
      render: (r: AttendanceRow) => (
        <span className={r.penalized ? RED : "text-muted-foreground"}>
          {formatCurrency(r.due)}
        </span>
      ),
    },
    {
      key: "pagado",
      header: "Pagado",
      align: "right",
      render: (r: AttendanceRow) => (
        <span className={r.paid > 0 ? (r.pending > 0 ? RED : GREEN) : r.due > 0 ? RED : "text-muted-foreground"}>
          {formatCurrency(r.paid)}
        </span>
      ),
    }
  );

  return cols;
}

/** Totales del pie de la tabla de asistencia. */
export function attendanceScreenTotals(rows: AttendanceRow[]) {
  const t = attendanceFineTotals(rows);
  return {
    socio: "Totales",
    multa: formatCurrency(t.due),
    pagado: (
      <span className={t.pending > 0 ? RED : t.paid > 0 ? GREEN : undefined}>
        {formatCurrency(t.paid)}
      </span>
    ),
  } as Record<string, React.ReactNode>;
}

// ── PDF (jsPDF) ─────────────────────────────────────────────────────────────

const pdfMoney = (n: number) =>
  `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export type AttendancePdfCol = {
  key: string;
  title: string;
  w: number;
  align?: "right";
  get: (r: any) => string | number;
  color?: (r: any) => [number, number, number] | undefined;
};

/** Columnas del control de asistencia para el PDF (anchos en mm, total 170). */
export function attendancePdfColumns(): AttendancePdfCol[] {
  const red = (r: AttendanceRow) => (r.penalized ? ACTA_PDF.red : undefined);
  return [
    {
      key: "socio",
      title: "Socio",
      w: 78,
      get: (r: AttendanceRow) => personLabel(r.user, r.participant?.name),
    },
    {
      key: "estado",
      title: "Estado",
      w: 32,
      align: "right",
      get: (r: AttendanceRow) => r.statusLabel,
      color: red,
    },
    {
      key: "multa",
      title: "Multa",
      w: 30,
      align: "right",
      get: (r: AttendanceRow) => pdfMoney(r.due),
      color: red,
    },
    {
      key: "pagado",
      title: "Pagado",
      w: 30,
      align: "right",
      get: (r: AttendanceRow) => pdfMoney(r.paid),
      color: (r: AttendanceRow) =>
        r.paid > 0 ? (r.pending > 0 ? ACTA_PDF.red : ACTA_PDF.green) : r.due > 0 ? ACTA_PDF.red : undefined,
    },
  ];
}

export function attendancePdfTotals(rows: AttendanceRow[]) {
  const t = attendanceFineTotals(rows);
  return { socio: "Totales", multa: pdfMoney(t.due), pagado: pdfMoney(t.paid) };
}

// ── HTML descargable ────────────────────────────────────────────────────────

const HTML_RED = "#b91c1c";
const HTML_GREEN = "#15603a";

const htmlTone = (text: string, color?: string) =>
  color ? `<span style="color:${color};font-weight:600">${text}</span>` : text;

/** Celdas del control de asistencia para la exportación HTML. */
export function attendanceHtmlColumns(escapeHtml: (v: any) => string, money: (n: any) => string) {
  return [
    {
      head: "Socio",
      cell: (r: AttendanceRow) => escapeHtml(personLabel(r.user, r.participant?.name)),
    },
    {
      head: "Estado",
      num: true,
      cell: (r: AttendanceRow) =>
        htmlTone(escapeHtml(r.statusLabel), r.penalized ? HTML_RED : undefined),
    },
    {
      head: "Multa",
      num: true,
      cell: (r: AttendanceRow) => htmlTone(money(r.due), r.penalized ? HTML_RED : undefined),
    },
    {
      head: "Pagado",
      num: true,
      cell: (r: AttendanceRow) =>
        htmlTone(
          money(r.paid),
          r.paid > 0 ? (r.pending > 0 ? HTML_RED : HTML_GREEN) : r.due > 0 ? HTML_RED : undefined
        ),
    },
  ];
}

export function attendanceHtmlTotals(rows: AttendanceRow[], money: (n: any) => string) {
  const t = attendanceFineTotals(rows);
  return ["Totales", "", money(t.due), money(t.paid)];
}
