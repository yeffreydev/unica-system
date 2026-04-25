"use client";

import { useContext, useEffect, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  TableMeta,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { PaymentsContext } from "./PaymentsProvider";
import { PaymentDialog } from "./PaymentDialog";
import { CapitalAndInterestForm } from "./PaymentForm";
import { usePayment } from "./usePayment";
import { ILoanPayment } from "./types";
import { apiDeleteLoanPayment } from "./api";

interface PaymentsTableMeta extends TableMeta<ILoanPayment> {
  onDelete: (p: ILoanPayment) => void;
  onEdit: (p: ILoanPayment) => void;
}

export function PaymentsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { payments, removePayment } = useContext(PaymentsContext);
  const { openDialog, setOpenDialog } = usePayment();
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<ILoanPayment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<ILoanPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEditClick = (payment: ILoanPayment) => {
    setEditingPayment(payment);
    setOpenDialog(true);
  };

  const handleDeleteClick = (payment: ILoanPayment) => {
    setPaymentToDelete(payment);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete?.id) return;
    setIsDeleting(true);
    try {
      await apiDeleteLoanPayment(paymentToDelete.id);
      removePayment?.(paymentToDelete.id);
      setPaymentToDelete(null);
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar. Intenta nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setOpenDialog(open);
    if (!open) setEditingPayment(null);
  };

  const columns: ColumnDef<ILoanPayment>[] = [
    {
      accessorKey: "date",
      header: "Fecha de Pago",
      cell: ({ row }) => (
        <div>
          {row.original?.date
            ? `${new Date(row.original.date).toLocaleDateString()} ${new Date(
                row.original.date
              ).toLocaleTimeString()}`
            : "Fecha no disponible"}
        </div>
      ),
    },
    {
      id: "userName",
      accessorFn: (row) => `${row.user?.name ?? ''} ${row.user?.lastname ?? ''}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombres
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.user?.name} {row.original.user?.lastname}
        </div>
      ),
    },
    {
      accessorKey: "payment",
      header: "Abono capital",
      cell: ({ row }) => {
        return <div>{formatCurrency(row.original.amount)}</div>;
      },
    },
    {
      id: "interest",
      header: "Interés",
      cell: ({ row }) => {
        return <div>{formatCurrency(row.original.interest)}</div>;
      },
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => {
        return (
          <div>
            {formatCurrency(row.original.amount + row.original.interest)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Opciones",
      cell: ({ table, row }) => {
        const meta = table.options.meta as PaymentsTableMeta | undefined;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => meta?.onEdit(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => meta?.onDelete(row.original)}>
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: payments,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onDelete: handleDeleteClick,
      onEdit: handleEditClick,
    } as PaymentsTableMeta,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-3">
        <Input
          placeholder="Filtrar nombres..."
          value={(table.getColumn("userName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("userName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mr-auto bg-background border-border"
        />

        <PaymentDialog
          open={openDialog}
          onOpenChange={handleDialogChange}
          isEdit={!!editingPayment}
        >
          <CapitalAndInterestForm
            setOpenDialog={handleDialogChange}
            editingPayment={editingPayment}
            onClose={() => setEditingPayment(null)}
          />
        </PaymentDialog>
      </div>
      <div className="">
        <Table className="bg-background border-border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody cy-data="payments-table-body">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>

      <Dialog
        open={!!paymentToDelete}
        onOpenChange={(o) => !isDeleting && !o && setPaymentToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar pago</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el pago de{" "}
              <strong>
                {paymentToDelete?.user?.name} {paymentToDelete?.user?.lastname}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {paymentToDelete && (
            <div className="text-sm space-y-1">
              <div>Capital: <span className="font-medium">{formatCurrency(paymentToDelete.amount)}</span></div>
              <div>Interés: <span className="font-medium">{formatCurrency(paymentToDelete.interest)}</span></div>
              <div>Total: <span className="font-medium">{formatCurrency(paymentToDelete.amount + paymentToDelete.interest)}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
