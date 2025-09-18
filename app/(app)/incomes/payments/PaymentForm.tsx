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

import { Button } from "../../../../components/ui/button";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "../../../../components/combobox/ComboboxUsers";
import { usePayment } from "./usePayment";
import { PaymentsContext } from "./PaymentsProvider";
import { apiCreateLoanPayment } from "./api";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const CapitalAndInterestForm = ({
  setOpenDialog,
}: {
  setOpenDialog?: (value: boolean) => void;
}) => {
  const { selectedUser, setSelectedUser, selectedLoan, setPayment } =
    usePayment();
  const { addPayment } = useContext(PaymentsContext);
  const { users } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",
      capital: "",
      interest: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const savePayment = async (capital: number, interest: number, date: string) => {
    setIsSubmitting(true);
    try {
      console.log("Saving payment", { capital, interest, date });
     const data = await apiCreateLoanPayment({
        userId: selectedUser?.id || "",
        date,
        amount: capital,
        interest, 
      });

      console.log("Payment saved", data);
      addPayment?.(data);
      setSelectedUser(null);
      setOpenDialog?.(false);
      setPayment({ amount: 0, interest: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (isSubmitting) return; // Prevent multiple submissions
          const capital = parseFloat(data.capital) || 0;
          const interest = parseFloat(data.interest) || 0;
          if (capital < 0 || interest < 0) {
            alert("Los valores deben ser números positivos");
            return;
          }
          console.log("Form data", data);
          console.log("Selected user", selectedUser);
          await savePayment(capital, interest, data.date);
        })}
        className="flex flex-col gap-4"
      >
        {currentPage === 0 && (
          <FormField
            control={form.control}
            name="username"
            render={() => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <div>
                    <ComboBoxUsers
                      controller={{
                        userSelected: selectedUser,
                        setUserSelected: setSelectedUser,
                      }}
                      users={users}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  El usuario que paga
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentPage === 1 && (
          <div className="flex flex-col gap-4">
            {selectedLoan && (
              <div className="flex gap-2 items-center justify-between border rounded-lg p-2 cursor-pointer hover:bg-slate-200">
                <div className="flex flex-col">
                  <span>
                    {formatDate(new Date(selectedLoan?.date ?? new Date()))}
                  </span>
                  <span>Prestamo {selectedLoan.loanType?.name}</span>
                </div>
                <span>S/. {selectedLoan.amount}</span>
              </div>
            )}
            <FormField
              control={form.control}
              name="capital"
              rules={{
                validate: (value) =>
                  value === "" ||
                  (!isNaN(parseFloat(value)) && parseFloat(value) >= 0) ||
                  "Debe ser un número positivo",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pago Capital</FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interest"
              rules={{
                validate: (value) =>
                  value === "" ||
                  (!isNaN(parseFloat(value)) && parseFloat(value) >= 0) ||
                  "Debe ser un número positivo",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pago Interés</FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Pago</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <div className="flex items-center justify-end gap-2 py-2">
          {currentPage > 0 && (
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Atras
            </Button>
          )}
          {currentPage < 1 && (
            <Button
              type="button"
              variant="outline"
              cy-data="next-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          )}
          {currentPage === 1 && (
            <div>
              <Button cy-data="save-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};