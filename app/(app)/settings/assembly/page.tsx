"use client";

import { useEffect, useState } from "react";
import { AssemblyConfigForm } from "./assembly-config-form";
import apiClient from "@/config/apiClient";

export default function AssemblySettingsPage() {
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await apiClient.get('/settings/assembly/config');
        setHasConfig(!!response.data);
      } catch (error) {
        console.error('Error checking config:', error);
        setHasConfig(false);
      }
    };

    checkConfig();
  }, []);

  if (hasConfig === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Asamblea</h1>
          <p className="text-muted-foreground">
            Cargando configuración...
          </p>
        </div>
      </div>
    );
  }

  if (!hasConfig) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Asamblea</h1>
          <p className="text-muted-foreground">
            Empiece a configurar su asamblea.
          </p>
        </div>
        <AssemblyConfigForm onConfigSaved={() => setHasConfig(true)} />
      </div>
    );
  }

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
