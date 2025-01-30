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
import { useContext, useState } from "react";
import { AppContext } from "@/context/auth/AppContext";
import { ComboBoxUsers } from "../combobox/ComboboxUsers";
import { IUser } from "@/types/IUser";

export const InterestPaymentForm = () => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
    },
  });

  return (
    <Form {...form}>
      <h2>Retiro de ahorros</h2>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Usuario</FormLabel>
            <FormControl>
              <div>
                <ComboBoxUsers
                  controller={{ userSelected, setUserSelected }}
                  users={users}
                />
              </div>
            </FormControl>
            <FormDescription>
              El usuario para pagarle los intereses.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-col">
        <span>Ahorros: S/. 5000</span>
        <span>Acciones: S/. 5000</span>
        <span>Interes Ganado de ahorros: S/. 500</span>
      </div>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monto</FormLabel>
            <FormControl>
              <div className="flex flex-col gap-2">
                <Input type="number" {...field} />
                <p>S/ {field.value * 10}</p>
              </div>
            </FormControl>
            <FormDescription>
              El monto a pagar por intereses de ahorros.
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
