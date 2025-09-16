"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { useState } from "react";


export default function Closing() {
  const [notes, setNotes] = useState<string>("Resumen breve de los acuerdos y tareas para la próxima sesión.");
  const [finalCall, setFinalCall] = useState<string>("");
  return (
    <div className="flex flex-col gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Llamado final y cierre</CardTitle>
        <CardDescription>Redacta el cierre y genera el acta final</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-1">
            <label className="text-[11px] text-muted-foreground">Llamado final de lista</label>
            <Input placeholder="Observaciones del llamado final" value={finalCall} onChange={(e) => setFinalCall(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-1">
            <label className="text-[11px] text-muted-foreground">Notas finales</label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline">Previsualizar acta</Button>
          <Button className="gap-2"><Flag className="w-4 h-4" /> Cerrar sesión</Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}


