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
import { ComboBoxUsers } from "../combobox/ComboboxUsers";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";

export const WithdrawForm = () => {
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
        render={() => (
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
              El usuario que desea retirar de ahorros.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-col">
        <span>Ahorros: S/. 5000</span>
        <span>Acciones: S/. 5000</span>
        <span>Prestamo: S/. 500</span>
        <span>Disponibles para Retirar Ahorros: S/.4000</span>
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
              El monto que deseas retirar de ahorros.
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
