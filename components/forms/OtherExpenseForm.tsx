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

export const OtherExpenseForm = () => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
      description: "",
    },
  });

  return (
    <Form {...form}>
      <h2>Registrar Otros Egresos.</h2>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monto</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormDescription>
              El monto para agregar a otros egresos.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripcion</FormLabel>
            <FormControl>
              <Input type="text" {...field} />
            </FormControl>
            <FormDescription>La descripción del ingreso.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
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
              El usuario al que se le asignará el ingreso. (Opcional)
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
