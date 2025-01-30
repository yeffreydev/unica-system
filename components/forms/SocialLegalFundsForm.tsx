"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const SocialLegalFundsForm = () => {
  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
    },
  });

  return (
    <Form {...form}>
      <h2 className="text-xl font-semibold">
        Registrar Ingreso fondo Social y legal
      </h2>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fondo Social</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormDescription>
              El monto que deseas ingresar a fondo social.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reseva Legal</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormDescription>
              El monto que deseas ingresar a reserva legal.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Button type="submit">Guardar</Button>
      </div>
    </Form>
  );
};
