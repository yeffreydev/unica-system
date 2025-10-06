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
import { IWithdrawal } from "./types";
import apiClient from "@/config/apiClient";
import { toast } from "@/hooks/use-toast";

export const WithdrawForm = ({
  setOpenDialog,
  withdrawals,
  setWithdrawals,
  defaultDate,
  scheduleRunId,
}: {
  setOpenDialog?: (value: boolean) => void;
  withdrawals?: IWithdrawal[];
  setWithdrawals?: (value: IWithdrawal[]) => void;
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

    const res = await apiClient.post("/withdrawals/create-transaction", {
      amount: form.getValues("amount"),
      description: "Retiro de ahorros",
      userId: userSelected ? userSelected.id : null,
      date: new Date(form.getValues("date")),
      scheduleRunId: scheduleRunId || null,
    });
    if (res.data) {
      form.reset();
      setOpenDialog?.(false);
      setWithdrawals?.([res.data, ...(withdrawals || [])]);
      toast({
        title: "Retiro creado.",
        description: "El retiro de ahorros fue creado correctamente.",
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2>Retiro de ahorros</h2>
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
                La fecha del retiro.
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
                El usuario que desea retirar de ahorros. (Opcional)
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
