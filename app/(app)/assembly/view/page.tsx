"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileCheck, FileText, FileX, Loader2 } from "lucide-react";
import { apiGetActaByRun } from "../api";
import { formatCurrency } from "@/lib/utils";
import { downloadActaPdf } from "../acta-pdf";
import {
  ActaPaper,
  ActaTitle,
  ActaSection,
  ActaTable,
  ActaClosing,
  ActaConfirmation,
  participantStatusLabel,
  runStatusLabel,
  creditStatusLabel,
  fmtDateLong,
  fmtTimeShort,
} from "../acta-theme";

type ActaResponse = {
  confirmed?: boolean;
  generatedAt?: string | null;
  content?: any;
  scheduleRunId?: string;
};

const userLabel = (u: any) => (u ? `${u.lastname ?? ""}, ${u.name ?? ""}`.replace(/^,\s*|,\s*$/g, "") || "—" : "—");

function AssemblyViewInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [data, setData] = useState<ActaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
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
  const participants = run?.participants ?? [];

  const startAt = run?.startAt ? new Date(run.startAt) : null;
  const confirmed = !!data?.confirmed;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap print:hidden">
        <Button asChild variant="outline" size="sm">
          <Link href="/assembly/list"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Link>
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {confirmed ? "Documento oficial confirmado" : "Documento sin confirmar"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadActaPdf(data ?? {}, run ?? { id, startAt })}
            disabled={!data}
          >
            <FileText className="w-4 h-4 mr-1" /> Descargar PDF
          </Button>
        </div>
      </div>

      <Card className="border-foreground/15">
        <CardContent className="px-5 sm:px-10 py-8 sm:py-10">
          <ActaPaper>
            <ActaTitle
              subtitle={run?.topic || "Asamblea General de Socios"}
              meta={[
                { label: "Fecha", value: startAt ? fmtDateLong(startAt) : "—" },
                { label: "Hora", value: startAt ? fmtTimeShort(startAt) : "—" },
                ...(run?.place ? [{ label: "Lugar", value: String(run.place) }] : []),
                { label: "Estado", value: runStatusLabel(run?.status) },
                { label: "Total recaudado", value: formatCurrency(content.totalCollected ?? 0) },
              ]}
              badge={
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] uppercase tracking-wide border rounded-sm ${confirmed ? "border-emerald-700 text-emerald-700 dark:text-emerald-400" : "border-amber-700 text-amber-700 dark:text-amber-500"}`}>
                  {confirmed ? <FileCheck className="w-3 h-3" /> : <FileX className="w-3 h-3" />}
                  {confirmed ? "Acta confirmada" : "Acta sin confirmar"}
                </span>
              }
            />

            <ActaSection numeral="I" title="Control de asistencia" right={`${participants.length} convocados`}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (p) => (p.user ? userLabel(p.user) : (p.name ?? "—")) },
                  { key: "estado", header: "Estado", align: "right", render: (p) => participantStatusLabel(p.status) },
                ]}
                rows={participants}
                empty="Sin participantes registrados."
              />
            </ActaSection>

            <ActaSection numeral="II" title="Compra de acciones" right={formatCurrency(content.sharesTotal ?? 0)}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (s) => userLabel(s.user) },
                  { key: "cant", header: "Cantidad", align: "right", render: (s) => s.quantity ?? 0 },
                  { key: "precio", header: "Precio", align: "right", render: (s) => formatCurrency(s.price ?? 0) },
                  { key: "total", header: "Total", align: "right", render: (s) => formatCurrency((s.quantity ?? 0) * (s.price ?? 0)) },
                ]}
                rows={shares}
                totals={{ socio: "Total", total: formatCurrency(content.sharesTotal ?? 0) }}
                empty="Sin compras de acciones."
              />
            </ActaSection>

            <ActaSection numeral="III" title="Recuperación de préstamos">
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (p) => userLabel(p.user) },
                  { key: "interes", header: "Interés", align: "right", render: (p) => formatCurrency(Number(p.interest ?? 0)) },
                  { key: "capital", header: "Capital", align: "right", render: (p) => formatCurrency(p.amount ?? 0) },
                  { key: "total", header: "Total", align: "right", render: (p) => formatCurrency((p.amount ?? 0) + Number(p.interest ?? 0)) },
                ]}
                rows={payments}
                totals={{
                  socio: "Totales",
                  interes: formatCurrency(content.paymentsInterest ?? 0),
                  capital: formatCurrency(content.paymentsCapital ?? 0),
                  total: formatCurrency((content.paymentsCapital ?? 0) + (content.paymentsInterest ?? 0)),
                }}
                empty="Sin pagos de préstamos."
              />
            </ActaSection>

            <ActaSection numeral="IV" title="Depósitos de ahorro" right={formatCurrency(content.savingsDepositsTotal ?? 0)}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (d) => userLabel(d.user) },
                  { key: "monto", header: "Monto", align: "right", render: (d) => formatCurrency(d.amount ?? 0) },
                ]}
                rows={savingsDeposits}
                totals={{ socio: "Total", monto: formatCurrency(content.savingsDepositsTotal ?? 0) }}
                empty="Sin depósitos registrados."
              />
            </ActaSection>

            <ActaSection numeral="V" title="Pagos a ahorristas">
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (p) => userLabel(p.user) },
                  { key: "desc", header: "Descripción", render: (p) => p.description ?? "—" },
                  { key: "monto", header: "Monto", align: "right", render: (p) => formatCurrency(p.amount ?? 0) },
                ]}
                rows={savingsPayouts}
                empty="Sin pagos a ahorristas."
              />
            </ActaSection>

            <ActaSection numeral="VI" title="Multas" right={formatCurrency(content.finesTotal ?? 0)}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (f) => userLabel(f.user) || (f.description ?? "—") },
                  { key: "desc", header: "Descripción", render: (f) => f.description ?? "—" },
                  { key: "monto", header: "Monto", align: "right", render: (f) => formatCurrency(f.amount ?? 0) },
                ]}
                rows={fines}
                totals={{ socio: "Total", monto: formatCurrency(content.finesTotal ?? 0) }}
                empty="Sin multas registradas."
              />
            </ActaSection>

            <ActaSection numeral="VII" title="Otros ingresos" right={formatCurrency(content.otherIncomesTotal ?? 0)}>
              <ActaTable
                columns={[
                  { key: "desc", header: "Descripción", render: (o) => o.description ?? "—" },
                  { key: "monto", header: "Monto", align: "right", render: (o) => formatCurrency(o.amount ?? 0) },
                ]}
                rows={otherIncomes}
                totals={{ desc: "Total", monto: formatCurrency(content.otherIncomesTotal ?? 0) }}
                empty="Sin otros ingresos."
              />
            </ActaSection>

            <ActaSection numeral="VIII" title="Solicitudes de crédito">
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (c) => userLabel(c.user) },
                  { key: "monto", header: "Monto", align: "right", render: (c) => formatCurrency(c.amount ?? 0) },
                  { key: "prop", header: "Propósito", render: (c) => c.purpose ?? "—" },
                  { key: "estado", header: "Estado", align: "right", render: (c) => creditStatusLabel(c.status) },
                ]}
                rows={creditApplications}
                empty="Sin solicitudes de crédito."
              />
            </ActaSection>

            <ActaClosing timeLabel={run?.endAt ? fmtTimeShort(run.endAt) : startAt ? fmtTimeShort(startAt) : undefined} />
            <ActaConfirmation confirmed={confirmed} />
          </ActaPaper>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssemblyViewPage() {
  return (
    <Suspense fallback={<div className="py-10 flex justify-center text-muted-foreground gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>}>
      <AssemblyViewInner />
    </Suspense>
  );
}
