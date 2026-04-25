"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Eye, FileCheck, FileX, Loader2 } from "lucide-react";
import { apiListAssemblyRuns, apiSetActaConfirmation } from "../api";
import { sileo } from "sileo";

type RunRow = Awaited<ReturnType<typeof apiListAssemblyRuns>>[number];

export default function AssemblyListPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
                    <Link href={`/assembly/view/${r.id}`}><Eye className="w-3.5 h-3.5 mr-1" /> Ver</Link>
                  </Button>
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
