import {
  CalendarDays,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PastAssembly {
  date: string;
  attendees: number;
  durationMin: number;
  approvedItems: number;
  savings: number;
  purchases: number;
}

interface HistoricalSummaryProps {
  totalAssemblies?: number;
  avgAttendees?: number;
  avgDuration?: number;
  totalSavings?: number;
  totalPurchases?: number;
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
          <CardTitle className="text-lg">Últimas Asambleas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/assembly/proceedings">Ver Más</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}