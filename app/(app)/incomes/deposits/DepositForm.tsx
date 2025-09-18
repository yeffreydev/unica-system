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
import { IDeposit } from "./types";

export const DepositForm = ({
  setOpenDialog,
}: {
  setOpenDialog?: (value: boolean) => void;
}) => {
  const { users, formCloseModalRef } = useContext(AppContext);
  const { addDeposit } = useContext(DepositContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPeruDate = () => {
    const now = new Date();
    const peruOffset = -5 * 60; // Peru is UTC-5
    const peruTime = new Date(
      now.getTime() + (peruOffset - now.getTimezoneOffset()) * 60000
    );
    return peruTime.toISOString().split("T")[0];
  };

  const form = useForm({
    defaultValues: {
      username: "",
      amount: 0,
      date: getPeruDate(),
    },
  });

  const createDeposit = async (data: IDeposit) => {
    try {
      const res = await apiClient.post("/deposits", data);
      if (res.data) {
        addDeposit!(res.data);
        form.reset();
        formCloseModalRef?.current?.click();
        setOpenDialog?.(false);
      }
    } catch (e) {
      console.log(e);
      setOpenDialog?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (formData) => {
          if (isSubmitting) return; // Prevent multiple submissions
          if (formData.amount <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
          }
          if (!userSelected) {
            alert("Debes seleccionar un usuario");
            return;
          }
          setIsSubmitting(true);
          await createDeposit({
            amount: formData.amount,
            userId: userSelected.id,
            date: formData.date,
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
                <Input cy-data="deposit-amount" type="number" {...field} />
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
        <FormItem>
          <FormLabel>Fecha</FormLabel>
          <FormControl>
            <Input type="date" {...form.register("date")} />
          </FormControl>
          <FormDescription>
            La fecha en que deseas que se registre el depósito.
          </FormDescription>
          <FormMessage />
        </FormItem>
        <div>
          <Button cy-data="save-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};