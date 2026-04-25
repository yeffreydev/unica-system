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
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "../../../../components/combobox/ComboboxUsers";
import { usePayment } from "./usePayment";
import { PaymentsContext } from "./PaymentsProvider";
import { apiCreateLoanPayment, apiUpdateLoanPayment } from "./api";
import { ILoanPayment } from "./types";
import { IUser } from "@/types/IUser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const CapitalAndInterestForm = ({
  setOpenDialog,
  editingPayment,
  onClose,
}: {
  setOpenDialog?: (value: boolean) => void;
  editingPayment?: ILoanPayment | null;
  onClose?: () => void;
}) => {
  const { selectedUser, setSelectedUser, setPayment } = usePayment();
  const { addPayment, updatePayment } = useContext(PaymentsContext);
  const { users } = useContext(AppContext);
  const isEdit = !!editingPayment;
  const [currentPage, setCurrentPage] = useState(isEdit ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<{ capital: number; interest: number; date: string } | null>(null);
  const [editUser, setEditUser] = useState<IUser | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      capital: editingPayment ? String(editingPayment.amount) : "",
      interest: editingPayment ? String(editingPayment.interest) : "",
      date: editingPayment
        ? new Date(editingPayment.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (editingPayment) {
      form.reset({
        username: "",
        capital: String(editingPayment.amount),
        interest: String(editingPayment.interest),
        date: new Date(editingPayment.date).toISOString().split("T")[0],
      });
      setEditUser(editingPayment.user ?? null);
    }
  }, [editingPayment, form]);

  const handleClose = () => {
    setSelectedUser(null);
    setPayment({ amount: 0, interest: 0 });
    setOpenDialog?.(false);
    onClose?.();
  };

  const savePayment = async (capital: number, interest: number, date: string) => {
    setIsSubmitting(true);
    try {
      if (isEdit && editingPayment?.id) {
        const data = await apiUpdateLoanPayment(editingPayment.id, {
          userId: editingPayment.userId,
          date,
          amount: capital,
          interest,
        });
        updatePayment?.(data);
      } else {
        const data = await apiCreateLoanPayment({
          userId: selectedUser?.id || "",
          date,
          amount: capital,
          interest,
        });
        addPayment?.(data);
      }
      handleClose();
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el pago. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
      setPendingData(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            if (isSubmitting) return;
            const capital = parseFloat(data.capital) || 0;
            const interest = parseFloat(data.interest) || 0;
            if (capital < 0 || interest < 0) {
              alert("Los valores deben ser números positivos");
              return;
            }
            if (!isEdit && !selectedUser) {
              alert("Debes seleccionar un usuario");
              return;
            }
            setPendingData({ capital, interest, date: data.date });
            setShowConfirm(true);
          })}
          className="flex flex-col gap-4"
        >
          {currentPage === 0 && !isEdit && (
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
                  <FormDescription>El usuario que paga</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentPage === 1 && (
            <div className="flex flex-col gap-4">
              {isEdit && editUser && (
                <div className="rounded border p-2 text-sm bg-muted/40">
                  <div className="font-medium">
                    {editUser.name} {editUser.lastname}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {editUser.email}
                  </div>
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
            {!isEdit && currentPage > 0 && (
              <Button
                type="button"
                variant={"outline"}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Atras
              </Button>
            )}
            {!isEdit && currentPage < 1 && (
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
              <Button cy-data="save-btn" type="submit" disabled={isSubmitting}>
                {isEdit ? "Guardar cambios" : "Guardar"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      <Dialog open={showConfirm} onOpenChange={(o) => !isSubmitting && setShowConfirm(o)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Confirmar edición" : "Confirmar pago"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "¿Deseas guardar los cambios de este pago?"
                : "¿Deseas registrar este pago?"}
            </DialogDescription>
          </DialogHeader>
          {pendingData && (
            <div className="text-sm space-y-1">
              <div>Capital: <span className="font-medium">S/. {pendingData.capital.toFixed(2)}</span></div>
              <div>Interés: <span className="font-medium">S/. {pendingData.interest.toFixed(2)}</span></div>
              <div>Fecha: <span className="font-medium">{pendingData.date}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                pendingData &&
                savePayment(pendingData.capital, pendingData.interest, pendingData.date)
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
