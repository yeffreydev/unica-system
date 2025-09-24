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
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { ISocialFundsExpenseTransaction } from "./types";
import { SocialLegalFundsExpenseForm } from "./SocialLegalFundsExpenseForm";
import { SocialDialog } from "./SocialDialog";
import { ISocialFunds } from "@/types/ISocialFunds";

export default function SocialTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [socialFundsTransactions, setSocialFundsTransactions] = useState<ISocialFundsExpenseTransaction[]>([]);

  const {
    bank: { bank },
  } = useContext(AppContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socialFunds, setSocialFunds] = useState<ISocialFunds[]>([]);

  const bankName = bank?.name;

  const columns: ColumnDef<ISocialFundsExpenseTransaction>[] = [
    {
      accessorKey: "date",
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
          {row.original.user
            ? row.original.user.name + " " + row.original.user.lastname
            : bankName}
        </div>
      ),
    },
    {
      accessorKey: "socialFunds.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo de Fondo
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.socialFunds.name}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descripción
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.description}
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
            <DropdownMenuItem
              onClick={() => (table.options.meta as TableMeta<ISocialFundsExpenseTransaction> & { onDelete?: (d: ISocialFundsExpenseTransaction) => void })?.onDelete?.(row.original)}
            >
              <Trash />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  useEffect(() => {
    const fetchSocialFundsTransactions = async () => {
      setLoading(true);
      const response = await apiClient.get("/expenses/social-funds/transactions");
      const data = response.data;

      console.log(data);

      setSocialFundsTransactions(data);
      setLoading(false);
    };
    const fetchSocialFunds = async () => {
      const response = await apiClient.get("/banks/social-funds-types");
      const data = response.data;
      setSocialFunds(data);
    };
    fetchSocialFundsTransactions();
    fetchSocialFunds();
  }, []);

  const table = useReactTable({
    data: socialFundsTransactions,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onDelete: async (socialFundsTransaction: ISocialFundsExpenseTransaction) => {
        if (!socialFundsTransaction.id) return;
        const confirmDelete = window.confirm("¿Eliminar este egreso de fondos?");
        if (!confirmDelete) return;
        try {
          await apiClient.delete(`/expenses/social-funds/${socialFundsTransaction.id}`);
          setSocialFundsTransactions(socialFundsTransactions.filter((t) => t.id !== socialFundsTransaction.id));
        } catch (e) {
          console.error(e);
          alert("No se pudo eliminar. Intenta nuevamente.");
        }
      },
    } as TableMeta<ISocialFundsExpenseTransaction> & { onDelete: (d: ISocialFundsExpenseTransaction) => Promise<void> },
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
        <SocialDialog open={openDialog} onOpenChange={setOpenDialog}>
          <SocialLegalFundsExpenseForm
            socialFunds={socialFunds}
            setOpenDialog={setOpenDialog}
            socialFundsTransactions={socialFundsTransactions}
            setSocialFundsTransactions={setSocialFundsTransactions}
          />
        </SocialDialog>
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
          <TableBody cy-data="social-table-body">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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