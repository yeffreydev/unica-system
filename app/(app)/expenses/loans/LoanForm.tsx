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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "../../../../components/combobox/ComboboxUsers";
import { ILoan, ILoanType } from "@/types/ILoan";
import apiClient from "@/config/apiClient";
import { IUser } from "@/types/IUser";
import { LoansContext } from "@/app/(app)/expenses/loans/LoansProvider";
import { ComboboxLoanTypes } from "@/components/combobox/ComboboxLoanTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateInstallments,
  InstallmentInterface,
} from "./utils/installments";
import { loanTypesData } from "@/constants";
import { formatCurrency } from "@/lib/utils";

export const LoanForm = ({
  loan,
  setIsOpenDialog,
}: {
  loan?: ILoan | null;
  setIsOpenDialog?: (value: boolean) => void;
}) => {
  const { users, formCloseModalRef, bank } = useContext(AppContext);
  const interestRate = bank?.bank?.loanInterestRate ?? 0.02;
  const { addLoan } = useContext(LoansContext);
  const [installments, setInstallments] = useState<InstallmentInterface[]>([]);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [loanTypeSelected, setLoanTypeSelected] = useState<ILoanType | null>(
    null
  );
  const [loanTypes, setLoanTypes] = useState<ILoanType[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: loan?.amount || 0,
      loanType: "",
      months: loan?.initalInstallments || 0,
      date: loan?.date || new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (loan) {
      setUserSelected(loan?.user as IUser);
      setLoanTypeSelected({
        id: loan?.loanTypeId,
        name: loan?.loanTypeId
          ? (loan?.loanType?.name as keyof typeof loanTypesData)
          : "",
      });
    }
  }, [loan]);

  const createLoan = async (data: ILoan) => {
    try {
      const res = await apiClient.post("/loans", data);
      if (res.status === 201) {
        addLoan!(res.data);
        form.reset();
        formCloseModalRef?.current?.click();
        if (setIsOpenDialog) setIsOpenDialog(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        const res = await apiClient.get("/loans/types");
        console.log(res.data);
        setLoanTypes(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLoanTypes();
  }, []);

  const handleNextPage = () => {
    if (currentPage == 1) {
      if (form.getValues("amount") <= 0) {
        alert("La cantidad debe ser mayor a 0");
        return;
      }
      if (!userSelected) {
        alert("Debes seleccionar un usuario");
        return;
      }
    }
    if (currentPage == 2) {
      if (!loanTypeSelected) {
        alert("Debes seleccionar un tipo de prestamo");
        return;
      }
      if (form.getValues("months") <= 0) {
        alert("La cantidad de meses debe ser mayor a 0");
        return;
      }
      console.log(
        loanTypeSelected.name as keyof typeof loanTypesData,
        form.getValues("amount"),
        interestRate,
        form.getValues("months"),
        new Date(form.getValues("date") + 'T00:00:00-05:00')
      );
      const installments = calculateInstallments(
        loanTypeSelected.name as keyof typeof loanTypesData,
        form.getValues("amount"),
        interestRate,
        form.getValues("months"),
        new Date(form.getValues("date") + 'T00:00:00-05:00')
      );
      console.log(installments);
      setInstallments(installments);
    }
    if (currentPage < 3) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBackPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    console.log(installments);
  }, [installments]);

  return (
    <Form {...form}>
      <form
        className="max-h-[calc(100vh-200px)] w-full flex flex-col gap-2"
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

          const data: ILoan = {
            amount: formData.amount,
            userId: userSelected?.id,
            loanTypeId: loanTypeSelected?.id as string,
            initalInstallments: formData.months,
            date: new Date(formData.date + 'T00:00:00-05:00'),
            interestRate,
          };
          createLoan(data);
        })}
      >
        <div className="flex flex-col gap-2 overflow-y-scroll h-full">
          <h2 className="text-xl font-semibold">Prestamo de Socio.</h2>
          <hr />
          {currentPage === 1 && (
            <>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input cy-data="loan-amount" type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      El monto que deseas prestar.
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
                          cy-data="loan-user"
                          controller={{ userSelected, setUserSelected }}
                          users={users}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      El usuario quien recibira el prestamo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {currentPage === 2 && (
            <>
              <FormField
                control={form.control}
                name="loanType"
                render={() => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Tipo de Prestamo</FormLabel>
                    <FormControl>
                      <ComboboxLoanTypes
                        controller={{ loanTypeSelected, setLoanTypeSelected }}
                        loanTypes={loanTypes}
                      />
                    </FormControl>
                    <FormDescription>
                      El tipo de prestamo que deseas realizar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="months"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Meses</FormLabel>
                      <FormControl>
                        <Input cy-data="loan-months" type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        La cantidad de meses que deseas pagar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? typeof field.value === "string"
                                ? field.value
                                : (field.value as Date)
                                    .toISOString()
                                    .split("T")[0]
                              : ""
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        La fecha de inicio del prestamo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
          {currentPage === 3 && (
            <div className="space-y-2">
              <Button
                variant={"outline"}
                className="flex data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-1"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={""} alt={userSelected?.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userSelected?.name + " " + userSelected?.lastname}
                  </span>
                  <span className="truncate text-xs">
                    {userSelected?.email}
                  </span>
                </div>
                {/* <ChevronsUpDown className="ml-auto size-4" /> */}
              </Button>
              <div className="flex flex-col gap-2">
                <h2>Monto: S/ {form.getValues("amount")}</h2>
                <h2>Tipo de Préstamo: {loanTypeSelected?.name}</h2>
                <h2 className="text-lg font-semibold">
                  Cuotas: {form.getValues("months")}
                </h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    {["Fecha", "Capital", "Interés", "Cuota", "Saldo"].map(
                      (header) => (
                        <TableHead key={header}>{header}</TableHead>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.date.toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(item.payment)}</TableCell>
                      <TableCell>{formatCurrency(item.interest)}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          Number(item.payment) + Number(item.interest)
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(item.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 py-2">
          {currentPage > 1 && (
            <Button type="button" variant={"outline"} onClick={handleBackPage}>
              Atras
            </Button>
          )}
          {currentPage < 3 && (
            <Button
              cy-data="next-btn"
              type="button"
              variant="outline"
              onClick={handleNextPage}
            >
              Siguiente
            </Button>
          )}
          {currentPage === 3 && (
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
