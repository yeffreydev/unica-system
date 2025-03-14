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
import { DepositContext } from "./DepositProvider";
import apiClient from "@/config/apiClient";
import { IDeposit } from "@/types/ITransaction";

export const DepositForm = () => {
  const { users, formCloseModalRef } = useContext(AppContext);
  const { addDeposit } = useContext(DepositContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
    },
  });

  const createDeposit = async (data: IDeposit) => {
    try {
      const res = await apiClient.post("/transactions/deposits", data);
      if (res.data) {
        addDeposit!(res.data);
        form.reset();
        formCloseModalRef?.current?.click();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((formData) => {
          if (formData.amount <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
          }
          if (!userSelected) {
            alert("Debes seleccionar un usuario");
            return;
          }
          createDeposit({
            amount: formData.amount,
            userId: userSelected.id,
          });
        })}
      >
        <h2>Deposito a Cuenta de ahorros.</h2>
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
                El monto que deseas depositar en tu cuenta de ahorros.
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
                El usuario al que deseas depositar el monto.
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
