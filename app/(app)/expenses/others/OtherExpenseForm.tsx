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
import { IOtherExpense } from "./types";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/config/apiClient";

export const OtherExpenseForm = ({
  setOpenDialog,
  otherExpenses,
  setOtherExpenses,
  defaultDate,
  scheduleRunId,
}: {
  setOpenDialog?: (value: boolean) => void;
  otherExpenses?: IOtherExpense[];
  setOtherExpenses?: (value: IOtherExpense[]) => void;
  defaultDate?: Date;
  scheduleRunId?: string;
}) => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const getPeruDate = () => {
    const now = new Date();
    const peruOffset = -5 * 60;
    const peruTime = new Date(
      now.getTime() + (peruOffset - now.getTimezoneOffset()) * 60000
    );
    return peruTime.toISOString().split("T")[0];
  };

  const form = useForm({
    defaultValues: {
      username: "",
      amount: 0,
      description: "",
      date: defaultDate ? new Date(defaultDate).toISOString().split("T")[0] : getPeruDate(),
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

    const res = await apiClient.post("/expenses/others/create-transaction", {
      amount: form.getValues("amount"),
      description: form.getValues("description"),
      userId: userSelected ? userSelected.id : null,
      date: new Date(form.getValues("date")),
      scheduleRunId: scheduleRunId || null,
    });
    if (res.data) {
      form.reset();
      setOpenDialog?.(false);
      setOtherExpenses?.([res.data, ...(otherExpenses || [])]);
      toast({
        title: "Otro egreso creado.",
        description: "el egreso fue creado correctamente.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>
                La fecha del egreso.
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
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
};
