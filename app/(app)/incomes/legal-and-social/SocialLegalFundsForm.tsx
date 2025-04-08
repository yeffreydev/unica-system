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
import apiClient from "@/config/apiClient";
import { toast } from "@/hooks/use-toast";
import { socialFundsData } from "@/constants";

export const SocialLegalFundsForm = ({
  socialFunds,
}: {
  socialFunds: ISocialFunds[];
}) => {
  const form = useForm({
    defaultValues: {
      socialFund: "",
      amount: 0,
    },
  });

  const onSubmit = async (data: any) => {
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
    const res = await apiClient.post("/social-funds/create-transaction", {
      socialFundsId: form.getValues("socialFund"),
      amount: form.getValues("amount"),
      description: "Ingreso a fondo",
      date: new Date(),
    });
    if (res.data) {
      form.reset();
      toast({
        title: "Ingreso a fondo creado.",
        description: "El ingreso a fondo fue creado correctamente.",
      });
      window && window.location.reload();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold">Nuevo ingreso a Fondos</h2>
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

        <div>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
};
