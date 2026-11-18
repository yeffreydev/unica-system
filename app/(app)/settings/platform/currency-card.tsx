"use client";

import { useEffect, useState } from "react";
import { sileo } from "sileo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/CurrencySelect";
import { useTenant } from "@/context/TenantContext";
import { currencyInfo, money } from "@/lib/currency";

/** Moneda en la que la asociación lleva sus montos. */
export function CurrencyCard() {
  const { currency, updateCurrency } = useTenant();
  const [selected, setSelected] = useState(currency.code);
  const [saving, setSaving] = useState(false);

  // Si la moneda cambia por fuera (otra pestaña, recarga), se refleja aquí.
  useEffect(() => {
    setSelected(currency.code);
  }, [currency.code]);

  const dirty = selected !== currency.code;
  const preview = currencyInfo(selected);

  const save = async () => {
    setSaving(true);
    try {
      await updateCurrency(selected);
      sileo.success({
        title: "Moneda actualizada",
        description: `Los montos ahora se muestran en ${preview.name} (${preview.symbol}).`,
      });
    } catch (error) {
      console.error("Error updating currency:", error);
      sileo.error({
        title: "Error",
        description: "No se pudo cambiar la moneda. Solo un administrador puede hacerlo.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Moneda</CardTitle>
        <CardDescription>
          Moneda en la que tu asociación lleva sus montos. Se usa en la asamblea, los reportes y
          las actas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tenant-currency">Moneda de la asociación</Label>
          <CurrencySelect
            id="tenant-currency"
            value={selected}
            onChange={setSelected}
            disabled={saving}
          />
          <p className="text-sm text-muted-foreground">
            Ejemplo:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {money(1250.5, { currency: selected })}
            </span>
          </p>
        </div>
        {dirty && (
          <p className="rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
            Cambiar la moneda solo cambia el símbolo y el formato con que se muestran los montos.
            Los valores ya registrados no se convierten.
          </p>
        )}
        <Button type="button" onClick={save} disabled={!dirty || saving}>
          {saving ? "Guardando..." : "Guardar moneda"}
        </Button>
      </CardContent>
    </Card>
  );
}
