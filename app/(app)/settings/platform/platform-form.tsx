"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { sileo } from "sileo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import apiClient from "@/config/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roundingModeLabels = {
  NORMAL: "Normal",
  UP: "Hacia arriba",
  DOWN: "Hacia abajo",
} as const;

const PlatformFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "nombre debe tener al menos 2 caracteres." })
    .max(50, { message: "nombre no debe tener más de 50 caracteres." }),
  loanInterestRate: z
    .string()
    .refine((v) => v !== "", { message: "Este campo es requerido." })
    .refine((v) => !isNaN(Number(v)), { message: "Debe ser un número válido." })
    .refine((v) => Number(v) >= 0, { message: "La tasa no puede ser negativa." })
    .refine((v) => Number(v) <= 100, { message: "La tasa no puede ser mayor a 100%." }),
  savingsInterestRate: z
    .string()
    .refine((v) => v !== "", { message: "Este campo es requerido." })
    .refine((v) => !isNaN(Number(v)), { message: "Debe ser un número válido." })
    .refine((v) => Number(v) >= 0, { message: "La tasa no puede ser negativa." })
    .refine((v) => Number(v) <= 100, { message: "La tasa no puede ser mayor a 100%." }),
  loanInterestRoundingMode: z.enum(["NORMAL", "UP", "DOWN"]),
  loanInterestRoundingDigits: z
    .string()
    .refine((v) => v !== "", { message: "Este campo es requerido." })
    .refine((v) => Number.isInteger(Number(v)), { message: "Debe ser un número entero." })
    .refine((v) => Number(v) >= 0, { message: "No puede ser menor a 0." })
    .refine((v) => Number(v) <= 4, { message: "No puede ser mayor a 4." }),
  savingsInterestRoundingMode: z.enum(["NORMAL", "UP", "DOWN"]),
  savingsInterestRoundingDigits: z
    .string()
    .refine((v) => v !== "", { message: "Este campo es requerido." })
    .refine((v) => Number.isInteger(Number(v)), { message: "Debe ser un número entero." })
    .refine((v) => Number(v) >= 0, { message: "No puede ser menor a 0." })
    .refine((v) => Number(v) <= 4, { message: "No puede ser mayor a 4." }),
  stockPrice: z
    .string()
    .refine((v) => v !== "", { message: "Este campo es requerido." })
    .refine((v) => !isNaN(Number(v)), { message: "Debe ser un número válido." })
    .refine((v) => Number(v) >= 0, { message: "El precio no puede ser negativo." }),
});

type PlatformFormValues = z.infer<typeof PlatformFormSchema>;

const defaultValues: PlatformFormValues = {
  name: "",
  loanInterestRate: "2",
  savingsInterestRate: "1",
  loanInterestRoundingMode: "NORMAL",
  loanInterestRoundingDigits: "2",
  savingsInterestRoundingMode: "NORMAL",
  savingsInterestRoundingDigits: "2",
  stockPrice: "10",
};

export function PlatformForm() {
  const { bank, setBank } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(PlatformFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const updatePlatform = async (data: PlatformFormValues) => {
    setLoading(true);
    try {
      const [res, stockRes] = await Promise.all([
        apiClient.put("/banks", {
          name: data.name,
          loanInterestRate: Number(data.loanInterestRate) / 100,
          savingsInterestRate: Number(data.savingsInterestRate) / 100,
          loanInterestRoundingMode: data.loanInterestRoundingMode,
          loanInterestRoundingDigits: Number(data.loanInterestRoundingDigits),
          savingsInterestRoundingMode: data.savingsInterestRoundingMode,
          savingsInterestRoundingDigits: Number(data.savingsInterestRoundingDigits),
        }),
        apiClient.put("/banks/stock", { price: Number(data.stockPrice) }),
      ]);

      if (res.data) {
        sileo.success({
          title: "Éxito",
          description: "La configuración se actualizó correctamente.",
        });
        const updatedBank = {
          ...bank,
          bank: res.data,
          mainStock: stockRes?.data ?? bank.mainStock,
        };
        setBank(updatedBank);
        localStorage.setItem("bank", JSON.stringify(updatedBank));
      }
    } catch (error) {
      console.error("Error updating platform:", error);
      sileo.error({
        title: "Error",
        description: "No se pudo actualizar la configuración. Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  function onSubmit(data: PlatformFormValues) {
    if (!data.name.trim()) {
      data.name = bank.bank.name;
    }
    updatePlatform(data);
  }

  useEffect(() => {
    form.setValue("name", bank?.bank?.name ?? "");
    form.setValue("loanInterestRate", String((bank?.bank?.loanInterestRate ?? 0.02) * 100));
    form.setValue("savingsInterestRate", String((bank?.bank?.savingsInterestRate ?? 0.01) * 100));
    form.setValue("loanInterestRoundingMode", bank?.bank?.loanInterestRoundingMode ?? "NORMAL");
    form.setValue("loanInterestRoundingDigits", String(bank?.bank?.loanInterestRoundingDigits ?? 2));
    form.setValue("savingsInterestRoundingMode", bank?.bank?.savingsInterestRoundingMode ?? "NORMAL");
    form.setValue("savingsInterestRoundingDigits", String(bank?.bank?.savingsInterestRoundingDigits ?? 2));
    form.setValue("stockPrice", String(bank?.mainStock?.price ?? 10));
  }, [bank]);

  const roundingMode = form.watch("loanInterestRoundingMode");
  const roundingDigits = Number(form.watch("loanInterestRoundingDigits") || 0);
  const roundingExample = (() => {
    const value = roundingDigits === 0
      ? roundingMode === "NORMAL" ? 5.5 : roundingMode === "UP" ? 5.2 : 5.08
      : roundingMode === "NORMAL" ? 5.25 : roundingMode === "UP" ? 5.22 : 5.17;
    const factor = 10 ** roundingDigits;
    const rounded =
      roundingMode === "UP"
        ? Math.ceil(value * factor - Number.EPSILON) / factor
        : roundingMode === "DOWN"
          ? Math.floor(value * factor + Number.EPSILON) / factor
          : Math.round(value * factor) / factor;
    return `${value} → ${rounded.toFixed(roundingDigits)}`;
  })();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Este nombre es el oficial de tu asociación.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tasas de Interés</CardTitle>
            <CardDescription>
              Configura las tasas de interés por defecto de la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="loanInterestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa de Interés de Préstamos (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" max="100" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tasa mensual que se aplica a los préstamos otorgados.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="savingsInterestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa de Interés de Ahorros (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" max="100" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tasa mensual que se paga a los ahorristas por sus depósitos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="loanInterestRoundingMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redondeo de Préstamos</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el redondeo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NORMAL">{roundingModeLabels.NORMAL}</SelectItem>
                        <SelectItem value="UP">{roundingModeLabels.UP}</SelectItem>
                        <SelectItem value="DOWN">{roundingModeLabels.DOWN}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Aplica al capital y al interés de las cuotas. Normal usa el decimal estándar; arriba siempre sube; abajo siempre corta.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loanInterestRoundingDigits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decimales del Préstamo</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" max="4" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ejemplo con la configuración actual: {roundingExample}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="savingsInterestRoundingMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redondeo de Interés de Ahorros</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el redondeo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NORMAL">{roundingModeLabels.NORMAL}</SelectItem>
                        <SelectItem value="UP">{roundingModeLabels.UP}</SelectItem>
                        <SelectItem value="DOWN">{roundingModeLabels.DOWN}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Aplica al pagar interés a los ahorristas en la asamblea.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="savingsInterestRoundingDigits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decimales del Interés (Ahorros)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" max="4" {...field} />
                    </FormControl>
                    <FormDescription>
                      0 = soles enteros, 2 = céntimos, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones</CardTitle>
            <CardDescription>
              Configura el precio de cada acción. Este valor se usa al registrar compras en la asamblea.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="stockPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de la acción (S/)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Precio unitario aplicado a cada acción comprada en la asamblea.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading}>
          {loading ? "Actualizando..." : "Guardar Configuración"}
        </Button>
      </form>
    </Form>
  );
}
