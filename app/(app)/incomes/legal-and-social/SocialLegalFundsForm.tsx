"use client";
import { set, useForm } from "react-hook-form";
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
import { ISocialFunds, ISocialFundsTransaction } from "@/types/ISocialFunds";
import apiClient from "@/config/apiClient";
import { toast } from "@/hooks/use-toast";
import { socialFundsData } from "@/constants";

export const SocialLegalFundsForm = ({
  setOpenDialog,
  socialFundsTransactions,
  setSocialFundsTransactions,
  socialFunds,
}: {
  socialFunds: ISocialFunds[];
  setOpenDialog?: (value: boolean) => void;
  socialFundsTransactions: ISocialFundsTransaction[];
  setSocialFundsTransactions: (value: ISocialFundsTransaction[]) => void;
}) => {
  const form = useForm({
    defaultValues: {
      socialFund: "",
      amount: 0,
    },
  });

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
    const res = await apiClient.post("/social-funds/create-transaction", {
      socialFundsId: form.getValues("socialFund"),
      amount: form.getValues("amount"),
      description: "Ingreso a fondo",
      date: new Date(),
    });
    if (res.data) {
      form.reset();
      setOpenDialog?.(false);

      //build the data to add to the transactions list
      const data = {
        ...res.data,
        socialFunds: {
          id: res.data.socialFundsId,
          name: socialFunds.find((f) => f.id === res.data.socialFundsId)
            ?.name as keyof typeof socialFundsData,
        },
      };
      setSocialFundsTransactions([data, ...socialFundsTransactions]);
      toast({
        title: "Ingreso a fondo creado.",
        description: "El ingreso a fondo fue creado correctamente.",
      });
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
                <select
                  cy-data="funds-type"
                  {...field}
                  className="border rounded px-2 py-1"
                >
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
                <Input cy-data="funds-amount" type="number" {...field} />
              </FormControl>
              <FormDescription>
                El monto que deseas ingresar al fondo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button cy-data="save-btn" type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
};
