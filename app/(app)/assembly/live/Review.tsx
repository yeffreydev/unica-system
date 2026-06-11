"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks, Download, Flag } from "lucide-react";
import { useAssembly } from "../AssemblyContext";
import { apiGetAssemblyActaSummary } from "../api";
import { formatCurrency } from "@/lib/utils";
import CelebrationOverlay from "./CelebrationOverlay";
import {
  ActaPaper,
  ActaTitle,
  ActaSection,
  ActaTable,
  ActaEmpty,
  ActaClosing,
  ActaConfirmation,
  participantStatusLabel,
  creditStatusLabel,
  fmtDateShort,
  fmtTimeShort,
} from "../acta-theme";

type ActaSummary = {
  run: {
    id: string;
    topic: string;
    startAt: string;
    endAt: string | null;
    place?: string | null;
    participants: Array<{
      id: string;
      status: string;
      user: { name: string; lastname: string };
      absencesCount?: number;
      consecutiveAbsencesCount?: number;
    }>;
  };
  fines: Array<{ id: string; amount: number; description: string; tag?: string; user?: { name: string; lastname: string } }>;
  finesTotal: number;
  shares: Array<{ id: string; quantity: number; price: number; user?: { name: string; lastname: string } | null }>;
  sharesTotal: number;
  payments: Array<{ id: string; amount: number; interest: number | null; user?: { name: string; lastname: string } | null }>;
  paymentsCapital: number;
  paymentsInterest: number;
  paymentsTotal: number;
  otherIncomes: Array<{ id: string; amount: number; description: string; tag?: string; user?: { name: string; lastname: string } | null }>;
  otherIncomesTotal: number;
  savingsDeposits: Array<{ id: string; amount: number; user?: { name: string; lastname: string } | null }>;
  savingsDepositsTotal: number;
  savingsPayouts: Array<{ id: string; amount: number; description?: string; user?: { name: string; lastname: string } | null }>;
  creditApplications: Array<{
    id: string;
    amount: number;
    status: string;
    purpose?: string;
    user: { name: string; lastname: string };
    loan?: { amount?: number; initalInstallments?: number; interestRate?: number; loanType?: { name?: string } } | null;
  }>;
  loanInterestRate: number;
  savingsInterestRate: number;
  totalCollected: number;
};

function formatName(u?: { name?: string; lastname?: string } | null) {
  if (!u) return "—";
  return `${u.lastname ?? ""}, ${u.name ?? ""}`.replace(/^,\s*|,\s*$/g, "").trim() || "—";
}

function fineLabel(tag?: string, description?: string) {
  if (tag === "LATE_FEE") return "Tardanza";
  if (tag === "ABSENCE_FEE") return "Inasistencia";
  return description || "Multa";
}

function incomeLabel(tag?: string) {
  if (tag === "FINE") return "Multa";
  if (tag === "DONATION") return "Donación";
  if (tag === "UNCLASSIFIED") return "Sin clasificar";
  return "Ingreso";
}

export default function Review() {
  const { assembly } = useAssembly();
  const [summary, setSummary] = useState<ActaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    (async () => {
      if (!assembly?.lastRun?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiGetAssemblyActaSummary(assembly.lastRun.id);
        setSummary(data);
      } catch (error) {
        console.error("Error loading acta summary:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [assembly?.lastRun?.id]);

  const agendaItems = [
    { duration: "10min", title: "Apertura y quórum", detail: "Verificación de quórum y saludo de bienvenida." },
    { duration: "10min", title: "Lectura de acta anterior", detail: "Resumen y aprobación del acta previa." },
    { duration: "10min", title: "Agenda del día", detail: "Presentación de puntos a tratar." },
    { duration: "10min", title: "Aportes y compras de acciones", detail: "Registro de compras y actualización de capital social." },
    { duration: "10min", title: "Ahorros e intereses", detail: "Recepción de depósitos y actualización de saldos." },
    { duration: "10min", title: "Solicitudes de crédito", detail: "Evaluación rápida y acuerdos de aprobación." },
    { duration: "10min", title: "Acuerdos y cierre", detail: "Revisión de acuerdos, firma y cierre oficial." },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 w-full">
      <CelebrationOverlay open={celebrating} onClose={() => setCelebrating(false)} />

      {/* Agenda */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Agenda de la Reunión</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-medium">{agendaItems.length} puntos</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-5 pb-5 space-y-1.5">
            {agendaItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{item.title}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium">{item.duration}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acta */}
      {loading ? (
        <Card className="w-full">
          <CardContent className="py-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </CardContent>
        </Card>
      ) : !summary ? (
        <Card className="w-full">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No hay asamblea en curso para generar el acta.
          </CardContent>
        </Card>
      ) : (
        <ActaContent summary={summary} />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Download className="h-3.5 w-3.5" />
          Exportar PDF
        </Button>
        <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setCelebrating(true)}>
          <Flag className="h-3.5 w-3.5" />
          Finalizar asamblea
        </Button>
      </div>
    </div>
  );
}

function ActaContent({ summary }: { summary: ActaSummary }) {
  const run = summary.run;
  const present = run.participants.filter(p => p.status === "attended" || p.status === "late").length;

  return (
    <Card className="w-full overflow-hidden border-foreground/15">
      <CardContent className="px-5 sm:px-10 py-8 sm:py-10">
        <ActaPaper>
          <ActaTitle
            subtitle={run.topic || "Asamblea General de Socios"}
            meta={[
              { label: "Fecha", value: fmtDateShort(run.startAt) },
              { label: "Hora", value: `${fmtTimeShort(run.startAt)}${run.endAt ? ` – ${fmtTimeShort(run.endAt)}` : ""}` },
              ...(run.place ? [{ label: "Lugar", value: String(run.place) }] : []),
              { label: "Asistencia", value: `${present}/${run.participants.length}` },
              { label: "Total recaudado", value: formatCurrency(summary.totalCollected) },
            ]}
          />

          {/* I. Asistencia */}
          <ActaSection numeral="I" title="Control de asistencia" right={`${run.participants.length} convocados`}>
            <ActaTable
              columns={[
                { key: "socio", header: "Socio", render: (p) => formatName(p.user) },
                {
                  key: "faltas",
                  header: "Faltas",
                  align: "right",
                  render: (p) =>
                    (p.absencesCount ?? 0) > 0
                      ? `${p.absencesCount}${(p.consecutiveAbsencesCount ?? 0) > 0 ? ` (${p.consecutiveAbsencesCount} consec.)` : ""}`
                      : "—",
                },
                { key: "estado", header: "Estado", align: "right", render: (p) => participantStatusLabel(p.status) },
              ]}
              rows={run.participants}
              empty="Sin participantes registrados."
            />
          </ActaSection>

          {/* II. Multas */}
          <ActaSection numeral="II" title="Multas" right={formatCurrency(summary.finesTotal)}>
            <ActaTable
              columns={[
                { key: "socio", header: "Socio", render: (f) => formatName(f.user) },
                { key: "motivo", header: "Motivo", render: (f) => fineLabel(f.tag, f.description) },
                { key: "monto", header: "Monto", align: "right", render: (f) => formatCurrency(f.amount) },
              ]}
              rows={summary.fines}
              totals={{ socio: "Total", monto: formatCurrency(summary.finesTotal) }}
              empty="Sin multas registradas."
            />
          </ActaSection>

          {/* III. Acciones */}
          <ActaSection numeral="III" title="Compra de acciones" right={formatCurrency(summary.sharesTotal)}>
            <ActaTable
              columns={[
                { key: "socio", header: "Socio", render: (s) => formatName(s.user) },
                { key: "cant", header: "Cantidad", align: "right", render: (s) => s.quantity },
                { key: "monto", header: "Monto", align: "right", render: (s) => formatCurrency(s.quantity * s.price) },
              ]}
              rows={summary.shares}
              totals={{ socio: "Total", monto: formatCurrency(summary.sharesTotal) }}
              empty="Sin compras de acciones."
            />
          </ActaSection>

          {/* IV. Recuperación de préstamos */}
          <ActaSection numeral="IV" title="Recuperación de préstamos">
            <ActaTable
              columns={[
                { key: "socio", header: "Socio", render: (p) => formatName(p.user) },
                { key: "interes", header: "Interés", align: "right", render: (p) => formatCurrency(Number(p.interest ?? 0)) },
                { key: "capital", header: "Capital", align: "right", render: (p) => formatCurrency(p.amount) },
                { key: "total", header: "Total", align: "right", render: (p) => formatCurrency(p.amount + Number(p.interest ?? 0)) },
              ]}
              rows={summary.payments}
              totals={{
                socio: "Totales",
                interes: formatCurrency(summary.paymentsInterest),
                capital: formatCurrency(summary.paymentsCapital),
                total: formatCurrency(summary.paymentsTotal),
              }}
              empty="Sin pagos de préstamos."
            />
          </ActaSection>

          {/* V. Ahorros */}
          <ActaSection numeral="V" title="Ahorros recibidos en la asamblea" right={formatCurrency(summary.savingsDepositsTotal)}>
            <ActaTable
              columns={[
                { key: "socio", header: "Socio", render: (d) => formatName(d.user) },
                { key: "monto", header: "Monto", align: "right", render: (d) => formatCurrency(d.amount) },
              ]}
              rows={summary.savingsDeposits}
              totals={{ socio: "Total", monto: formatCurrency(summary.savingsDepositsTotal) }}
              empty="Sin depósitos registrados."
            />
          </ActaSection>

          {/* VI. Otros ingresos */}
          <ActaSection numeral="VI" title="Otros ingresos" right={formatCurrency(summary.otherIncomesTotal)}>
            <ActaTable
              columns={[
                { key: "socio", header: "Socio", render: (o) => formatName(o.user) },
                { key: "concepto", header: "Concepto", render: (o) => `${incomeLabel(o.tag)} · ${o.description}` },
                { key: "monto", header: "Monto", align: "right", render: (o) => formatCurrency(o.amount) },
              ]}
              rows={summary.otherIncomes}
              totals={{ socio: "Total", monto: formatCurrency(summary.otherIncomesTotal) }}
              empty="Sin otros ingresos."
            />
          </ActaSection>

          {/* VII. Otorgamiento de nuevos préstamos */}
          <ActaSection numeral="VII" title="Otorgamiento de nuevos préstamos">
            <p className="mb-3 text-[12px] text-muted-foreground">
              Tasa de interés vigente (mensual):{" "}
              <strong className="text-foreground">{(summary.loanInterestRate * 100).toFixed(2)}%</strong> · Tasa de ahorros:{" "}
              <strong className="text-foreground">{(summary.savingsInterestRate * 100).toFixed(2)}%</strong>
            </p>
            {summary.creditApplications.length === 0 ? (
              <ActaEmpty text="Sin solicitudes de préstamo." />
            ) : (
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (c) => formatName(c.user) },
                  {
                    key: "detalle",
                    header: "Detalle",
                    render: (c) =>
                      `${formatCurrency(c.amount)}${c.loan?.initalInstallments ? ` · ${c.loan.initalInstallments} meses` : ""}${c.loan?.loanType?.name ? ` · ${c.loan.loanType.name}` : ""}`,
                  },
                  { key: "estado", header: "Estado", align: "right", render: (c) => creditStatusLabel(c.status) },
                ]}
                rows={summary.creditApplications}
              />
            )}
          </ActaSection>

          {/* VIII. Acuerdos finales */}
          <ActaSection numeral="VIII" title="Acuerdos finales">
            <ul className="text-[13px] space-y-1 list-disc pl-5 text-foreground/90">
              <li>Se dio por finalizada la reunión{run.endAt ? ` a las ${fmtTimeShort(run.endAt)}` : ""} del mismo día.</li>
              <li>Todos los presentes firmaron en señal de conformidad.</li>
            </ul>
          </ActaSection>

          <ActaClosing timeLabel={run.endAt ? fmtTimeShort(run.endAt) : fmtTimeShort(run.startAt)} />
          <ActaConfirmation confirmed={false} />
        </ActaPaper>
      </CardContent>
    </Card>
  );
}
