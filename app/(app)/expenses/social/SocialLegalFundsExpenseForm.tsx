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
import { ISocialFunds } from "@/types/ISocialFunds";
import { ISocialFundsExpenseTransaction } from "./types";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "../../../../components/combobox/ComboboxUsers";
import { IUser } from "@/types/IUser";
import apiClient from "@/config/apiClient";
import { toast } from "@/hooks/use-toast";
import { socialFundsData } from "@/constants";

export const SocialLegalFundsExpenseForm = ({
  socialFunds,
  setOpenDialog,
  socialFundsTransactions,
  setSocialFundsTransactions,
}: {
  socialFunds: ISocialFunds[];
  setOpenDialog?: (value: boolean) => void;
  socialFundsTransactions?: ISocialFundsExpenseTransaction[];
  setSocialFundsTransactions?: (value: ISocialFundsExpenseTransaction[]) => void;
}) => {
  const form = useForm({
    defaultValues: {
      socialFund: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      username: "",
    },
  });
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const onSubmit = async () => {
    if (!form.getValues("socialFund")) {
      toast({
        title: "Error",
        description: "Debes seleccionar un fondo.",
      });
      return;
    }

    if (!form.getValues("amount")) {
      toast({
        title: "Error",
        description: "Debes ingresar un monto.",
      });
      return;
    }
    const res = await apiClient.post(
      "/expenses/social-funds/create-transaction",
      {
        socialFundsId: form.getValues("socialFund"),
        amount: form.getValues("amount"),
        description: "Egreso de fondos",
        date: new Date(form.getValues("date")),
        userId: userSelected ? userSelected.id : null,
      }
    );
    if (res.data) {
      form.reset();
      setOpenDialog?.(false);
      setSocialFundsTransactions?.([res.data, ...(socialFundsTransactions || [])]);
      toast({
        title: "Egreso de fondo creado.",
        description: "El egreso de fondo fue creado correctamente.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                La fecha del egreso de fondos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="socialFund"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de fondo.</FormLabel>
              <br />
              <FormControl>
                <select {...field} className="border rounded px-2 py-1">
                  <option value="">Selecciona el fondo</option>
                  {socialFunds.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {
                        socialFundsData[
                          fund.name as keyof typeof socialFundsData
                        ]
                      }
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Selecciona el fondo al que deseas ingresar dinero.
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
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                El monto que deseas ingresar al fondo.
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
                El usuario al que se le asignará el egreso. (Opcional)
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
