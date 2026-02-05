import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Settings } from "lucide-react";
import Link from "next/link";

export function EmptyAssemblyState() {
  return (
    <div className="flex items-center justify-center min-h-[600px] px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">No existe una asamblea configurada</CardTitle>
          <CardDescription className="text-base">
            Para comenzar a gestionar las asambleas generales de la cooperativa, 
            necesitas configurar primero los parámetros de programación.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información sobre qué se necesita configurar */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Frecuencia</h3>
                <p className="text-sm text-muted-foreground">
                  Define cada cuánto tiempo se realizarán las asambleas
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Horario</h3>
                <p className="text-sm text-muted-foreground">
                  Establece el día y hora de las reuniones
                </p>
              </div>
            </div>
          </div>

          {/* Botón de acción principal */}
          <div className="pt-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/settings/assembly" className="gap-2">
                <Settings className="w-5 h-5" />
                Ir a Configuración de Asamblea
              </Link>
            </Button>
          </div>

          {/* Nota adicional */}
          <div className="pt-2 text-center">
            <p className="text-sm text-muted-foreground">
              Una vez configurada, podrás gestionar y realizar el seguimiento de todas las 
              asambleas desde esta página.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
