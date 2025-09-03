"use client";

import { useContext, useState } from "react";
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
import { IStock } from "@/types/IStock";
import { StockContext } from "./StockContext";
import { StocksForm } from "@/app/(app)/incomes/stocks/StocksForm";
import { StocksDialog } from "./StocksDialog";
import apiClient from "@/config/apiClient";

export const columns: ColumnDef<IStock, unknown>[] = [
  {
    accessorKey: "user.dni",
    header: "DNI",
    cell: ({ row }) => <div>{row.original.user?.dni || "N/A"}</div>,
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
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const d = row.original.date;
      if (!d) return <div>-</div>;
      try {
        const date = new Date(d);
        return <div>{date.toLocaleDateString("es-PE", { timeZone: "UTC" })}</div>;
      } catch {
        return <div>{d}</div>;
      }
    },
  },
  {
    accessorKey: "quantity",
    header: "Cantidad",
    cell: ({ row }) => {
      return <div>{row.original.quantity}</div>;
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const quantity = row.original.quantity || 0;
      const price = row.original.price || 0;
      return <div>S/. {(quantity * price).toFixed(2)}</div>;
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
          <DropdownMenuItem onClick={() => (table.options.meta as TableMeta<IStock> & { onEdit?: (s: IStock) => void })?.onEdit?.(row.original)}>
            <Edit />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => (table.options.meta as TableMeta<IStock> & { onDelete?: (s: IStock) => void })?.onDelete?.(row.original)}
          >
            <Trash />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function StocksTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { stocks, setStocks, openEdit } = useContext(StockContext);
  const [openDialog, setOpenDialog] = useState(false);

  const table = useReactTable({
    data: stocks,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onEdit: (stock: IStock) => {
        openEdit?.(stock);
      },
      onDelete: async (stock: IStock) => {
        if (!stock.id) return;
        const confirmDelete = window.confirm("¿Eliminar este registro?");
        if (!confirmDelete) return;
        try {
          await apiClient.delete(`/stocks/${stock.id}`);
          setStocks?.(stocks.filter((s) => s.id !== stock.id));
        } catch (e) {
          console.error(e);
          alert("No se pudo eliminar. Intenta nuevamente.");
        }
      },
    } as TableMeta<IStock> & { onDelete: (s: IStock) => Promise<void>; onEdit: (s: IStock) => void },
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar nombres..."
          onChange={(event) =>
            table.getColumn("user.name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mr-auto bg-background border-border"
        />
        <StocksDialog open={openDialog} onOpenChange={setOpenDialog} modal={false}>
          <StocksForm setOpenDialog={setOpenDialog} />
        </StocksDialog>
        {/* Custom edit modal is rendered globally in layout via context */}
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
