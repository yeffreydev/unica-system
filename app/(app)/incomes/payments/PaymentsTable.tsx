"use client";

import { useContext, useEffect, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  TableMeta,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { PaymentsContext } from "./PaymentsProvider";
import { PaymentDialog } from "./PaymentDialog";
import { CapitalAndInterestForm } from "./PaymentForm";
import { usePayment } from "./usePayment";
import { ILoanPayment } from "./types";
import { apiDeleteLoanPayment } from "./api";

export function PaymentsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { payments ,removePayment} = useContext(PaymentsContext);
  const { openDialog, setOpenDialog } = usePayment();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Show skeleton for 1 second to handle loading delay
    return () => clearTimeout(timer);
  }, []);

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
    // {
    //   header: "Cuota",
    //   cell: ({ row }) => (
    //     <div>
    //       {/* {(row.original.user?.name
    //         ? row.original.user.name[0]?.toUpperCase() ?? ""
    //         : "") +
    //         (row.original?.installment_number ?? "") +
    //         "-" +
    //         row.original?.loan?.amount} */}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "user.name",
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
        return <div>S/. {formatCurrency(row.original.amount)}</div>;
      },
    },
    {
      id: "interest",
      header: "Interés",
      cell: ({ row }) => {
        return <div>S/. {formatCurrency(row.original.interest)}</div>;
      },
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => {
        return (
          <div>
            S/. {formatCurrency(row.original.amount + row.original.interest)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Opciones",
      cell: ({ table, row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => (table.options.meta as TableMeta<ILoanPayment> & { onDelete?: (p: ILoanPayment) => void })?.onDelete?.(row.original)}
            >
              <Trash />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onDelete: async (payment: ILoanPayment) => {
        if (!payment.id) return;
        const confirmDelete = window.confirm("¿Eliminar este pago?");
        if (!confirmDelete) return;
        try {
         const res = await apiDeleteLoanPayment(payment.id);
         console.log("Delete response:", res);
         removePayment?.(payment.id);
        } catch (e) {
          console.error(e);
          alert("No se pudo eliminar. Intenta nuevamente.");
        }
      },
    } as TableMeta<ILoanPayment> & { onDelete: (p: ILoanPayment) => Promise<void> },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-3">
        <Input
          placeholder="Filtrar nombres..."
          onChange={(event) =>
            table.getColumn("user.name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mr-auto bg-background border-border"
        />

        <PaymentDialog open={openDialog} onOpenChange={setOpenDialog}>
          <CapitalAndInterestForm setOpenDialog={setOpenDialog} />
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
              // Skeleton rows
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
    </div>
  );
}
