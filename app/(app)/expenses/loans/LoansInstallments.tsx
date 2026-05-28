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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash } from "lucide-react";
import { ILoanInstallment } from "@/types/ILoan";
import apiClient from "@/config/apiClient";

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

  const columns: ColumnDef<ILoanInstallment>[] = [
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <div>
          {row.original?.date
            ? new Intl.DateTimeFormat("es-ES", {
                dateStyle: "medium",
              }).format(new Date(row.original.date))
            : "Fecha no disponible"}
        </div>
      ),
    },
    {
      accessorKey: "payment",
      header: "Abono",
      cell: ({ row }) => <div>{(row.original.payment ?? 0).toFixed(2)}</div>,
    },
    {
      accessorKey: "interest",
      header: "Interés",
      cell: ({ row }) => <div>{(row.original.interest ?? 0).toFixed(2)}</div>,
    },
    {
      header: "Cuota",
      cell: ({ row }) => (
        <div>
          {((row.original.interest ?? 0) + (row.original.payment ?? 0)).toFixed(2)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => setDeleting(row.original)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  const table = useReactTable({
    data: installments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isPaid = (i: ILoanInstallment) =>
    Boolean(i.paid) || i.status === "PAID";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent cy-data="installments-dialog" className="sm:max-w-[480px]">
          <ScrollArea className="h-[400px] w-full">
            <DialogHeader>
              <DialogTitle>Cuotas del prestamo</DialogTitle>
              <DialogDescription>
                Cuotas del prestamo seleccionado.
              </DialogDescription>
            </DialogHeader>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        className="text-black font-semibold"
                        key={header.id}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody cy-data="installments-table-body">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      className={`${
                        isPaid(row.original) ? "bg-green-200" : "bg-red-200"
                      }`}
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No se encontraron resultados.
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
