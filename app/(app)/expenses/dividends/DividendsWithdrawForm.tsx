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
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "../../../../components/combobox/ComboboxUsers";
import { IUser } from "@/types/IUser";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/config/apiClient";

export const DividendsWithdrawForm = () => {
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

    const res = await apiClient.post("/expenses/dividends", {
      amount: form.getValues("amount"),
      description: "Retiro de Utilidades",
      userId: userSelected ? userSelected.id : null,
      date: new Date(),
    });
    if (res.data) {
      form.reset();
      toast({
        title: "Gasto administrativo creado.",
        description: "el gasto administrativo fue creado correctamente.",
      });
      if (window) window.location.reload();
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h2>Retiro de Utilidades</h2>
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
                El usuario que desea retirar Utilidades.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col">
          <span>Acciones: S/. 5000</span>
          <span>Utilidades: S/. 5000</span>
          <span>Disponible para retirar: S/. 50</span>
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
                El monto que deseas retirar de Utilidades.
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
