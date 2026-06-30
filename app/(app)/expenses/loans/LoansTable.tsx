"use client";

import { useContext, useState, useEffect } from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash,
  BookText,
  CreditCard,
  Edit,
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
import { ILoan, ILoanInstallment } from "@/types/ILoan";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/config/apiClient";
import { LoansInstallments } from "./LoansInstallments";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { LoanForm } from "./LoanForm";
import { PaymentModal } from "./PaymentModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLoanStatusText, LoanStatusText } from "./utils";
import { Landmark } from "lucide-react";

export function LoansTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { loans, deleteLoan, refreshLoans } = useContext(LoansContext);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<ILoan | null>(null);
  const [installments, setInstallments] = useState<ILoanInstallment[]>([]);
  const [installmentsLoanId, setInstallmentsLoanId] = useState<string | null>(null);
  const [deletingLoans, setDeletingLoans] = useState<string[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<ILoan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<ILoan | null>(null);

  const handleDeleteClick = (loan: ILoan) => {
    setLoanToDelete(loan);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!loanToDelete?.id) return;

    const loanId = loanToDelete.id;
    if (deletingLoans.includes(loanId)) return;

    // Store current page before deletion
    const currentPage = table.getState().pagination.pageIndex;
    setCurrentPageIndex(currentPage);

    setDeletingLoans((prev) => [...prev, loanId]);
    setIsDeleteDialogOpen(false);
    setLoanToDelete(null);

    try {
      const res = await apiClient.delete(`/loans/${loanId}`);
      if (res.status === 200) {
        console.log("Loan deleted successfully");
        handleDeleteSuccess();
        deleteLoan(loanId);
        setDeletingLoans((prev) => prev.filter((id) => id !== loanId));
      }
    } catch (error) {
      console.error("Error deleting loan:", error);
      setDeletingLoans((prev) => prev.filter((id) => id !== loanId));
    }
  };

  const fetchInstallments = async (loanId: string) => {
    try {
      const response = await apiClient.get(`/loans/installments/${loanId}`);
      console.log("Installments fetched successfully", response.data);
      setInstallments(response.data);
      setInstallmentsLoanId(loanId);
    } catch (error) {
      console.error("Error fetching installments:", error);
    }
  };

  const handleInstallmentsChanged = () => {
    if (installmentsLoanId) {
      fetchInstallments(installmentsLoanId);
    }
    refreshLoans?.();
  };

  const handlePaymentSuccess = () => {
    // Store current page before refresh
    const currentPage = table.getState().pagination.pageIndex;
    setCurrentPageIndex(currentPage);

    // Refresh loans data using context
    refreshLoans?.();
  };

  const handleDeleteSuccess = () => {
    // Store current page before refresh
    const currentPage = table.getState().pagination.pageIndex;
    setCurrentPageIndex(currentPage);
  };

  const columns: ColumnDef<ILoan>[] = [
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <div>
          {row.original?.date
            ? new Date(row.original.date).toLocaleDateString()
            : "Fecha no disponible"}
        </div>
      ),
    },
    {
      id: "userName",
      accessorFn: (row) => `${row.user?.name || ""} ${row.user?.lastname || ""}`,
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
      filterFn: (row, columnId, filterValue) => {
        const fullName = `${row.original.user?.name || ""} ${row.original.user?.lastname || ""}`.toLowerCase();
        return fullName.includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.amount || 0)}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <div
          className={
            (row.original.balance || 0) > 0
              ? "font-medium text-destructive"
              : "font-medium text-muted-foreground"
          }
        >
          {formatCurrency(row.original.balance || 0)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const paid = row.original.status === "PAID";
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              paid
                ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                : "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                paid ? "bg-green-500" : "bg-orange-500"
              }`}
            />
            {getLoanStatusText(row.original.status as keyof typeof LoanStatusText)}
          </span>
        );
      },
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
              onClick={() => {
                setEditingLoan(row.original);
                setOpenForm(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
                setSelectedLoanForPayment(row.original);
                setIsPaymentModalOpen(true);
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Regularizar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row.original)}
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
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: currentPageIndex,
        pageSize: 10,
      },
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(table.getState().pagination) : updater;
      setCurrentPageIndex(newState.pageIndex);
      table.setState((prev) => ({ ...prev, pagination: newState }));
    },
  });

  // Handle loading state and pagination restoration
  useEffect(() => {
    if (loans.length > 0) {
      setIsLoading(false);
      // Only restore if we're not already on the correct page
      if (currentPageIndex > 0 && table.getState().pagination.pageIndex !== currentPageIndex) {
        table.setPageIndex(currentPageIndex);
      }
    } else if (loans.length === 0) {
      setIsLoading(true);
    }
  }, [loans, currentPageIndex, table]);

  return (
    <>
      <div className="w-full">
        <LoansInstallments
          installments={installments}
          onOpenChange={(open) => {
            if (!open) {
              setInstallments([]);
              setInstallmentsLoanId(null);
            }
          }}
          isOpen={installments.length > 0}
          onChanged={handleInstallmentsChanged}
        />
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          loan={selectedLoanForPayment}
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Eliminar Préstamo</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar el préstamo de{" "}
                <strong>
                  {loanToDelete?.user?.name} {loanToDelete?.user?.lastname}
                </strong>
                ? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deletingLoans.includes(loanToDelete?.id || "")}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deletingLoans.includes(loanToDelete?.id || "")}
              >
                {deletingLoans.includes(loanToDelete?.id || "")
                  ? "Eliminando..."
                  : "Eliminar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex items-center gap-3 pb-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">Préstamos</h1>
            <p className="text-sm text-muted-foreground">
              {loans.length} {loans.length === 1 ? "préstamo" : "préstamos"}{" "}
              registrados
            </p>
          </div>
        </div>
        <div className="flex items-center py-4 gap-3">
          <Input
            placeholder="Filtrar por nombre..."
            value={(table.getColumn("userName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("userName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm mr-auto bg-background border-border"
          />
          <DialogForm open={isOpenDialog} onOpenChange={setIsOpenDialog}>
            <LoanForm setIsOpenDialog={setIsOpenDialog} />
          </DialogForm>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table className="bg-background">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
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
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
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
        <div className="flex items-center justify-between gap-2 py-4">
          <p className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {Math.max(table.getPageCount(), 1)}
          </p>
          <div className="flex items-center gap-2">
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
      </div>
      <DialogForm
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditingLoan(null);
        }}
        isEdit
        disabledTrigger
      >
        {editingLoan && (
          <LoanForm
            key={editingLoan.id}
            loan={editingLoan}
            setIsOpenDialog={(value) => {
              setOpenForm(value);
              if (!value) setEditingLoan(null);
            }}
          />
        )}
      </DialogForm>
    </>
  );
}
