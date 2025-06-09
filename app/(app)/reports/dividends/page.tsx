"use client";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import { useContext } from "react";

function DividendsTable() {
  const { users } = useContext(AppContext);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[200px]">Socio</TableHead>
          <TableHead className="min-w-[100px]">16-10-2024</TableHead>
          <TableHead className="min-w-[100px]">16-09-2024</TableHead>
          <TableHead className="min-w-[100px]">16-11-2024</TableHead>
          <TableHead className="min-w-[100px]">16-12-2024</TableHead>
          <TableHead className="min-w-[100px]">16-01-2025</TableHead>
          <TableHead className="min-w-[100px]">16-02-2025</TableHead>
          <TableHead className="min-w-[100px]">16-03-2025</TableHead>
          <TableHead className="min-w-[100px]">16-04-2025</TableHead>
          <TableHead className="min-w-[100px]">16-05-2025</TableHead>
          <TableHead className="min-w-[100px]">16-06-2025</TableHead>
          <TableHead className="min-w-[100px]">16-07-2025</TableHead>
          <TableHead className="min-w-[100px]">16-08-2025</TableHead>
          <TableHead className="min-w-[100px]">16-09-2025</TableHead>
          <TableHead className="min-w-[100px]">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.name}</TableCell>

            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell>{formatCurrency(250)}</TableCell>

            <TableCell>{formatCurrency(250)}</TableCell>
            <TableCell className="font-semibold">
              {formatCurrency(250)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default function DividendsPage() {
  return (
    <div className="relative flex  border border-red-500 flex-col p-4 max-w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">
          Distribuición de utilidades &quot;Aki Nace&quot;
        </h1>
      </div>
      <div className="flex gap-2 mt-3">
        <div className="flex gap-2 flex-1">
          <input
            className="border border-black rounded-sm"
            type="date"
            name=""
            id=""
          />
          <input
            className="border border-black rounded-sm"
            type="date"
            name=""
            id=""
          />
        </div>
        <div>
          <Button>Verificar pasos</Button>
        </div>
      </div>
      <div className="overflow-x-scroll border border-red-500 rounded-md mt-4">
        <div className="">
          <DividendsTable />
        </div>
      </div>
    </div>
  );
}
