"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ListChecks, Calendar, MapPin, Download } from "lucide-react";

const ActaSection: React.FC = () => {
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

        {/* Meeting Info Pills */}
        <div className="flex items-center gap-2 flex-wrap pb-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">25 Sep, 2025</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">Sala de juntas</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <span className="text-muted-foreground">Horario:</span>
            <span className="font-medium">07:00 - 22:13</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-5 pb-5 space-y-4">
          {/* 1. Multas */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">1</span>
              <h3 className="font-semibold text-sm">Multas</h3>
            </div>
            <div className="ml-8 space-y-2">
              <div className="flex justify-between items-center text-sm pb-2 border-b">
                <span><span className="font-medium">Gino Azañay Dávila</span> — Inasistencia</span>
                <span className="font-semibold tabular-nums">S/ 5.00</span>
              </div>
              <div className="flex justify-end text-xs">
                <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">S/ 5.00</span></span>
              </div>
            </div>
          </div>

          {/* 2. Compra de acciones */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">2</span>
              <h3 className="font-semibold text-sm">Compra de acciones</h3>
            </div>
            <div className="ml-8 space-y-2">
              <div className="flex justify-between items-center text-sm pb-2 border-b">
                <span><span className="font-medium">José Chión Ayay</span> — 10 acciones</span>
                <span className="font-semibold tabular-nums">S/ 100.00</span>
              </div>
              <div className="flex justify-end text-xs">
                <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">S/ 100.00</span></span>
              </div>
            </div>
          </div>

          {/* 3. Recuperación de préstamos */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">3</span>
              <h3 className="font-semibold text-sm">Recuperación de préstamos</h3>
            </div>
            <div className="ml-8 overflow-x-auto">
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
                  <tr className="border-b">
                    <td className="py-2 text-sm">José Chión Ayay</td>
                    <td className="text-right py-2 tabular-nums text-purple-600 dark:text-purple-400">S/ 0.30</td>
                    <td className="text-right py-2 tabular-nums text-blue-600 dark:text-blue-400">S/ 28.20</td>
                    <td className="text-right py-2 font-medium tabular-nums">S/ 28.50</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-sm">José Chión Ayay</td>
                    <td className="text-right py-2 tabular-nums text-purple-600 dark:text-purple-400">S/ 1.10</td>
                    <td className="text-right py-2 tabular-nums text-blue-600 dark:text-blue-400">S/ 50.00</td>
                    <td className="text-right py-2 font-medium tabular-nums">S/ 51.10</td>
                  </tr>
                  <tr className="bg-muted/30 font-medium">
                    <td className="py-2 text-sm">Totales</td>
                    <td className="text-right py-2 tabular-nums">S/ 1.40</td>
                    <td className="text-right py-2 tabular-nums">S/ 78.20</td>
                    <td className="text-right py-2 tabular-nums">S/ 79.60</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-2 text-xs">
                <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">S/ 79.60</span></span>
              </div>
            </div>
          </div>

          {/* 4. Nuevos préstamos */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">4</span>
              <h3 className="font-semibold text-sm">Otorgamiento de nuevos préstamos</h3>
            </div>
            <div className="ml-8 p-3 rounded-lg bg-muted/30 text-sm space-y-1">
              <p><span className="font-medium">José Chión Ayay</span> solicita un préstamo por <span className="font-semibold">S/ 60.00</span> a <span className="font-semibold">9 meses</span></p>
              <p className="text-xs text-muted-foreground">Modalidad: Cuota a rebajar al 1% de interés</p>
            </div>
          </div>

          {/* 5. Acuerdos finales */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">5</span>
              <h3 className="font-semibold text-sm">Acuerdos finales</h3>
            </div>
            <div className="ml-8 space-y-1.5 text-sm text-muted-foreground">
              <p>• Se dio por finalizada la reunión a las 22:13 del mismo día</p>
              <p>• Todos los presentes firmaron en señal de conformidad</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-sm mb-3">Resumen Financiero</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 text-xs">
                <span className="text-muted-foreground">Multas</span>
                <span className="font-bold tabular-nums">S/ 5.00</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 text-xs">
                <span className="text-muted-foreground">Acciones</span>
                <span className="font-bold tabular-nums">S/ 100.00</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 text-xs">
                <span className="text-muted-foreground">Recuperación</span>
                <span className="font-bold tabular-nums">S/ 79.60</span>
              </div>
              <div className="h-4 w-px bg-border mx-1" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Total: S/ 184.60</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Review() {
  const agendaItems: { duration: string; title: string; detail: string }[] = [
    { duration: "10min", title: "Apertura y quórum", detail: "Verificación de quórum y saludo de bienvenida." },
    { duration: "10min", title: "Lectura de acta anterior", detail: "Resumen y aprobación del acta previa." },
    { duration: "10min", title: "Agenda del día", detail: "Presentación de puntos a tratar: ahorros, créditos, social y varios." },
    { duration: "10min", title: "Aportes y compras de acciones", detail: "Registro de compras y actualización de capital social." },
    { duration: "10min", title: "Ahorros e intereses", detail: "Recepción de depósitos y actualización de saldos." },
    { duration: "10min", title: "Solicitudes de crédito", detail: "Evaluación rápida y acuerdos de aprobación." },
    { duration: "10min", title: "Acuerdos y cierre", detail: "Revisión de acuerdos, firma y cierre oficial." },
  ];

  return (
    <div className='flex flex-col gap-6 max-w-5xl mx-auto p-4'>
      {/* Agenda Section */}
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
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all"
              >
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

      {/* Acta Section */}
      <ActaSection />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Download className="h-3.5 w-3.5" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}
