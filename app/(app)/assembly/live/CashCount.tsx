"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function CashCount() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-wide text-[10px]">Paso 5</Badge>
            <div>
              <CardTitle className="text-base">Arqueo de Caja</CardTitle>
              <CardDescription>Resumen financiero de la sesión</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-md border bg-card">
              <div className="p-3 border-b">
                <div className="text-sm font-medium text-foreground">Saldos</div>
                <div className="text-xs text-muted-foreground">Cálculo del mes</div>
              </div>
              <div className="p-3">
                <Table className="w-full">
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">1. Saldo del mes anterior</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">2. Ingresos del mes</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">3. Saldo Bruto del Mes (2+1)</TableCell>
                      <TableCell className="text-right font-semibold">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">4. Egresos del Mes</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Saldo Neto del Mes (3-4)</TableCell>
                      <TableCell className="text-right font-semibold">S/. 100</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="rounded-md border bg-card">
              <div className="p-3 border-b">
                <div className="text-sm font-medium text-foreground">Arqueo de Caja</div>
                <div className="text-xs text-muted-foreground">Detalle de efectivo y bancos</div>
              </div>
              <div className="p-3">
                <Table className="w-full">
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">Valor Efectivo</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Depósitos en bancos/cooperativas</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Total</TableCell>
                      <TableCell className="text-right font-semibold">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Sobrante</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Faltante</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="rounded-md border bg-card">
              <div className="p-3 border-b">
                <div className="text-sm font-medium text-foreground">Acumulados</div>
                <div className="text-xs text-muted-foreground">Totales a la fecha</div>
              </div>
              <div className="p-3">
                <Table className="w-full">
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">Total de ingresos acumulados a la fecha</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Total de egresos acumulados a la fecha</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-md border p-3 bg-muted/40">
              <div className="text-[11px] text-muted-foreground">Abreviaturas</div>
              <ul className="mt-1 text-xs text-foreground space-y-1 list-disc pl-4">
                <li>A = Pagos de Capital Acumulado</li>
                <li>B = Préstamos Acumulados</li>
                <li>PV = Préstamo Vigente</li>
              </ul>
            </div>
            <div className="rounded-md border p-3 bg-muted/40 md:col-span-2">
              <div className="text-[11px] text-muted-foreground">Fórmulas</div>
              <ul className="mt-1 text-xs text-foreground space-y-1 list-disc pl-4">
                <li>3 = 1 + 2 (Saldo Bruto)</li>
                <li>Saldo Neto = Saldo Bruto - Egresos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


