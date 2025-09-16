import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { assemblySteps } from "../steps";

interface NextAssemblyCardProps {
  upcomingDateLabel: string;
  upcomingTimeLabel: string;
  daysUntil: number;
  hoursUntil: number;
  handleStartAssembly: () => void;
}

export function NextAssemblyCard({
  upcomingDateLabel,
  upcomingTimeLabel,
  daysUntil,
  hoursUntil,
  handleStartAssembly,
}: NextAssemblyCardProps) {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Próxima Asamblea
          </CardTitle>
          <CardDescription>
            Mantente al tanto de la próxima reunión y prepárate con la agenda preliminar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-md border bg-card p-4">
              <div className="text-xs text-muted-foreground">Fecha</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{upcomingDateLabel}</div>
              <div className="text-sm text-muted-foreground">{upcomingTimeLabel}</div>
            </div>
            <div className="rounded-md border bg-card p-4">
              <div className="text-xs text-muted-foreground">Cuenta regresiva</div>
              <div className="mt-1 text-lg font-semibold text-foreground">Faltan {daysUntil} días</div>
              <div className="text-sm text-muted-foreground">y {hoursUntil} horas</div>
            </div>
            <div className="rounded-md border bg-card p-4">
              <div className="text-xs text-muted-foreground">Lugar</div>
              <div className="mt-1 text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Sala Principal Montes y Vegas
              </div>
              <div className="text-sm text-muted-foreground">Combayo</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Agenda preliminar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assemblySteps.slice(0, 4).map((step) => (
                <div key={step.id} className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {step.icon && <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="text-sm text-foreground">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={handleStartAssembly}
              className="text-xs text-muted-foreground hover:text-primary underline"
            >
              Iniciar ahora
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
