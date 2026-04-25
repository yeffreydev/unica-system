import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ReportColumn {
  header: string;
  key: string;
  align?: "left" | "right" | "center";
  format?: "currency" | "number" | "date" | "text";
}

export interface ReportMeta {
  title: string;
  subtitle?: string;
  period?: string;
  bankName?: string;
  fileName: string;
}

const formatCell = (value: unknown, format?: ReportColumn["format"]): string => {
  if (value === null || value === undefined || value === "") return "";
  if (format === "currency") {
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(n)) return String(value);
    return `S/. ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (format === "number") {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isNaN(n) ? String(value) : n.toLocaleString("es-PE");
  }
  if (format === "date") {
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
  }
  return String(value);
};

export const exportToExcel = <T extends object, U extends object = T>(
  meta: ReportMeta,
  columns: ReportColumn[],
  rows: readonly T[],
  totalsRow?: U,
) => {
  const headerLines: unknown[][] = [
    [meta.title],
    ...(meta.subtitle ? [[meta.subtitle]] : []),
    ...(meta.bankName ? [[meta.bankName]] : []),
    ...(meta.period ? [[`Periodo: ${meta.period}`]] : []),
    [`Generado: ${new Date().toLocaleString("es-PE")}`],
    [],
    columns.map(c => c.header),
  ];

  const dataLines = rows.map(r =>
    columns.map(c => {
      const v = (r as Record<string, unknown>)[c.key];
      if (c.format === "currency" || c.format === "number") {
        const n = typeof v === "number" ? v : Number(v);
        return Number.isNaN(n) ? "" : n;
      }
      if (c.format === "date" && v) {
        const d = new Date(v as string);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("es-PE");
      }
      return v ?? "";
    }),
  );

  const aoa: unknown[][] = [...headerLines, ...dataLines];

  if (totalsRow) {
    aoa.push(
      columns.map(c => {
        const v = (totalsRow as Record<string, unknown>)[c.key];
        if (v === undefined || v === null || v === "") return "";
        if (c.format === "currency" || c.format === "number") {
          const n = typeof v === "number" ? v : Number(v);
          return Number.isNaN(n) ? "" : n;
        }
        return String(v);
      }),
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = columns.map(c => ({ wch: Math.max(14, c.header.length + 2) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `${meta.fileName}.xlsx`);
};

export const exportToPDF = <T extends object, U extends object = T>(
  meta: ReportMeta,
  columns: ReportColumn[],
  rows: readonly T[],
  totalsRow?: U,
) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(meta.title, pageWidth / 2, 40, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let y = 56;
  if (meta.bankName) {
    doc.text(meta.bankName, pageWidth / 2, y, { align: "center" });
    y += 14;
  }
  if (meta.subtitle) {
    doc.text(meta.subtitle, pageWidth / 2, y, { align: "center" });
    y += 14;
  }
  if (meta.period) {
    doc.text(`Periodo: ${meta.period}`, pageWidth / 2, y, { align: "center" });
    y += 14;
  }
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`Generado: ${new Date().toLocaleString("es-PE")}`, pageWidth - 40, 30, { align: "right" });
  doc.setTextColor(0);

  const head: RowInput[] = [columns.map(c => ({ content: c.header, styles: { halign: c.align ?? "left" } }))];

  const body: RowInput[] = rows.map(r =>
    columns.map(c => ({
      content: formatCell((r as Record<string, unknown>)[c.key], c.format),
      styles: { halign: c.align ?? (c.format === "currency" || c.format === "number" ? "right" : "left") },
    })),
  );

  const foot: RowInput[] | undefined = totalsRow
    ? [
        columns.map(c => {
          const v = (totalsRow as Record<string, unknown>)[c.key];
          return {
            content: v === undefined || v === null ? "" : formatCell(v, c.format),
            styles: {
              halign: c.align ?? (c.format === "currency" || c.format === "number" ? "right" : "left"),
              fontStyle: "bold" as const,
            },
          };
        }),
      ]
    : undefined;

  autoTable(doc, {
    head,
    body,
    foot,
    startY: y + 8,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { top: 80, left: 30, right: 30, bottom: 40 },
    didDrawPage: data => {
      const str = `Pagina ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(str, pageWidth - 40, doc.internal.pageSize.getHeight() - 20, { align: "right" });
      doc.setTextColor(0);
    },
  });

  doc.save(`${meta.fileName}.pdf`);
};
