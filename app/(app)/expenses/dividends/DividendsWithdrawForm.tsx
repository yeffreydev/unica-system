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
import { IDividendsWithdraw } from "./types";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/config/apiClient";

export const DividendsWithdrawForm = ({
  setOpenDialog,
  dividends,
  setDividends,
  defaultDate,
  scheduleRunId,
}: {
  setOpenDialog?: (value: boolean) => void;
  dividends?: IDividendsWithdraw[];
  setDividends?: (value: IDividendsWithdraw[]) => void;
  defaultDate?: Date;
  scheduleRunId?: string;
}) => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
      date: (defaultDate ?? new Date()).toISOString().split('T')[0],
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


    const res = await apiClient.post("/expenses/dividends/create-transaction", {
      amount: form.getValues("amount"),
      description: "Retiro de Utilidades",
      userId: userSelected ? userSelected.id : null,
      date: new Date(form.getValues("date")),
      scheduleRunId: scheduleRunId || undefined,
    });
    if (res.data) {
      form.reset();
      setOpenDialog?.(false);
      setDividends?.([res.data, ...(dividends || [])]);
      toast({
        title: "Retiro de utilidades creado.",
        description: "el retiro de utilidades fue creado correctamente.",
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                La fecha del retiro de utilidades.
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
                El usuario que desea retirar Utilidades.
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
