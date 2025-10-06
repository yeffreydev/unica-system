'use client'
import { IProfits } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

type MonthColumn = {
  year: number;
  month: number;
  label: string;
};

export function DividendsTable({
  data,
  startMonth,
    endMonth
}: {data: IProfits[],
    startMonth?: string,
    endMonth?: string
}) {
  const [selectedUser, setSelectedUser] = useState<IProfits | null>(null);
  // const monthsAbbr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const monthColumns: MonthColumn[] = [];
  if (startMonth && endMonth) {
    const [startYear, startMon] = startMonth.split('-').map(Number);
    const [endYear, endMon] = endMonth.split('-').map(Number);
    for (let year = startYear; year <= endYear; year++) {
      const startM = year === startYear ? startMon : 0;
      const endM = year === endYear ? endMon : 11;
      for (let month = startM; month <= endM; month++) {
        monthColumns.push({ year, month, label: `${String(month + 1).padStart(2, '0')}-${year}` });
      }
    }
  }
  console.log(data);

  return (
    <>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[200px]">Socio</TableHead>
          {monthColumns.map(col => (
            <TableHead key={col.label} className="min-w-[100px]">{col.label}</TableHead>
          ))}
          <TableHead className="min-w-[100px]">Total</TableHead>
          <TableHead className="min-w-[100px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, i) => (
          <>
            <TableRow key={`${i}-shares`} className="border-0">
              <TableCell rowSpan={2} className="align-middle">{item.lastname}, {item.name}</TableCell>
              {monthColumns.map(col => (
                <TableCell key={col.label}>
                  {item.shares?.[`${String(col.month + 1).padStart(2, '0')}-${col.year}`]?.[0] || 0}
                </TableCell>
              ))}
              <TableCell>{monthColumns.reduce((sum, col) => sum + (item.shares?.[`${col.month + 1}-${col.year}`]?.[0] || 0), 0)}</TableCell>
              <TableCell rowSpan={2} className="align-middle">
                <Button variant="outline" size="sm" onClick={() => setSelectedUser(item)}>Detalles</Button>
              </TableCell>
            </TableRow>
            <TableRow key={`${i}-profit`} className="bg-muted border-b">
              {monthColumns.map(col => (
                <TableCell key={col.label}>{formatCurrency(item.profits?.[col.label] || 0)}</TableCell>
              ))}
              <TableCell className="font-semibold">
                {formatCurrency(monthColumns.reduce((sum, col) => sum + (item.profits?.[col.label] || 0), 0))}
              </TableCell>
            </TableRow>
          </>
        ))}
      </TableBody>
    </Table>
    <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de Profits - {selectedUser?.lastname}, {selectedUser?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Acciones totales: {monthColumns.reduce((sum, col) => sum + (selectedUser?.shares?.[`${col.month + 1}-${col.year}`]?.[0] || 0), 0)}</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead>Acciones</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthColumns.map(col => (
                <TableRow key={col.label}>
                  <TableCell>{col.label}</TableCell>
                  <TableCell>{selectedUser?.shares?.[`${col.month + 1}-${col.year}`]?.[0] || 0}</TableCell>
                  <TableCell>{formatCurrency(selectedUser?.profits?.[col.label] || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}