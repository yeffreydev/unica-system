import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { InstallmentInterface } from "./utils/installments";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function LoansInstallments({
  isOpen,
  onOpenChange,
  installments,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  installments: InstallmentInterface[];
}) {
  const columns: ColumnDef<InstallmentInterface>[] = [
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <div>
          {row.original?.date
            ? new Intl.DateTimeFormat("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(row.original.date))
            : "Fecha no disponible"}
        </div>
      ),
    },
    {
      accessorKey: "payment",
      header: "Abono",
      cell: ({ row }) => <div>{row.original.payment.toFixed(2)}</div>,
    },
    {
      accessorKey: "interest",
      header: "Interés",
      cell: ({ row }) => <div>{row.original.interest.toFixed(2)}</div>,
    },
    {
      header: "Cuota",
      cell: ({ row }) => (
        <div>{(row.original.interest + row.original.payment).toFixed(2)}</div>
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent cy-data="installments-dialog" className="sm:max-w-[425px]">
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
                      row.original.paid ? "bg-green-200" : "bg-red-200"
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
  );
}

//7:30 LCOM7.
