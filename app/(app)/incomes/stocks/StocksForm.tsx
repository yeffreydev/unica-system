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
import { IStock } from "@/types/IStock";
import apiClient from "@/config/apiClient";
import { IUser } from "@/types/IUser";
import { StockContext } from "@/app/(app)/incomes/stocks/StockContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";

export const StocksForm = ({
  setOpenDialog,
  editStock,
}: {
  setOpenDialog?: (value: boolean) => void;
  editStock?: IStock | null;
}) => {
  const {
    users,
    formCloseModalRef,
    bank: { mainStock },
  } = useContext(AppContext);
  const { addStock, setStocks, stocks, closeEdit } = useContext(StockContext);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!editStock?.id;
  const form = useForm({
    defaultValues: {
      username: "",
      amount: editStock?.quantity || 0,
      date: (editStock?.date ? new Date(editStock.date) : new Date())
        .toISOString()
        .slice(0, 10),
    },
  });

  // Prefill user selection and skip to step 2 on edit
  useEffect(() => {
    if (!isEdit) return;
    // hydrate from editStock when dialog opens
    if (editStock?.user) {
      setUserSelected(editStock.user as IUser);
    }
    setStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, !!editStock]);

  const buyStock = async (data: IStock & { date?: string }) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post("/stocks/buy", data);
      if (res.status === 201) {
        addStock!(res.data);
        setOpenDialog?.(false);
        form.reset();
        formCloseModalRef?.current?.click();
      }
    } catch (e) {
      console.log(e);
      setOpenDialog?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStock = async (id: string, data: Partial<IStock> & { date?: string }) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.put(`/stocks/${id}`, data);
      if (res.status === 200) {
        // merge to preserve nested user relation
        const updated = stocks.map((s) => (s.id === id ? { ...s, ...res.data } : s));
        setStocks?.(updated);
        setOpenDialog?.(false);
        closeEdit?.();
        form.reset();
        formCloseModalRef?.current?.click();
      }
    } catch (e) {
      console.log(e);
      alert("No se pudo actualizar. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // initialize form when editing
  // and jump directly to step 2
  
  

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (formData) => {
          if (isSubmitting) return; // Prevent multiple submissions
          if (formData.amount === 0) {
            alert("La cantidad no puede ser 0");
            return;
          }
          if (!userSelected) {
            alert("Debes seleccionar un usuario");
            return;
          }
          if (!formData.date) {
            alert("Debes seleccionar una fecha");
            return;
          }
          console.log(formData);
          console.log(userSelected);

          const payload: Partial<IStock> & { date?: string } = {
            userId: userSelected?.id,
            quantity: formData.amount,
            date: formData.date,
          };
          if (isEdit && editStock?.id) {
            await updateStock(editStock.id, payload);
          } else {
            const data: IStock & { date?: string } = {
              name: "",
              price: 0,
              userId: userSelected?.id,
              quantity: formData.amount,
              id: mainStock.id,
              date: formData.date,
            };
            await buyStock(data);
          }
        })}
      >
        <h2>{isEdit ? "Editar compra de acciones" : "Compra de Accciones."}</h2>

        {step === 1 && !isEdit && (
          <div className="flex flex-col gap-4">
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

            <Card>
              <CardHeader>
                <CardTitle>Información del usuario</CardTitle>
                <CardDescription>Pre-visualización de datos del socio seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                {userSelected ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nombre</span>
                      <div className="font-medium">{userSelected.name} {userSelected.lastname}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DNI</span>
                      <div className="font-medium">{userSelected.dni}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Correo</span>
                      <div className="font-medium">{userSelected.email}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Roles</span>
                      {/* <div className="font-medium">{userSelected.roles?.join(", ")}</div> */}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    Selecciona un usuario para ver su información.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  if (!userSelected) {
                    alert("Debes seleccionar un usuario");
                    return;
                  }
                  setStep(2);
                }}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {(!isEdit && step === 2) || isEdit ? (
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Selecciona la fecha de la compra de acciones.
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
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Input cy-data="stocks-amount" type="number" {...field} />
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

            <div className="flex items-center justify-between">
              {!isEdit && (
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Volver
                </Button>
              )}
              <Button cy-data="save-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : (isEdit ? "Actualizar" : "Guardar")}
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </Form>
  );
};
