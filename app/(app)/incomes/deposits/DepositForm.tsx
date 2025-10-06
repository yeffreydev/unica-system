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
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "../../../../components/combobox/ComboboxUsers";
import { IUser } from "@/types/IUser";
import apiClient from "@/config/apiClient";
import { IDeposit } from "./types";

export const DepositForm = ({
  setOpenDialog,
  editDeposit,
  setEditDeposit,
  addDeposit,
  scheduleRunId,
  defaultDate,

}: {
  setOpenDialog?: (value: boolean) => void;
  editDeposit?: IDeposit | null;
  setEditDeposit?: (deposit: IDeposit | null) => void;
  addDeposit: (deposit: IDeposit) => void;
  scheduleRunId?: string;
  defaultDate?: Date;
}) => {
  const { users, formCloseModalRef } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!editDeposit?.id;

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
      date: defaultDate ? new Date(defaultDate).toISOString().split("T")[0] : getPeruDate(),
    },
  });

  // Prefill on edit
  useEffect(() => {
    if (!isEdit || !editDeposit) return;
    setUserSelected(editDeposit.user as IUser);
    form.setValue("amount", editDeposit.amount);
    form.setValue("date", new Date(editDeposit.date).toISOString().split('T')[0]);
  }, [isEdit, editDeposit, form]);

  const createDeposit = async (data: IDeposit) => {
    try {
      if (scheduleRunId) {
        data.scheduleRunId = scheduleRunId;
      }
      const res = await apiClient.post("/deposits", data);
      if (res.data) {
        addDeposit(res.data);
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

  const updateDeposit = async (id: string, data: Partial<IDeposit>) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.put(`/deposits/${id}`, data);
      if (res.data) {
        // Assuming context has updateDeposit function
        // updateDeposit(res.data);
        setOpenDialog?.(false);
        setEditDeposit?.(null);
        form.reset();
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (formData) => {
          if (isSubmitting) return;
          if (formData.amount <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
          }
          if (!userSelected) {
            alert("Debes seleccionar un usuario");
            return;
          }
          if (isEdit && editDeposit?.id) {
            await updateDeposit(editDeposit.id, {
              amount: formData.amount,
              userId: userSelected.id,
              date: formData.date,
            });
          } else {
            await createDeposit({
              amount: formData.amount,
              userId: userSelected.id,
              date: formData.date,
            });
          }
        })}
      >
        <h2>{isEdit ? "Editar Depósito" : "Deposito a Cuenta de ahorros."}</h2>
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