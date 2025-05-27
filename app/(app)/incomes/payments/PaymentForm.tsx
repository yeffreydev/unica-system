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
import { ILoanInstallment } from "@/types/ILoan";
import { usePayment } from "./usePayment";
import apiClient from "@/config/apiClient";
import { PaymentsContext } from "./PaymentsProvider";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const InstallmentTable = ({
  installments,
  payment,
  setPayment,
}: {
  installments: ILoanInstallment[];
  payment: {
    amount: number;
    interest: number;
  };
  setPayment: (payment: { amount: number; interest: number }) => void;
}) => {
  const installment = installments[0];

  if (!installment) {
    return <div>No hay pagos pendientes</div>;
  }
  return (
    <div className="flex flex-col p-2">
      <div>
        <span className="italic text-sm">Tu proximo pago a realizar</span>
      </div>
      <div
        className="flex font-semibold
      "
      >
        <div className="flex-1">Fecha</div>
        <div className="flex-1">Pago</div>
        <div className="flex-1">Interés</div>
      </div>
      <div className="flex hover:bg-slate-300 py-2 cursor-pointer">
        <div className="flex-1">
          <span>{formatDate(new Date(installment.date))}</span>
        </div>
        <div className="flex-1">
          <input
            type="text"
            className="w-[100px] text-right"
            cy-data="installment-amount"
            value={payment.amount}
            onChange={(e) => {
              setPayment({
                ...payment,
                amount: !isNaN(parseFloat(e.target.value))
                  ? parseFloat(e.target.value)
                  : 0,
              });
            }}
          />
          <span>
            {installment.payment > payment.amount ? (
              <span className="text-red-500">
                {`(Deuda: S/. ${payment.amount - installment.payment})`}
              </span>
            ) : (
              <span className="text-green-500">
                {`(Deuda: S/. ${installment.payment - payment.amount})`}
              </span>
            )}
          </span>
        </div>
        <div className="flex-1">
          <input
            type="text"
            disabled
            className="w-[100px] text-right"
            value={payment.interest}
            onChange={(e) => {
              setPayment({
                ...payment,
                interest: !isNaN(parseFloat(e.target.value))
                  ? parseFloat(e.target.value)
                  : 0,
              });
            }}
          />
          <span>
            {installment.interest > payment.interest ? (
              <span className="text-red-500">
                {`(Deuda: S/. ${payment.interest - installment.interest})`}
              </span>
            ) : (
              <span className="text-green-500">
                {`(Deuda: S/. ${installment.interest - payment.interest})`}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export const CapitalAndInterestForm = ({
  setOpenDialog,
}: {
  setOpenDialog?: (value: boolean) => void;
}) => {
  const { selectedUser, setSelectedUser, selectedLoan, payment, setPayment } =
    usePayment();
  const { addPayment } = useContext(PaymentsContext);
  const { users } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(0);

  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
    },
  });

  const savePayment = async () => {
    if (!selectedLoan) {
      return;
    }
    const res = await apiClient.post("loans/pay-loan/" + selectedLoan.id, {
      paymentAmount: payment.amount,
      interestAmount: payment.interest,
    });

    const data = res.data;
    if (!data) {
      console.error("Error al guardar el pago");
      return;
    }
    addPayment?.(res.data);
    console.log("Payment data", data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          console.log("Form data", data);
          savePayment();
          setSelectedUser(null);
          setOpenDialog?.(false);

          setPayment({ amount: 0, interest: 0 });
        })}
        className="flex flex-col gap-4"
      >
        <h2>Pagos E Intereses </h2>
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
                  El usuario al que deseas depositar el monto.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentPage === 1 && (
          <div className="flex flex-col">
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
            <InstallmentTable
              payment={payment}
              setPayment={setPayment}
              installments={selectedLoan?.loanInstallments ?? []}
            />
            <div className="flex items-center justify-between border-t mt-2 pt-2">
              <span>Total</span>
              <span>
                S/.{" "}
                {selectedLoan?.loanInstallments?.reduce(
                  (acc, installment) => acc + installment.payment,
                  0
                ) ?? 0}
              </span>
            </div>
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
              <Button cy-data="save-btn" type="submit">
                Guardar
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};
