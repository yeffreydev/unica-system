"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileText, ListChecks, Users } from "lucide-react";

export default function Review() {
  const agendaItems: { time: string; title: string; detail: string }[] = [
    { time: "07:00", title: "Apertura y quórum", detail: "Verificación de quórum y saludo de bienvenida." },
    { time: "07:10", title: "Lectura de acta anterior", detail: "Resumen y aprobación del acta previa." },
    { time: "07:25", title: "Agenda del día", detail: "Presentación de puntos a tratar: ahorros, créditos, social y varios." },
    { time: "07:35", title: "Aportes y compras de acciones", detail: "Registro de compras y actualización de capital social." },
    { time: "07:50", title: "Ahorros e intereses", detail: "Recepción de depósitos y actualización de saldos." },
    { time: "08:10", title: "Solicitudes de crédito", detail: "Evaluación rápida y acuerdos de aprobación." },
    { time: "08:35", title: "Acuerdos y cierre", detail: "Revisión de acuerdos, firma y cierre oficial." },
  ];

  const previousMinutes = {
    date: "10/08/2025",
    attendees: 42,
    quorum: true,
    summary:
      "Se verificó quórum, se aprobaron 2 créditos (S/ 3,500 y S/ 2,000), se registraron aportes por S/ 3,200 y ahorros por S/ 14,950. Se acordó revisar reglamento interno en la siguiente asamblea.",
    agreements: [
      "Aprobación de acta anterior por unanimidad.",
      "Compra de 320 acciones en total.",
      "Aprobación de 2 créditos (plazo 6 y 9 meses, tasas preferenciales).",
      "Revisión de reglamento interno en próxima sesión.",
    ],
    signers: ["Presidenta: M. Gutiérrez", "Secretario: L. Ramos"],
  };

  return (
    <div className="space-y-6">
      {/* Agenda Detallada */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Agenda detallada</CardTitle>
              <CardDescription>Guía cronológica de la sesión</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agendaItems.map((item, idx) => (
              <div key={idx} className="rounded-md border p-3 bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {item.time}
                  </div>
                  <div className="text-xs text-muted-foreground">Bloque {idx + 1}</div>
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acta anterior (resumen) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Acta anterior – Resumen</CardTitle>
              <CardDescription>Detalles relevantes para verificación</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-md border p-3 bg-card">
              <div className="text-[11px] text-muted-foreground">Fecha</div>
              <div className="text-sm font-medium text-foreground">{previousMinutes.date}</div>
            </div>
            <div className="rounded-md border p-3 bg-card">
              <div className="text-[11px] text-muted-foreground">Asistentes</div>
              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> {previousMinutes.attendees}
              </div>
            </div>
            <div className="rounded-md border p-3 bg-card">
              <div className="text-[11px] text-muted-foreground">Quórum</div>
              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${previousMinutes.quorum ? 'text-green-600' : 'text-red-600'}`} />
                {previousMinutes.quorum ? 'Alcanzado' : 'No alcanzado'}
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3 bg-muted/30">
            <div className="text-[11px] text-muted-foreground">Resumen</div>
            <div className="text-sm text-foreground leading-relaxed">
              {previousMinutes.summary}
            </div>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acuerdos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousMinutes.agreements.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{a}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-md border p-3 bg-card">
            <div className="text-[11px] text-muted-foreground">Firmantes</div>
            <div className="text-sm text-foreground flex flex-wrap gap-2">
              {previousMinutes.signers.map((s, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-muted text-foreground text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <Separator />
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => window.print?.()}>Imprimir</Button>
            <Button onClick={() => console.log("Descargar acta (simulado)")}>Descargar acta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


