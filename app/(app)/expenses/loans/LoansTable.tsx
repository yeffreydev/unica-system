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
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  MoreHorizontal,
  Trash,
  BookText,
} from "lucide-react";
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
import { LoansContext } from "./LoansProvider";
import { ILoan } from "@/types/ILoan";
import { InstallmentInterface } from "./utils/installments";
import apiClient from "@/config/apiClient";
import { LoansInstallments } from "./LoansInstallments";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { LoanForm } from "./LoanForm";
import {
  getLoanStatusColor,
  getLoanStatusText,
  LoanStatusColor,
  LoanStatusText,
} from "./utils";

export function LoansTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { loans, deleteLoan } = useContext(LoansContext);
  const [openForm, setOpenForm] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [installments, setInstallments] = useState<InstallmentInterface[]>([]);
  const [deletingLoans, setDeletingLoans] = useState<string[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const handleDelete = async (loanId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este préstamo?")) {
      if (deletingLoans.includes(loanId)) return;

      setDeletingLoans((prev) => [...prev, loanId]);
      try {
        const res = await apiClient.delete(`/loans/${loanId}`);
        if (res.status === 200) {
          console.log("Loan deleted successfully");
          deleteLoan(loanId);
          setDeletingLoans((prev) => prev.filter((id) => id !== loanId));
        }
      } catch (error) {
        console.error("Error deleting loan:", error);
        setDeletingLoans((prev) => prev.filter((id) => id !== loanId));
      }
    }
  };

  const fetchInstallments = async (loanId: string) => {
    try {
      const response = await apiClient.get(`/loans/installments/${loanId}`);
      console.log("Installments fetched successfully", response.data);
      setInstallments(response.data);
    } catch (error) {
      console.error("Error fetching installments:", error);
    }
  };

  const columns: ColumnDef<ILoan>[] = [
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => (
        <div>
          {row.original?.createdAt
            ? `${new Date(
                row.original.createdAt
              ).toLocaleDateString()} ${new Date(
                row.original.createdAt
              ).toLocaleTimeString()}`
            : "Fecha no disponible"}
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
      cell: ({ row }) => <div>S/. {row.original.amount}</div>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <div
          className={`text-white w-min px-2 text-center rounded-lg ${getLoanStatusColor(
            row.original.status as keyof typeof LoanStatusColor
          )}`}
        >
          {`${getLoanStatusText(
            row.original.status as keyof typeof LoanStatusText
          )}`}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Opciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent cy-data="options-menu" align="end">
            <DropdownMenuItem
              onClick={() =>
                row.original.id && fetchInstallments(row.original.id)
              }
            >
              <BookText className="mr-2 h-4 w-4" />
              Cuotas
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedLoanId(row.original.id || null);
                setOpenForm(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => row.original.id && handleDelete(row.original.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: loans,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <>
      <div className="w-full">
        <LoansInstallments
          installments={installments}
          onOpenChange={() => setInstallments([])}
          isOpen={installments.length > 0}
        />
        <div className="flex items-center py-4 gap-3">
          <Input
            placeholder="Filtrar nombres..."
            onChange={(event) =>
              table.getColumn("user.name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm mr-auto bg-background border-border"
          />
          <DialogForm open={isOpenDialog} onOpenChange={setIsOpenDialog}>
            <LoanForm setIsOpenDialog={setIsOpenDialog} />
          </DialogForm>
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
      <DialogForm
        open={openForm}
        onOpenChange={setOpenForm}
        isEdit={!!selectedLoanId}
        disabledTrigger
      >
        <LoanForm
          loan={loans.find((loan) => loan.id === selectedLoanId) || null}
        />
      </DialogForm>
    </>
  );
}
