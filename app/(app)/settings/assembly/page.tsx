"use client";

import { AssemblyConfigForm } from "./assembly-config-form";

export default function AssemblySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración de Asamblea</h1>
        <p className="text-muted-foreground">
          Configura la frecuencia, horario y participantes de las asambleas.
        </p>
      </div>
      <AssemblyConfigForm />
    </div>
  );
}
