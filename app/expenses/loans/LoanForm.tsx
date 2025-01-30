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
} from "../../../components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/auth/AppContext";
import { ComboBoxUsers } from "../../../components/combobox/ComboboxUsers";
import { ILoan, ILoanType } from "@/types/ILoan";
import apiClient from "@/config/apiClient";
import { IUser } from "@/types/IUser";
import { LoansContext } from "@/app/expenses/loans/LoansProvider";
import { ComboboxLoanTypes } from "@/components/combobox/ComboboxLoanTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const LoanForm = () => {
  const { users, formCloseModalRef } = useContext(AppContext);
  const { addLoan } = useContext(LoansContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [loanTypeSelected, setLoanTypeSelected] = useState<ILoanType | null>(
    null
  );
  const [loanTypes, setLoanTypes] = useState<ILoanType[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: 0,
      loanType: "",
      months: 0,
    },
  });

  const createLoan = async (data: ILoan) => {
    try {
      const res = await apiClient.post("/loans", data);
      if (res.status === 201) {
        addLoan!(res.data);
        form.reset();
        formCloseModalRef?.current?.click();
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

          const data: ILoan = {
            amount: formData.amount,
            userId: userSelected?.id,
            loanTypeId: loanTypeSelected?.id as string,
            months: formData.months,
          };
          createLoan(data);
        })}
      >
        <h2 className="text-xl font-semibold">Prestamo de Socio.</h2>
        <hr />
        <br />
        {currentPage === 1 && (
          <>
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
                    El monto que deseas prestar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
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
          </>
        )}
        {currentPage === 2 && (
          <>
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
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
            <FormField
              control={form.control}
              name="months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meses</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    La cantidad de meses que deseas pagar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                <span className="truncate text-xs">{userSelected?.email}</span>
              </div>
              {/* <ChevronsUpDown className="ml-auto size-4" /> */}
            </Button>
            <hr />
            <h2>Monto: S/ {form.getValues("amount")}</h2>
            <h2>Tipo de Préstamo: {loanTypeSelected?.name}</h2>
            <hr />
            <h2 className="text-lg font-semibold">
              Cuotas: {form.getValues("months")}
            </h2>

            <Table>
              <TableHeader>
                <TableRow>
                  {["Fecha", "Capital", "Interés", "Total", "Saldo"].map(
                    (header) => (
                      <TableHead key={header}>{header}</TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[900, 800].map((saldo, index) => (
                  <TableRow key={index}>
                    <TableCell>{`01/0${index + 1}/2022`}</TableCell>
                    <TableCell>1000</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>1100</TableCell>
                    <TableCell>{saldo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 py-2">
          {currentPage > 1 && (
            <Button variant={"outline"} onClick={handleBackPage}>
              Atras
            </Button>
          )}
          {currentPage < 3 && (
            <Button variant="outline" onClick={handleNextPage}>
              Siguiente
            </Button>
          )}
          {currentPage === 3 && (
            <div>
              <Button type="submit">Guardar</Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};
