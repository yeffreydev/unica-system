"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@/hooks/use-toast";
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

const PlatformFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "nombre debe tener al menos 2 caracteres.",
    })
    .max(50, {
      message: "nombre no debe tener más de 50 caracteres.",
    }),
});

type PlatformFormValues = z.infer<typeof PlatformFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<PlatformFormValues> = {
  name: "",
};

export function PlatformForm() {
  const {
    bank,
    setBank,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);

  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(PlatformFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const updatePlatform = async () => {
    setLoading(true);
    try {
      const res = await apiClient.put("/banks", {
        name: form.getValues("name"),
      });

      if (res.data) {
        toast({
          title: "Éxito",
          description: "La plataforma se actualizó correctamente.",
        });
        const updatedBank = { ...bank, bank: res.data };
        setBank(updatedBank);
        localStorage.setItem("bank", JSON.stringify(updatedBank));
      }
    } catch (error) {
      console.error("Error updating platform:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la plataforma. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  function onSubmit(data: PlatformFormValues) {
    if (!data.name.trim()) {
      data.name = bank.bank.name;
    }
    updatePlatform();
  }

  useEffect(() => {
    form.setValue("name", bank?.bank?.name ?? "");
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
                Este nombre es el oficial de tu asociacion.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar Plataforma"}
        </Button>
      </form>
    </Form>
  );
}
