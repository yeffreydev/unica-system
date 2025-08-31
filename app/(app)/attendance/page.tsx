import { Button } from "@/components/ui/button";
import { ListTable } from "./ListTable";

export default function AttendancePage() {
  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
                <h1 className="text-2xl font-bold text-foreground">Llamado de Lista</h1>
      <p className="text-sm text-muted-foreground">
            Fecha del evento:{" "}
            <span className="font-medium">17 de Enero, 2025</span>
          </p>
        </div>
        <Button>Nuevo Evento</Button>
      </header>

      <ListTable />
    </div>
  );
}
