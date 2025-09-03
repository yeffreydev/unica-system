import { BellRing, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssemblyStartBannerProps {
  waitingElapsed?: string;
  upcomingDateLabel?: string;
  upcomingTimeLabel?: string;
  handleStartAssembly?: () => void;
}

export function AssemblyStartBanner({
  waitingElapsed = "--:--",
  upcomingDateLabel = "dd/mm/aaaa",
  upcomingTimeLabel = "--:--",
  handleStartAssembly = () => {},
}: AssemblyStartBannerProps) {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20">
        <div className="p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <BellRing className="h-3.5 w-3.5" />
                Es hora
              </span>
              <span className="text-xs text-muted-foreground">Asamblea programada</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tiempo sin iniciar</div>
              <div className="text-xl font-bold text-foreground tabular-nums">{waitingElapsed}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">Programada: {upcomingDateLabel} · {upcomingTimeLabel}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg md:text-xl font-semibold text-foreground truncate">La asamblea está por comenzar</div>
              <div className="text-xs text-muted-foreground truncate">Inicia la sesión para registrar asistencia y seguir la agenda</div>
            </div>
            <div className="flex items-center gap-2">
              <Button className="gap-2" onClick={handleStartAssembly}>
                <PlayCircle className="h-4 w-4" /> Iniciar asamblea
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}