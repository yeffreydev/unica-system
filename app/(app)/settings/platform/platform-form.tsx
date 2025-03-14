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
import { useContext, useEffect } from "react";
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
  avatar: z.string().optional(), // make avatar optional
});

type PlatformFormValues = z.infer<typeof PlatformFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<PlatformFormValues> = {
  name: "",
  avatar: "",
};

export function PlatformForm() {
  const {
    bank: { bank },
  } = useContext(AppContext);

  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(PlatformFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const updatePlatform = async () => {
    const res = await apiClient.put("/banks", {
      name: form.getValues("name"),
    });
    if (res.data) {
      localStorage.removeItem("bank");
      window && window.location.reload();
    }
  };
  function onSubmit(data: PlatformFormValues) {
    updatePlatform();
    console.log(data);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }
  useEffect(() => {
    form.setValue("name", bank.name ?? "");
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
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                Este nombre es el oficial de tu asociacion.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="picture">Logo</FormLabel>
              <Input
                id="picture"
                type="file"
                ref={field.ref}
                onChange={(e) => form.setValue("avatar", e.target.value)}
              />
              <FormDescription>
                Esta imagen sera la que represente a tu asociacion.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Actualizar Plataforma</Button>
      </form>
    </Form>
  );
}
