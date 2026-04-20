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
});

type PlatformFormValues = z.infer<typeof PlatformFormSchema>;

const defaultValues: PlatformFormValues = {
  name: "",
  loanInterestRate: "2",
  savingsInterestRate: "1",
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
      const res = await apiClient.put("/banks", {
        name: data.name,
        loanInterestRate: Number(data.loanInterestRate) / 100,
        savingsInterestRate: Number(data.savingsInterestRate) / 100,
      });

      if (res.data) {
        sileo.success({
          title: "Éxito",
          description: "La configuración se actualizó correctamente.",
        });
        const updatedBank = { ...bank, bank: res.data };
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
  }, [bank]);

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
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading}>
          {loading ? "Actualizando..." : "Guardar Configuración"}
        </Button>
      </form>
    </Form>
  );
}
