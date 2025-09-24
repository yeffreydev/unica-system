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
import { IPayout } from "./types";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/config/apiClient";

export const InterestPaymentForm = ({
  setOpenDialog,
  payouts,
  setPayouts,
}: {
  setOpenDialog?: (value: boolean) => void;
  payouts?: IPayout[];
  setPayouts?: (value: IPayout[]) => void;
}) => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
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


    const res = await apiClient.post("/payouts/create-transaction", {
      amount: form.getValues("amount"),
      description: "Pago de intereses",
      userId: userSelected ? userSelected.id : null,
      date: new Date(form.getValues("date")),
    });
    if (res.data) {
      form.reset();
      setOpenDialog?.(false);
      setPayouts?.([res.data, ...(payouts || [])]);
      toast({
        title: "Payout creado.",
        description: "Pagos de interes creado correctamente.",
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
                La fecha del pago de intereses.
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
                El usuario para pagarle los intereses.
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
                El monto a pagar por intereses de ahorros.
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
