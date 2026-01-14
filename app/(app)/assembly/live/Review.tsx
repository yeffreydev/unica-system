"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, ListChecks, Calendar, MapPin, Download } from "lucide-react";

const ActaSection: React.FC = () => {
  return (
    <Card className="border">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold">Acta de Reunión</CardTitle>
            <CardDescription className="text-sm">
              Registro oficial de acuerdos y decisiones
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Información de la reunión */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Fecha:</span>
            <span className="font-medium">25 de Septiembre, 2025</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Lugar:</span>
            <span className="font-medium">Sala de juntas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Horario:</span>
            <span className="font-medium">07:00 - 22:13</span>
          </div>
        </div>

        {/* Puntos tratados */}
        <div className="space-y-5">
          {/* 1. Multas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <span className="text-muted-foreground">1.</span>
              Multas
            </h3>
            <div className="ml-5 space-y-2">
              <div className="flex justify-between items-center text-sm pb-2 border-b">
                <span><span className="font-medium">Gino Azañay Dávila</span> — Inasistencia</span>
                <span className="font-semibold">S/ 5.00</span>
              </div>
              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground">Total recaudado: <span className="font-semibold text-foreground">S/ 5.00</span></span>
              </div>
            </div>
          </div>

          {/* 2. Compra de acciones */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <span className="text-muted-foreground">2.</span>
              Compra de acciones
            </h3>
            <div className="ml-5 space-y-2">
              <div className="flex justify-between items-center text-sm pb-2 border-b">
                <span><span className="font-medium">José Chión Ayay</span> — 10 acciones</span>
                <span className="font-semibold">S/ 100.00</span>
              </div>
              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground">Total recaudado: <span className="font-semibold text-foreground">S/ 100.00</span></span>
              </div>
            </div>
          </div>

          {/* 3. Recuperación de préstamos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <span className="text-muted-foreground">3.</span>
              Recuperación de préstamos
            </h3>
            <div className="ml-5 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Socio</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Interés</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Capital</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">José Chión Ayay</td>
                    <td className="text-right py-2">S/ 0.30</td>
                    <td className="text-right py-2">S/ 28.20</td>
                    <td className="text-right py-2 font-medium">S/ 28.50</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">José Chión Ayay</td>
                    <td className="text-right py-2">S/ 1.10</td>
                    <td className="text-right py-2">S/ 50.00</td>
                    <td className="text-right py-2 font-medium">S/ 51.10</td>
                  </tr>
                  <tr className="bg-muted/50 font-medium">
                    <td className="py-2">Totales</td>
                    <td className="text-right py-2">S/ 1.40</td>
                    <td className="text-right py-2">S/ 78.20</td>
                    <td className="text-right py-2">S/ 79.60</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-2 text-sm">
                <span className="text-muted-foreground">Total recaudado: <span className="font-semibold text-foreground">S/ 79.60</span></span>
              </div>
            </div>
          </div>

          {/* 4. Nuevos préstamos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <span className="text-muted-foreground">4.</span>
              Otorgamiento de nuevos préstamos
            </h3>
            <div className="ml-5 border-l-2 border-muted pl-4 text-sm space-y-1">
              <p><span className="font-medium">José Chión Ayay</span> solicita un préstamo por <span className="font-semibold">S/ 60.00</span> a <span className="font-semibold">9 meses</span></p>
              <p className="text-muted-foreground">Modalidad: Cuota a rebajar al 1% de interés</p>
            </div>
          </div>

          {/* 5. Acuerdos finales */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <span className="text-muted-foreground">5.</span>
              Acuerdos finales
            </h3>
            <div className="ml-5 space-y-2 text-sm text-muted-foreground">
              <p>• Se dio por finalizada la reunión a las 22:13 del mismo día</p>
              <p>• Todos los presentes firmaron en señal de conformidad</p>
            </div>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="pt-6 border-t">
          <h3 className="font-semibold text-base mb-4">Resumen Financiero</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Multas</div>
              <div className="text-xl font-semibold">S/ 5.00</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Acciones</div>
              <div className="text-xl font-semibold">S/ 100.00</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Recuperación</div>
              <div className="text-xl font-semibold">S/ 79.60</div>
            </div>
            <div className="space-y-1 md:border-l md:pl-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total</div>
              <div className="text-2xl font-bold">S/ 184.60</div>
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
      <Card className="border">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <ListChecks className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg font-semibold">Agenda de la Reunión</CardTitle>
              <CardDescription className="text-sm">
                Cronograma de actividades programadas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-3">
            {agendaItems.map((item, index) => (
              <div key={index} className="flex gap-4 pb-3 border-b last:border-b-0 last:pb-0">
                <div className="flex-shrink-0 w-14 pt-0.5">
                  <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <span className="text-xs text-muted-foreground">({item.duration})</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Acta Section */}
      <ActaSection />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}