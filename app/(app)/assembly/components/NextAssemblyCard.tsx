import { CalendarDays, MapPin, CalendarClock, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assemblySteps } from "../steps";
import { useState } from "react";
import { apiRescheduleNextAssembly } from "../api";
import { sileo } from "sileo";

interface NextAssemblyCardProps {
  upcomingDateLabel: string;
  upcomingTimeLabel: string;
  daysUntil: number;
  hoursUntil: number;
  handleStartAssembly: () => void;
  upcomingISO?: string;
  onRescheduled?: () => void;
}

export function NextAssemblyCard({
  upcomingDateLabel,
  upcomingTimeLabel,
  daysUntil,
  hoursUntil,
  handleStartAssembly,
  upcomingISO,
  onRescheduled,
}: NextAssemblyCardProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(upcomingISO ? upcomingISO.slice(0, 10) : "");
  const [time, setTime] = useState(upcomingISO ? upcomingISO.slice(11, 16) : "19:00");

  const handleSubmit = async () => {
    if (!date) return;
    setSubmitting(true);
    try {
      const dt = new Date(`${date}T${time || "19:00"}:00`);
      await apiRescheduleNextAssembly(dt);
      sileo.success({ title: "Asamblea reprogramada" });
      setOpen(false);
      onRescheduled?.();
    } catch (err) {
      console.error(err);
      sileo.error({ title: "No se pudo reprogramar" });
    } finally {
      setSubmitting(false);
    }
  };
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
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
              <CalendarClock className="w-4 h-4" /> Reprogramar
            </Button>
            <button
              onClick={handleStartAssembly}
              className="text-xs text-muted-foreground hover:text-primary underline"
            >
              Iniciar ahora
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => !submitting && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Reprogramar próxima asamblea</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hora</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting || !date}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Guardando…</> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
