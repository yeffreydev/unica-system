"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck } from "lucide-react";
import { useState } from "react";
import Closing from "./Closing";

type Doc = { id: string; title: string; signer: string; status: "Pendiente" | "Firmado" };

export default function Docs() {
  const [items, setItems] = useState<Doc[]>([]);
  const [form, setForm] = useState<{ title: string; signer: string }>({ title: "Acuerdo", signer: "Secretario" });

  const addItem = () => {
    if (!form.title || !form.signer) return;
    setItems((prev) => [{ id: crypto.randomUUID(), status: "Pendiente", ...form }, ...prev]);
  };
  const setStatus = (id: string, status: Doc["status"]) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  return (
    <div className="flex flex-col gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Decisiones y documentación</CardTitle>
        <CardDescription>Documenta acuerdos, gestiona firmas y archivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input placeholder="Título del documento" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <Input placeholder="Firmante" value={form.signer} onChange={(e) => setForm((p) => ({ ...p, signer: e.target.value }))} />
          <Button onClick={addItem} className="gap-2"><FileCheck className="w-4 h-4" /> Agregar</Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Firmante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="text-sm">{it.title}</TableCell>
                  <TableCell className="text-sm">{it.signer}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">{it.status}</span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setStatus(it.id, "Firmado")}>Marcar firmado</Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">Sin documentos</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>


    </Card>

<Closing />
</div>
  );
}


