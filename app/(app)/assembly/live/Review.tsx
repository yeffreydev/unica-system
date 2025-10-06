"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileText, ListChecks, Users, Calendar, MapPin } from "lucide-react";

const ActaSection: React.FC = () => {
  return (
    <Card className="shadow-lg border-border bg-gradient-to-br from-card to-muted">
      <CardHeader className="pb-6 bg-gradient-to-r from-primary to-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary-foreground/20 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Acta de Reunión</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Registro oficial de acuerdos y decisiones
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Información de la reunión */}
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">Fecha:</span>
              <span>25 de Septiembre, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">Hora:</span>
              <span>07:00 - 22:13</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">Lugar:</span>
              <span>Sala de juntas</span>
            </div>
          </div>
        </div>

        {/* Puntos tratados */}
        <div className="space-y-4">
          {/* 1. Multas */}
          <div className="bg-card p-4 rounded-lg border-border shadow-sm">
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-sm font-bold">1</span>
              Multas
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-destructive/5 rounded">
                <span><strong>Gino Azañay Dávila:</strong> Inasistencia</span>
                <span className="font-bold text-destructive">S/ 5.00</span>
              </div>
              <div className="text-right">
                <span className="bg-destructive/10 px-3 py-1 rounded-full text-sm font-semibold">
                  Total recaudado: S/ 5.00
                </span>
              </div>
            </div>
          </div>

          {/* 2. Compra de acciones */}
          <div className="bg-card p-4 rounded-lg border-border shadow-sm">
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-bold">2</span>
              Compra de acciones
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span><strong>José Chión Ayay:</strong> 10 acciones</span>
                <span className="font-bold text-green-700">S/ 100.00</span>
              </div>
              <div className="text-right">
                <span className="bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
                  Total recaudado: S/ 100.00
                </span>
              </div>
            </div>
          </div>

          {/* 3. Recuperación de préstamos */}
          <div className="bg-card p-4 rounded-lg border-border shadow-sm">
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-bold">3</span>
              Recuperación de préstamos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/5 border-b">
                    <th className="text-left p-2 font-medium">Socio</th>
                    <th className="text-right p-2 font-medium">Interés (S/)</th>
                    <th className="text-right p-2 font-medium">Capital (S/)</th>
                    <th className="text-right p-2 font-medium">Total (S/)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">José Chión Ayay</td>
                    <td className="text-right p-2">0.30</td>
                    <td className="text-right p-2">28.20</td>
                    <td className="text-right p-2 font-semibold">28.50</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">José Chión Ayay</td>
                    <td className="text-right p-2">1.10</td>
                    <td className="text-right p-2">50.00</td>
                    <td className="text-right p-2 font-semibold">51.10</td>
                  </tr>
                  <tr className="bg-primary/5 font-bold">
                    <td className="p-2">Totales</td>
                    <td className="text-right p-2">1.40</td>
                    <td className="text-right p-2">78.20</td>
                    <td className="text-right p-2">79.60</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-right mt-2">
              <span className="bg-primary/10 px-3 py-1 rounded-full text-sm font-semibold">
                Total recaudado: S/ 79.60
              </span>
            </div>
          </div>

          {/* 4. Nuevos préstamos */}
          <div className="bg-card p-4 rounded-lg border-border shadow-sm">
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-bold">4</span>
              Otorgamiento de nuevos préstamos
            </h3>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p><strong>José Chión Ayay</strong> solicita un préstamo por <strong>S/ 60.00</strong> a <strong>9 meses</strong></p>
              <p className="text-sm text-muted-foreground mt-1">Modalidad: Cuota a rebajar al 1% de interés</p>
            </div>
          </div>

          {/* 5. Acuerdos finales */}
          <div className="bg-card p-4 rounded-lg border-border shadow-sm">
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-sm font-bold">5</span>
              Acuerdos finales
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Se dio por finalizada la reunión a las 22:13 del mismo día
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Todos los presentes firmaron en señal de conformidad
              </p>
            </div>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="bg-gradient-to-r from-green-50 to-primary/5 p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-lg text-foreground mb-3">Resumen Financiero</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-card p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-destructive">S/ 5.00</div>
              <div className="text-sm text-muted-foreground">Multas</div>
            </div>
            <div className="bg-card p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">S/ 100.00</div>
              <div className="text-sm text-muted-foreground">Acciones</div>
            </div>
            <div className="bg-card p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary">S/ 79.60</div>
              <div className="text-sm text-muted-foreground">Recuperación</div>
            </div>
            <div className="bg-card p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-foreground">S/ 184.60</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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


  return (
    <div className='flex flex-col gap-8 max-w-6xl mx-auto p-4'>
      {/* Agenda Section */}
      <Card className="shadow-lg border-border bg-gradient-to-br from-card to-muted">
        <CardHeader className="pb-6 bg-gradient-to-r from-primary to-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary-foreground/20 shadow-sm">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Agenda Detallada</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Guía cronológica de la sesión
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {agendaItems.map((item, index) => (
              <div key={index} className="p-4 rounded-lg border-l-4 border-primary bg-primary/5 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                        {item.time}
                      </span>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-medium">Estado de la reunión:</span>
              <span className="text-green-600 font-semibold">✓ Completada exitosamente</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      {/* Acta Section */}
      <ActaSection />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <Button variant="outline" className="text-primary-foreground flex bg-primary items-center gap-2">
          <FileText className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}