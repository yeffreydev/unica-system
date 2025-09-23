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
import { IIncome } from "./types";

export const OtherIncomeForm = ({
  setOpenDialog,
  otherIncomes,
  setOtherIncomes,
}: {
  setOpenDialog?: (value: boolean) => void;
  otherIncomes: IIncome[];
  setOtherIncomes: (value: IIncome[]) => void;
}) => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
      description: "",
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

    if (!form.getValues("description")) {
      toast({
        title: "Error",
        description: "Debes ingresar una descripcion.",
      });
      return;
    }
    const res = await apiClient.post("/incomes/others/create-transaction", {
      amount: form.getValues("amount"),
      description: form.getValues("description"),
      userId: userSelected ? userSelected.id : null,
      date: new Date(form.getValues("date")),
    });
    if (res.data) {
      form.reset();
      console.log(res.data);
      setOtherIncomes([res.data, ...otherIncomes]);
      setOpenDialog?.(false);
      toast({
        title: "Otro ingreso creado.",
        description: "el ingreso fue creado correctamente.",
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2>Registrar Otros Ingresos.</h2>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input cy-data="other-amount" type="number" {...field} />
              </FormControl>
              <FormDescription>
                El monto que deseas ingresar a otros ingresos.
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
                <Input cy-data="other-description" type="text" {...field} />
              </FormControl>
              <FormDescription>La descripción del ingreso.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input cy-data="other-date" type="date" {...field} />
              </FormControl>
              <FormDescription>
                La fecha del ingreso.
              </FormDescription>
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
                El usuario al que se le asignará el ingreso. (Opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button cy-data="save-btn" type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
};
