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

export const CapitalAndInterestForm = () => {
  const { users } = useContext(AppContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
    },
  });

  return (
    <Form {...form}>
      <h2>Pagos E Intereses </h2>
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
      <div className="flex flex-col">
        <span>Ahorros: S/. 5000</span>
        <span>Acciones: S/. 5000</span>
        <span>Capital Prestado: S/. 500</span>
        <span>Disponibles para prestar: S/.5000</span>
      </div>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pago Capital</FormLabel>
            <FormControl>
              <div className="flex flex-col gap-2">
                <Input type="number" {...field} />
                <p>S/ {field.value * 10}</p>
              </div>
            </FormControl>
            <FormDescription>Monto de capital a pagar</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pago Intereses</FormLabel>
            <FormControl>
              <div className="flex flex-col gap-2">
                <Input type="number" {...field} />
              </div>
            </FormControl>
            <FormDescription>monto de interes a pagar</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Button type="submit">Guardar</Button>
      </div>
    </Form>
  );
};
