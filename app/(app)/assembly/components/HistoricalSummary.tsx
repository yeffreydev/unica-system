import {
  BarChart3,
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface PastAssembly {
  date: string;
  attendees: number;
  durationMin: number;
  approvedItems: number;
  savings: number;
  purchases: number;
}

interface HistoricalSummaryProps {
  totalAssemblies: number;
  avgAttendees: number;
  avgDuration: number;
  totalSavings: number;
  totalPurchases: number;
  pastAssemblies: PastAssembly[];
}

export function HistoricalSummary({
  totalAssemblies,
  avgAttendees,
  avgDuration,
  totalSavings,
  totalPurchases,
  pastAssemblies,
}: HistoricalSummaryProps) {
  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Resumen Histórico</CardTitle>
          </div>
          <CardDescription>
            Indicadores basados en las últimas {totalAssemblies} asambleas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-md border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CalendarDays className="w-4 h-4" />
                Total asambleas
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {totalAssemblies}
              </div>
            </div>
            <div className="rounded-md border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Users className="w-4 h-4" />
                Asistencia promedio
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {avgAttendees}
              </div>
            </div>
            <div className="rounded-md border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="w-4 h-4" />
                Duración promedio
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {avgDuration} min
              </div>
            </div>
            <div className="rounded-md border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Aprobaciones/Movimientos
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Ahorros:{" "}
                <span className="text-foreground font-medium">
                  S/ {totalSavings.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Acciones:{" "}
                <span className="text-foreground font-medium">
                  S/ {totalPurchases.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Últimas asambleas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pastAssemblies.map((a) => (
                <div
                  key={a.date}
                  className="rounded-md border bg-muted/40 p-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      {a.date}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {a.attendees} asistentes
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Duración:{" "}
                    <span className="text-foreground font-medium">
                      {a.durationMin} min
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Aprobados:{" "}
                    <span className="text-foreground font-medium">
                      {a.approvedItems}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}