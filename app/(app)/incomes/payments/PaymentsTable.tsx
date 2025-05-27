"use client";

import { useState, useEffect, useContext } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ILoanInstallment } from "@/types/ILoan";
import { usePayment } from "./usePayment";
import { formatCurrency } from "@/lib/utils";
import { PaymentsContext } from "./PaymentsProvider";

export function PaymentsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { payments } = useContext(PaymentsContext);

  const columns: ColumnDef<ILoanInstallment>[] = [
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
      header: "Cuota",
      cell: ({ row }) => (
        <div>
          {(row.original.user?.name
            ? row.original.user.name[0]?.toUpperCase() ?? ""
            : "") +
            (row.original?.installment_number ?? "") +
            "-" +
            row.original?.loan?.amount}
        </div>
      ),
    },
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
        return <div>S/. {formatCurrency(row.original.payment)}</div>;
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
            S/. {formatCurrency(row.original.payment + row.original.interest)}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: payments, // Use localPayments instead of payments directly
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar nombres..."
          onChange={(event) =>
            table.getColumn("user.name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
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
          <TableBody>
            {table.getRowModel().rows.length ? (
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
