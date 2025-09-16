"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardCheck } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "@/components/combobox/ComboboxUsers";
import { IUser } from "@/types/IUser";
type LoanReq = { id: string; dni: string; name: string; amount: number; months: number; status: "Pendiente" | "Aprobado" | "Rechazado" };

export default function Loans() {
  const { users } = useContext(AppContext);
  const [items, setItems] = useState<LoanReq[]>([]);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [form, setForm] = useState<{ amount: number; months: number }>({ amount: 0, months: 6 });

  useEffect(() => {
    if (items.length > 0) return;
    const baseUsers = users.length ? users.slice(0, 5) : [
      { id: "1", dni: "12345678", email: "a@demo.com", name: "Ana", lastname: "Perez", password: "", roles: ["socio"], createdAt: new Date(), updatedAt: new Date() },
      { id: "2", dni: "87654321", email: "b@demo.com", name: "Luis", lastname: "Ramos", password: "", roles: ["member"], createdAt: new Date(), updatedAt: new Date() },
      { id: "3", dni: "45671234", email: "c@demo.com", name: "Marta", lastname: "Lopez", password: "", roles: ["user"], createdAt: new Date(), updatedAt: new Date() },
      { id: "4", dni: "99887766", email: "d@demo.com", name: "Juan", lastname: "Quispe", password: "", roles: ["socio"], createdAt: new Date(), updatedAt: new Date() },
      { id: "5", dni: "11223344", email: "e@demo.com", name: "Rosa", lastname: "Garcia", password: "", roles: ["user"], createdAt: new Date(), updatedAt: new Date() },
    ];
    const seed: LoanReq[] = baseUsers.map((u, i) => ({ id: crypto.randomUUID(), dni: u.dni, name: `${u.name} ${u.lastname}`, amount: 500 + i * 250, months: 6 + (i % 3) * 3, status: "Pendiente" }));
    setItems(seed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length]);

  const addItem = () => {
    if (!userSelected || form.amount <= 0) return;
    const entry: LoanReq = { id: crypto.randomUUID(), dni: userSelected.dni, name: `${userSelected.name} ${userSelected.lastname}`, amount: form.amount, months: form.months, status: "Pendiente" };
    setItems((prev) => [entry, ...prev]);
    setUserSelected(null);
    setForm({ amount: 0, months: 6 });
  };
  const setStatus = (id: string, status: LoanReq["status"]) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  return (
   <div className="flex flex-col gap-4">
    <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle className="text-base">Arqueo de Caja</CardTitle>
              <CardDescription>Resumen financiero de la sesión</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="">
            <div className="rounded-md border bg-card">
              <div className="p-3 border-b">
                <div className="text-sm font-medium text-foreground">Saldos</div>
                <div className="text-xs text-muted-foreground">Cálculo del mes</div>
              </div>
              <div className="p-3">
                <Table className="w-full">
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">1. Saldo del mes anterior</TableCell>
                      <TableCell className="text-right border-r">S/. 100</TableCell>
                      <TableCell className="text-sm">2. Ingresos del mes</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">3. Saldo Bruto del Mes (2+1)</TableCell>
                      <TableCell className="text-right border-r">S/. 100</TableCell>
                      <TableCell className="text-sm">4. Egresos del Mes</TableCell>
                      <TableCell className="text-right">S/. 100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-semibold">Saldo Neto del Mes (3-4)</TableCell>
                      <TableCell className="text-right font-semibold">S/. 100</TableCell>
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            
          </div>

        
        </CardContent>
      </Card>
     <Card>
      <CardHeader>
        <CardTitle>Aplicación a créditos y evaluación</CardTitle>
        <CardDescription>Registra solicitudes y define su estado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <ComboBoxUsers users={users} controller={{ userSelected, setUserSelected }} />
          </div>
          <Input type="number" placeholder="Monto" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value || 0) }))} />
          <Input type="number" placeholder="Meses" value={form.months} onChange={(e) => setForm((p) => ({ ...p, months: Number(e.target.value || 0) }))} />
          <Button onClick={addItem} className="gap-2"><ClipboardCheck className="w-4 h-4" /> Agregar</Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Meses</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="text-sm">{it.dni}</TableCell>
                  <TableCell className="text-sm">{it.name}</TableCell>
                  <TableCell>S/ {it.amount.toFixed(2)}</TableCell>
                  <TableCell>{it.months}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">{it.status}</span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setStatus(it.id, "Aprobado")}>Aprobar</Button>
                    <Button variant="outline" size="sm" onClick={() => setStatus(it.id, "Rechazado")}>Rechazar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">Sin solicitudes</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
   </div>
  );
}


