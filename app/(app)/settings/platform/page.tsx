import { Separator } from "@/components/ui/separator";
import { PlatformForm } from "./platform-form";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Plataforma</h3>
        <p className="text-sm text-muted-foreground">
          Configura la plataforma de tu &quot;Asociacion de Ahorro y
          Prestamo&quot;.
        </p>
      </div>
      <Separator />
      <PlatformForm />
    </div>
  );
}
