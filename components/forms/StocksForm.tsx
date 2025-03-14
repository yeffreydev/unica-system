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
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "../combobox/ComboboxUsers";
import { IStock } from "@/types/IStock";
import apiClient from "@/config/apiClient";
import { IUser } from "@/types/IUser";
import { StockContext } from "@/app/(app)/incomes/stocks/StockContext";

export const StocksForm = () => {
  const {
    users,
    formCloseModalRef,
    bank: { mainStock },
  } = useContext(AppContext);
  const { addStock } = useContext(StockContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
    },
  });

  const buyStock = async (data: IStock) => {
    try {
      const res = await apiClient.post("/stocks/buy", data);
      if (res.status === 201) {
        addStock!(res.data);
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
          console.log(formData);
          console.log(userSelected);

          const data: IStock = {
            name: "",
            price: 0,
            userId: userSelected?.id,
            quantity: formData.amount,
            id: mainStock.id,
          };
          buyStock(data);
        })}
      >
        <h2>Compra de Accciones.</h2>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input type="number" {...field} />
                  <p>S/ {field.value * mainStock.price}</p>
                </div>
              </FormControl>
              <FormDescription>
                La cantidad de acciones que deseas comprar. (1 acción = S/ 10)
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
