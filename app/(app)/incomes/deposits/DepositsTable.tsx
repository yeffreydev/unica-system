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
import { ArrowUpDown, Edit, MoreHorizontal, Trash } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/config/apiClient";

import { DepositContext } from "./DepositProvider";
import { DepositForm } from "./DepositForm";
import { DepositsDialog } from "./DepositsDialog";
import { IDeposit } from "./types";

export const columns: ColumnDef<IDeposit>[] = [
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => {
      const d = row.original?.date;
      if (!d) return <div>Fecha no disponible</div>;
      try {
        const date = new Date(d);
        return <div>{date.toLocaleDateString("es-PE", { timeZone: "UTC" })}</div>;
      } catch {
        return <div>{String(d)}</div>;
      }
    },
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
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      return <div>S/. {row.original.amount}</div>;
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
          <DropdownMenuItem onClick={() => (table.options.meta as TableMeta<IDeposit> & { onEdit?: (d: IDeposit) => void })?.onEdit?.(row.original)}>
            <Edit />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => (table.options.meta as TableMeta<IDeposit> & { onDelete?: (d: IDeposit) => void })?.onDelete?.(row.original)}
          >
            <Trash />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function DepositsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const { deposits, setDeposits, addDeposit, updateDeposit } = useContext(DepositContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editDeposit, setEditDeposit] = useState<IDeposit | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Show skeleton for 1 second to handle loading delay
    return () => clearTimeout(timer);
  }, []);

  const table = useReactTable({
    data: deposits,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value) => {
      const user = row.original.user;
      const fullName = `${user?.name ?? ""} ${user?.lastname ?? ""}`.toLowerCase();
      return fullName.includes(String(value).toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onEdit: (deposit: IDeposit) => {
        setEditDeposit(deposit);
        setOpenDialog(true);
      },
      onDelete: async (deposit: IDeposit) => {
        if (!deposit.id) return;
        const confirmDelete = window.confirm("¿Eliminar este depósito?");
        if (!confirmDelete) return;
        try {
          await apiClient.delete(`/deposits/${deposit.id}`);
          setDeposits?.(deposits.filter((d) => d.id !== deposit.id));
        } catch (e) {
          console.error(e);
          alert("No se pudo eliminar. Intenta nuevamente.");
        }
      },
    } as TableMeta<IDeposit> & { onDelete: (d: IDeposit) => Promise<void>; onEdit: (d: IDeposit) => void },
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar por nombre o apellido..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm mr-auto bg-background border-border"
        />
        <DepositsDialog
          isEdit={!!editDeposit}
          open={openDialog}
          onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) setEditDeposit(null);
          }}
        >
          <DepositForm
            addDeposit={addDeposit!}
            updateDepositInList={updateDeposit}
            setOpenDialog={setOpenDialog}
            editDeposit={editDeposit}
            setEditDeposit={setEditDeposit}
          />
        </DepositsDialog>
      </div>
      <div className="bg-background border-border">
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
          <TableBody cy-data="loans-table-body">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
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
