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
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { ComboBoxUsers } from "../../../../components/combobox/ComboboxUsers";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";
import apiClient from "@/config/apiClient";
import { toast } from "@/hooks/use-toast";

export const WithdrawForm = () => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
    },
  });

  const onSubmit = async () => {
    if (!form.getValues("amount")) {
      toast({
        title: "Error",
        description: "Debes ingresar un monto.",
      });
      return;
    }

    if (!userSelected) {
      toast({
        title: "Error",
        description: "Debes seleccionar un usuario.",
      });
      return;
    }

    const res = await apiClient.post("/withdrawals", {
      amount: form.getValues("amount"),
      description: "Retiro de ahorros",
      userId: userSelected ? userSelected.id : null,
      date: new Date(),
    });
    if (res.data) {
      form.reset();
      toast({
        title: "withdrawal creado.",
        description: "el retiro de ahorros fue creado correctamente.",
      });
      if (window) window.location.reload();
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
      </form>
    </Form>
  );
};
