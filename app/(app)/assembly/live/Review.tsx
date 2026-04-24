"use client";
import { JSX, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ListChecks, Calendar, MapPin, Download, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAssembly } from "../AssemblyContext";
import { apiGetAssemblyActaSummary } from "../api";
import { ParticipantStatus } from "@/constants";
import { formatCurrency } from "@/lib/utils";

type ActaSummary = {
  run: {
    id: string;
    topic: string;
    startAt: string;
    endAt: string | null;
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
  return `${u.lastname ?? ""}, ${u.name ?? ""}`.trim();
}

function formatTime(d?: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_ICON: Record<string, { icon: JSX.Element; className: string }> = {
  attended: { icon: <CheckCircle2 className="w-3 h-3" />, className: "text-emerald-600 dark:text-emerald-400" },
  late: { icon: <Clock className="w-3 h-3" />, className: "text-amber-600 dark:text-amber-400" },
  absent: { icon: <XCircle className="w-3 h-3" />, className: "text-red-600 dark:text-red-400" },
};

export default function Review() {
  const { assembly } = useAssembly();
  const [summary, setSummary] = useState<ActaSummary | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4">
      {/* Agenda */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Agenda de la Reunión</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {agendaItems.length} puntos
            </Badge>
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
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium">
                      {item.duration}
                    </Badge>
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
      <div className="flex justify-end gap-3">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Download className="h-3.5 w-3.5" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}

function ActaContent({ summary }: { summary: ActaSummary }) {
  const run = summary.run;
  const attended = run.participants.filter(p => p.status === "attended");
  const late = run.participants.filter(p => p.status === "late");
  const absent = run.participants.filter(p => p.status === "absent");

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Acta de Reunión</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-medium">Registro oficial</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap pb-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">{formatDate(run.startAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">Sala de juntas</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <span className="text-muted-foreground">Horario:</span>
            <span className="font-medium">{formatTime(run.startAt)}{run.endAt ? ` - ${formatTime(run.endAt)}` : ""}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-5 pb-5 space-y-4">
          {/* 1. Control de asistencia */}
          <Section number={1} title="Control de asistencia">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Pill color="emerald" label={`Asistieron: ${attended.length}`} />
              <Pill color="amber" label={`Tardanzas: ${late.length}`} />
              <Pill color="red" label={`Ausentes: ${absent.length}`} />
              <Pill color="slate" label={`Total: ${run.participants.length}`} icon={<Users className="w-3 h-3" />} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <AttendanceGroup title="Asistentes" items={attended} color="text-emerald-700 dark:text-emerald-400" />
              <AttendanceGroup title="Tardanzas" items={late} color="text-amber-700 dark:text-amber-400" />
              <AttendanceGroup title="Ausentes" items={absent} color="text-red-700 dark:text-red-400" showAbsences />
            </div>
          </Section>

          {/* 2. Multas */}
          <Section number={2} title="Multas">
            {summary.fines.length === 0 ? (
              <EmptyRow text="Sin multas registradas" />
            ) : (
              <>
                <div className="space-y-1.5">
                  {summary.fines.map(f => (
                    <div key={f.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0">
                      <span>
                        <span className="font-medium">{formatName(f.user)}</span>{" "}
                        — {f.tag === "LATE_FEE" ? "Tardanza" : f.tag === "ABSENCE_FEE" ? "Inasistencia" : f.description}
                      </span>
                      <span className="font-semibold tabular-nums">{formatCurrency(f.amount)}</span>
                    </div>
                  ))}
                </div>
                <TotalRow total={summary.finesTotal} />
              </>
            )}
          </Section>

          {/* 3. Compra de acciones */}
          <Section number={3} title="Compra de acciones">
            {summary.shares.length === 0 ? (
              <EmptyRow text="Sin compras de acciones" />
            ) : (
              <>
                <div className="space-y-1.5">
                  {summary.shares.map(s => (
                    <div key={s.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0">
                      <span>
                        <span className="font-medium">{formatName(s.user)}</span> — {s.quantity} acciones
                      </span>
                      <span className="font-semibold tabular-nums">{formatCurrency(s.quantity * s.price)}</span>
                    </div>
                  ))}
                </div>
                <TotalRow total={summary.sharesTotal} />
              </>
            )}
          </Section>

          {/* 4. Recuperación de préstamos */}
          <Section number={4} title="Recuperación de préstamos">
            {summary.payments.length === 0 ? (
              <EmptyRow text="Sin pagos de préstamos" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-xs text-muted-foreground">Socio</th>
                      <th className="text-right py-2 font-medium text-xs text-muted-foreground">Interés</th>
                      <th className="text-right py-2 font-medium text-xs text-muted-foreground">Capital</th>
                      <th className="text-right py-2 font-medium text-xs text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.payments.map(p => (
                      <tr key={p.id} className="border-b">
                        <td className="py-2 text-sm">{formatName(p.user)}</td>
                        <td className="text-right py-2 tabular-nums text-purple-600 dark:text-purple-400">{formatCurrency(Number(p.interest ?? 0))}</td>
                        <td className="text-right py-2 tabular-nums text-blue-600 dark:text-blue-400">{formatCurrency(p.amount)}</td>
                        <td className="text-right py-2 font-medium tabular-nums">{formatCurrency(p.amount + Number(p.interest ?? 0))}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-medium">
                      <td className="py-2 text-sm">Totales</td>
                      <td className="text-right py-2 tabular-nums">{formatCurrency(summary.paymentsInterest)}</td>
                      <td className="text-right py-2 tabular-nums">{formatCurrency(summary.paymentsCapital)}</td>
                      <td className="text-right py-2 tabular-nums">{formatCurrency(summary.paymentsTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* 5. Ahorros del mes */}
          <Section number={5} title="Ahorros recibidos en la asamblea">
            {summary.savingsDeposits.length === 0 ? (
              <EmptyRow text="Sin depósitos registrados" />
            ) : (
              <>
                <div className="space-y-1.5">
                  {summary.savingsDeposits.map(d => (
                    <div key={d.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0">
                      <span className="font-medium">{formatName(d.user)}</span>
                      <span className="font-semibold tabular-nums">{formatCurrency(d.amount)}</span>
                    </div>
                  ))}
                </div>
                <TotalRow total={summary.savingsDepositsTotal} />
              </>
            )}
          </Section>

          {/* 6. Otros ingresos */}
          <Section number={6} title="Otros ingresos (comisiones, donaciones, etc.)">
            {summary.otherIncomes.length === 0 ? (
              <EmptyRow text="Sin otros ingresos" />
            ) : (
              <>
                <div className="space-y-1.5">
                  {summary.otherIncomes.map(o => (
                    <div key={o.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{formatName(o.user)}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {o.tag === "FINE" ? "Multa"
                            : o.tag === "DONATION" ? "Donación"
                            : o.tag === "UNCLASSIFIED" ? "Sin clasificar"
                            : "Ingreso"} · {o.description}
                        </div>
                      </div>
                      <span className="font-semibold tabular-nums ml-3">{formatCurrency(o.amount)}</span>
                    </div>
                  ))}
                </div>
                <TotalRow total={summary.otherIncomesTotal} />
              </>
            )}
          </Section>

          {/* 7. Otorgamiento de nuevos préstamos */}
          <Section number={7} title="Otorgamiento de nuevos préstamos">
            <div className="mb-3 p-2.5 rounded-md bg-muted/40 border text-xs">
              <span className="text-muted-foreground">Tasa de interés vigente (mensual): </span>
              <strong className="text-foreground">{(summary.loanInterestRate * 100).toFixed(2)}%</strong>
              <span className="text-muted-foreground"> · Tasa de ahorros: </span>
              <strong className="text-foreground">{(summary.savingsInterestRate * 100).toFixed(2)}%</strong>
            </div>
            {summary.creditApplications.length === 0 ? (
              <EmptyRow text="Sin solicitudes de préstamo" />
            ) : (
              <div className="space-y-2">
                {summary.creditApplications.map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-muted/30 text-sm space-y-1">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p>
                          <span className="font-medium">{formatName(c.user)}</span> solicita{" "}
                          <span className="font-semibold">{formatCurrency(c.amount)}</span>
                          {c.loan?.initalInstallments && <> a <span className="font-semibold">{c.loan.initalInstallments} meses</span></>}
                        </p>
                        {c.loan?.loanType?.name && (
                          <p className="text-xs text-muted-foreground">
                            Modalidad: {c.loan.loanType.name} · Tasa aplicada {((c.loan.interestRate ?? summary.loanInterestRate) * 100).toFixed(2)}%
                          </p>
                        )}
                        {c.purpose && <p className="text-xs text-muted-foreground">Propósito: {c.purpose}</p>}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          c.status === "approved" ? "border-emerald-300 text-emerald-700 dark:text-emerald-400"
                            : c.status === "rejected" ? "border-red-300 text-red-700 dark:text-red-400"
                            : "border-amber-300 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {c.status === "approved" ? "Aprobado" : c.status === "rejected" ? "Rechazado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* 8. Acuerdos finales */}
          <Section number={8} title="Acuerdos finales">
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>• Se dio por finalizada la reunión{run.endAt ? ` a las ${formatTime(run.endAt)}` : ""} del mismo día.</p>
              <p>• Todos los presentes firmaron en señal de conformidad.</p>
            </div>
          </Section>

          {/* Resumen */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-sm mb-3">Resumen Financiero</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <SummaryPill label="Multas" value={summary.finesTotal} />
              <SummaryPill label="Acciones" value={summary.sharesTotal} />
              <SummaryPill label="Recuperación" value={summary.paymentsTotal} />
              <SummaryPill label="Ahorros" value={summary.savingsDepositsTotal} />
              <SummaryPill label="Otros ingresos" value={summary.otherIncomesTotal} />
              <div className="h-4 w-px bg-border mx-1" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Total recaudado: {formatCurrency(summary.totalCollected)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border bg-card space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
          {number}
        </span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="ml-8">{children}</div>
    </div>
  );
}

function TotalRow({ total }: { total: number }) {
  return (
    <div className="flex justify-end mt-2 text-xs">
      <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span></span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground italic">{text}</p>;
}

function Pill({ color, label, icon }: { color: "emerald" | "amber" | "red" | "slate"; label: string; icon?: React.ReactNode }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
    red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
    slate: "bg-muted/50 text-foreground border",
  };
  return (
    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border ${map[color]}`}>
      {icon}
      {label}
    </span>
  );
}

function AttendanceGroup({
  title,
  items,
  color,
  showAbsences,
}: {
  title: string;
  items: ActaSummary["run"]["participants"];
  color: string;
  showAbsences?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-md border p-3 bg-muted/20">
      <div className={`text-[11px] font-semibold mb-1.5 ${color}`}>{title}</div>
      <ul className="space-y-0.5">
        {items.map(p => (
          <li key={p.id} className="text-xs flex items-center justify-between gap-2">
            <span className="truncate">{formatName(p.user)}</span>
            {showAbsences && (p.absencesCount ?? 0) > 0 && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                {p.absencesCount} {p.absencesCount === 1 ? "falta" : "faltas"}
                {(p.consecutiveAbsencesCount ?? 0) > 0 ? ` · ${p.consecutiveAbsencesCount} consec.` : ""}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
