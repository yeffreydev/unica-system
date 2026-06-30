import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarClock, CheckCircle2, Clock, Pencil, Trash } from "lucide-react";
import { ILoanInstallment } from "@/types/ILoan";
import apiClient from "@/config/apiClient";
import { formatCurrency } from "@/lib/utils";

function toDateInputValue(value: Date | string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export function LoansInstallments({
  isOpen,
  onOpenChange,
  installments,
  onChanged,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  installments: ILoanInstallment[];
  onChanged?: () => void;
}) {
  const [editing, setEditing] = useState<ILoanInstallment | null>(null);
  const [deleting, setDeleting] = useState<ILoanInstallment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editDate, setEditDate] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const [editInterest, setEditInterest] = useState("");
  const [editPaid, setEditPaid] = useState(false);

  const isPaid = (i: ILoanInstallment) =>
    Boolean(i.paid) || i.status === "PAID";

  const sorted = [...installments].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  const totalCount = sorted.length;
  const paidCount = sorted.filter(isPaid).length;
  const pendingCount = totalCount - paidCount;
  const totalAmount = sorted.reduce(
    (acc, i) => acc + (i.payment ?? 0) + (i.interest ?? 0),
    0
  );
  const pendingAmount = sorted
    .filter((i) => !isPaid(i))
    .reduce((acc, i) => acc + (i.payment ?? 0) + (i.interest ?? 0), 0);

  const openEdit = (installment: ILoanInstallment) => {
    setEditing(installment);
    setEditDate(toDateInputValue(installment.date));
    setEditPayment(String(installment.payment ?? 0));
    setEditInterest(String(installment.interest ?? 0));
    setEditPaid(Boolean(installment.paid || installment.status === "PAID"));
  };

  const handleSaveEdit = async () => {
    if (!editing?.id) return;
    setIsSaving(true);
    try {
      await apiClient.put(`/loans/installments/${editing.id}`, {
        payment: parseFloat(editPayment) || 0,
        interest: parseFloat(editInterest) || 0,
        date: editDate,
        paid: editPaid,
      });
      setEditing(null);
      onChanged?.();
    } catch (error) {
      console.error("Error updating installment:", error);
      alert("Error al actualizar la cuota");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting?.id) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/loans/installments/${deleting.id}`);
      setDeleting(null);
      onChanged?.();
    } catch (error) {
      console.error("Error deleting installment:", error);
      alert("Error al eliminar la cuota");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          cy-data="installments-dialog"
          className="sm:max-w-[560px] max-h-[90vh] flex flex-col"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Cuotas del préstamo
            </DialogTitle>
            <DialogDescription>
              {totalCount} {totalCount === 1 ? "cuota" : "cuotas"} en total ·{" "}
              {paidCount} pagadas · {pendingCount} pendientes
            </DialogDescription>
          </DialogHeader>

          {/* Resumen */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total del cronograma
              </p>
              <p className="text-lg font-bold mt-0.5">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Pendiente por pagar
              </p>
              <p className="text-lg font-bold mt-0.5 text-destructive">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>

          <ScrollArea className="h-[420px] w-full rounded-xl border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold text-right">
                    Abono
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Interés
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Cuota
                  </TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody cy-data="installments-table-body">
                {sorted.length ? (
                  sorted.map((item, index) => {
                    const paid = isPaid(item);
                    return (
                      <TableRow
                        key={item.id ?? index}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="text-muted-foreground">
                          {item.installment_number ?? index + 1}
                        </TableCell>
                        <TableCell>
                          {item.date
                            ? new Intl.DateTimeFormat("es-ES", {
                                dateStyle: "medium",
                              }).format(new Date(item.date))
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.payment ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.interest ?? 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(
                            (item.interest ?? 0) + (item.payment ?? 0)
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              paid
                                ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400"
                            }`}
                          >
                            {paid ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {paid ? "Pagada" : "Pendiente"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleting(item)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron cuotas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" className="w-2" />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit installment dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Editar cuota</DialogTitle>
            <DialogDescription>
              Modifica los valores de la cuota seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Fecha</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-payment">Abono</Label>
                <Input
                  id="edit-payment"
                  type="number"
                  step="0.01"
                  min={0}
                  value={editPayment}
                  onChange={(e) => setEditPayment(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-interest">Interés</Label>
                <Input
                  id="edit-interest"
                  type="number"
                  step="0.01"
                  min={0}
                  value={editInterest}
                  onChange={(e) => setEditInterest(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="edit-paid">Pagada</Label>
              <Switch
                id="edit-paid"
                checked={editPaid}
                onCheckedChange={setEditPaid}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar cuota</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta cuota? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
