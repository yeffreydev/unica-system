"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, MapPin } from "lucide-react";

export default function Docs() {
  return (
    <div className="flex flex-col gap-4">
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
            {/* 1. Lectura de agenda y acta anterior */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">1.</span>
                Lectura de agenda y acta anterior
              </h3>
              <div className="ml-5 space-y-2 text-sm text-muted-foreground">
                <p>Se realizó la lectura de la agenda del día y del acta de la reunión anterior.</p>
              </div>
            </div>

            {/* 2. Pagos de tardanzas y faltas */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">2.</span>
                Pagos de tardanzas y faltas
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

            {/* 3. Compra de acciones */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">3.</span>
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

            {/* 4. Pago de capital e intereses de las cuotas de un socio */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">4.</span>
                Pago de capital e intereses de las cuotas de un socio
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

            {/* 5. Operaciones realizadas */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">5.</span>
                Operaciones realizadas
              </h3>
              <div className="ml-5 space-y-2 text-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Depósito realizado</span>
                  <span className="font-medium">Por: José Chión Ayay</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Retiro de fondos</span>
                  <span className="font-medium">Por: Gino Azañay Dávila</span>
                </div>
              </div>
            </div>

            {/* 6. Aplicación y aprobación de créditos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">6.</span>
                Aplicación y aprobación de créditos
              </h3>
              <div className="ml-5 border-l-2 border-muted pl-4 text-sm space-y-1">
                <p><span className="font-medium">José Chión Ayay</span> solicita un préstamo por <span className="font-semibold">S/ 60.00</span> a <span className="font-semibold">9 meses</span></p>
                <p className="text-muted-foreground">Modalidad: Cuota a rebajar al 1% de interés</p>
                <p className="text-muted-foreground">Aprobado por la asamblea.</p>
              </div>
            </div>

            {/* 7. Arqueo de caja */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">7.</span>
                Arqueo de caja
              </h3>
              <div className="ml-5 space-y-2 text-sm text-muted-foreground">
                <p>Se realizó el arqueo de caja, quedando un monto de <span className="font-semibold text-foreground">S/ 500.00</span></p>
              </div>
            </div>

            {/* 8. Confirmación del acta */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span className="text-muted-foreground">8.</span>
                Confirmación del acta
              </h3>
              <div className="ml-5 space-y-2 text-sm text-muted-foreground">
                <p>El acta fue leída y aprobada por todos los presentes.</p>
                <p>Se confirma que todos los acuerdos y decisiones tomadas durante la reunión han sido registrados correctamente.</p>
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
    </div>
  );
}
