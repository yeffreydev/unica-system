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
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Layers,
  Pencil,
  Percent,
  User as UserIcon,
} from "lucide-react";

export const LoanForm = ({
  loan,
  setIsOpenDialog,
}: {
  loan?: ILoan | null;
  setIsOpenDialog?: (value: boolean) => void;
}) => {
  const { users, formCloseModalRef, bank } = useContext(AppContext);
  const defaultInterestRate = bank?.bank?.loanInterestRate ?? 0.02;
  const { addLoan, updateLoan } = useContext(LoansContext);
  const isEdit = !!loan?.id;
  const [installments, setInstallments] = useState<InstallmentInterface[]>([]);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [loanTypeSelected, setLoanTypeSelected] = useState<ILoanType | null>(
    null
  );
  const [loanTypes, setLoanTypes] = useState<ILoanType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const form = useForm({
    defaultValues: {
      username: "", // Asegúrate de definir un valor inicial
      amount: loan?.amount || 0,
      loanType: "",
      months: loan?.initalInstallments || 0,
      date: loan?.date
        ? new Date(loan.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      // Stored/displayed as integer percent: 2 = 0.02
      interestRate: (loan?.interestRate ?? defaultInterestRate) * 100,
    },
  });
  // Decimal rate used for calculations (2 -> 0.02)
  const interestRate = (Number(form.watch("interestRate")) || 0) / 100;

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

  const saveLoan = async (data: ILoan) => {
    setIsSaving(true);
    try {
      if (isEdit) {
        const res = await apiClient.put(`/loans/${loan!.id}`, data);
        if (res.status === 200 || res.status === 201) {
          updateLoan!(res.data);
          formCloseModalRef?.current?.click();
          if (setIsOpenDialog) setIsOpenDialog(false);
        }
        return;
      }
      const res = await apiClient.post("/loans", data);
      if (res.status === 201) {
        addLoan!(res.data);
        form.reset();
        formCloseModalRef?.current?.click();
        if (setIsOpenDialog) setIsOpenDialog(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        const res = await apiClient.get("/loans/types");
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
      const installments = calculateInstallments(
        loanTypeSelected.name as keyof typeof loanTypesData,
        form.getValues("amount"),
        interestRate,
        form.getValues("months"),
        new Date(form.getValues("date") + "T00:00:00-05:00")
      );
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

  // ---------------------------------------------------------------------------
  // Modo edición: formulario simple. Solo se editan monto, fecha, tipo de
  // préstamo y usuario. NO se regeneran cuotas.
  // ---------------------------------------------------------------------------
  if (isEdit) {
    return (
      <Form {...form}>
        <form
          className="w-full flex flex-col"
          onSubmit={form.handleSubmit((formData) => {
            if (formData.amount <= 0) {
              alert("La cantidad debe ser mayor a 0");
              return;
            }
            if (!userSelected) {
              alert("Debes seleccionar un usuario");
              return;
            }
            if (!loanTypeSelected?.id) {
              alert("Debes seleccionar un tipo de prestamo");
              return;
            }
            const data: ILoan = {
              amount: Number(formData.amount),
              userId: userSelected?.id,
              loanTypeId: loanTypeSelected?.id as string,
              date: new Date(formData.date + "T00:00:00-05:00"),
            };
            saveLoan(data);
          })}
        >
          <div className="flex items-center gap-3 pb-4 mb-4 border-b">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                Editar préstamo
              </h2>
              <p className="text-xs text-muted-foreground">
                No se regeneran las cuotas existentes.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    Monto
                  </FormLabel>
                  <FormControl>
                    <Input cy-data="loan-amount" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Usuario
                  </FormLabel>
                  <FormControl>
                    <div>
                      <ComboBoxUsers
                        cy-data="loan-user"
                        controller={{ userSelected, setUserSelected }}
                        users={users}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loanType"
              render={() => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Tipo de préstamo
                  </FormLabel>
                  <FormControl>
                    <ComboboxLoanTypes
                      controller={{ loanTypeSelected, setLoanTypeSelected }}
                      loanTypes={loanTypes}
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
                  <FormLabel className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Fecha
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? typeof field.value === "string"
                            ? field.value
                            : (field.value as Date).toISOString().split("T")[0]
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpenDialog?.(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button cy-data="save-btn" type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // ---------------------------------------------------------------------------
  // Modo creación: wizard de 3 pasos.
  // ---------------------------------------------------------------------------
  const steps = [
    { n: 1, label: "Monto y socio" },
    { n: 2, label: "Condiciones" },
    { n: 3, label: "Resumen" },
  ];

  return (
    <Form {...form}>
      <form
        className="max-h-[calc(100vh-200px)] w-full flex flex-col gap-3"
        onSubmit={form.handleSubmit((formData) => {
          if (formData.amount <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
          }
          if (!userSelected) {
            alert("Debes seleccionar un usuario");
            return;
          }

          const data: ILoan = {
            amount: Number(formData.amount),
            userId: userSelected?.id,
            loanTypeId: loanTypeSelected?.id as string,
            initalInstallments: Number(formData.months),
            date: new Date(formData.date + "T00:00:00-05:00"),
            interestRate: (Number(formData.interestRate) || 0) / 100,
          };
          saveLoan(data);
        })}
      >
        <div className="pb-3 border-b">
          <h2 className="text-lg font-semibold">Nuevo préstamo de socio</h2>
          {/* Stepper */}
          <div className="flex items-center gap-2 mt-3">
            {steps.map((step, i) => (
              <div key={step.n} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      currentPage === step.n
                        ? "bg-primary text-primary-foreground"
                        : currentPage > step.n
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentPage > step.n ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      step.n
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      currentPage >= step.n
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px flex-1 ${
                      currentPage > step.n ? "bg-primary/40" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto h-full pr-1">
          {currentPage === 1 && (
            <>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      Monto
                    </FormLabel>
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
                    <FormLabel className="flex items-center gap-1.5">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      Usuario
                    </FormLabel>
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
                    <FormLabel className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      Tipo de Prestamo
                    </FormLabel>
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
                      <FormDescription>Cantidad de cuotas.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        Fecha
                      </FormLabel>
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
                      <FormDescription>Inicio del préstamo.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      Tasa de Interés (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        cy-data="loan-interest-rate"
                        type="number"
                        step="1"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Porcentaje mensual entero. Ej: 2 = 2% (0.02).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {currentPage === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={""} alt={userSelected?.name} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {userSelected?.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userSelected?.name + " " + userSelected?.lastname}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userSelected?.email}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Monto</p>
                  <p className="font-semibold">
                    {formatCurrency(form.getValues("amount"))}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-semibold truncate">
                    {loanTypeSelected?.name
                      ? loanTypesData[
                          loanTypeSelected.name as keyof typeof loanTypesData
                        ] ?? loanTypeSelected.name
                      : "-"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Tasa</p>
                  <p className="font-semibold">
                    {(interestRate * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Cuotas</p>
                  <p className="font-semibold">{form.getValues("months")}</p>
                </div>
              </div>

              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {["Fecha", "Capital", "Interés", "Cuota", "Saldo"].map(
                        (header) => (
                          <TableHead key={header} className="font-semibold">
                            {header}
                          </TableHead>
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
                        <TableCell className="font-medium">
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
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t">
          {currentPage > 1 && (
            <Button type="button" variant={"outline"} onClick={handleBackPage}>
              Atras
            </Button>
          )}
          {currentPage < 3 && (
            <Button
              cy-data="next-btn"
              type="button"
              onClick={handleNextPage}
            >
              Siguiente
            </Button>
          )}
          {currentPage === 3 && (
            <Button cy-data="save-btn" type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
