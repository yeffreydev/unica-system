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
import { IAdministrativeExpense } from "./types";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/config/apiClient";

export const AdminExpenseForm = ({
  setOpenDialog,
  administrativeExpenses,
  setAdministrativeExpenses,
}: {
  setOpenDialog?: (value: boolean) => void;
  administrativeExpenses?: IAdministrativeExpense[];
  setAdministrativeExpenses?: (value: IAdministrativeExpense[]) => void;
}) => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      description: "",
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
      date: new Date().toISOString().split('T')[0],
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

    const res = await apiClient.post("/expenses/administrative/create-transaction", {
      amount: form.getValues("amount"),
      description: form.getValues("description"),
      userId: userSelected ? userSelected.id : null,
      date: new Date(form.getValues("date")),
    });
    if (res.data) {
      form.reset();
      setOpenDialog?.(false);
      setAdministrativeExpenses?.([res.data, ...(administrativeExpenses || [])]);
      toast({
        title: "Gasto administrativo creado.",
        description: "el gasto administrativo fue creado correctamente.",
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2>Nuevo Gasto Administrativo</h2>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>
                La fecha del gasto administrativo.
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
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input type="number" {...field} />
                </div>
              </FormControl>
              <FormDescription>Monto del gasto</FormDescription>
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
              <FormDescription>Descripcion del gasto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
                El usuario que deseas asignar al gasto. (Opcional)
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
