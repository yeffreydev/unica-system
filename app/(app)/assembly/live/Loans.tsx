"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck } from "lucide-react";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "@/components/combobox/ComboboxUsers";
import { ComboboxLoanTypes } from "@/components/combobox/ComboboxLoanTypes";
import { IUser } from "@/types/IUser";
import { ILoanType } from "@/types/ILoan";
import { loanTypesData } from "@/constants";
type LoanReq = { id: string; dni: string; name: string; amount: number; months: number; status: "Pendiente" | "Aprobado" | "Rechazado"; loanType?: string };

export default function Loans() {
  const { users } = useContext(AppContext);
  const [items, setItems] = useState<LoanReq[]>([]);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [form, setForm] = useState<{ amount: number; installments: number }>({ amount: 0, installments: 6 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalStep, setApprovalStep] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState<LoanReq | null>(null);
  const [loanTypeSelected, setLoanTypeSelected] = useState<ILoanType | null>(null);
  const [sendMessage, setSendMessage] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSendMessage, setRejectSendMessage] = useState(false);
  const loanTypes: ILoanType[] = [
    { id: "1", name: "FIXED" },
    { id: "2", name: "VARIABLE" },
    { id: "3", name: "REBATE" },
    { id: "4", name: "MATURITY" },
  ];

  const addItem = () => {
    if (!userSelected || form.amount <= 0) return false;
    const entry: LoanReq = { id: crypto.randomUUID(), dni: userSelected.dni, name: `${userSelected.name} ${userSelected.lastname}`, amount: form.amount, months: 0, status: "Pendiente" };
    setItems((prev) => [entry, ...prev]);
    setUserSelected(null);
    setForm({ amount: 0, installments: 6 });
    return true;
  };
  const updateLoan = (id: string, updates: Partial<LoanReq>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  const approveLoan = () => {
    if (!selectedLoan || !loanTypeSelected || form.installments <= 0) return false;
    updateLoan(selectedLoan.id, { amount: form.amount, loanType: loanTypeSelected.name, months: form.installments, status: "Aprobado" });
    setApprovalModalOpen(false);
    setSelectedLoan(null);
    setLoanTypeSelected(null);
    setForm({ amount: 0, installments: 6 });
    setSendMessage(false);
    return true;
  };
  const rejectLoan = () => {
    if (!selectedLoan) return false;
    updateLoan(selectedLoan.id, { status: "Rechazado" });
    setRejectModalOpen(false);
    setSelectedLoan(null);
    setRejectReason('');
    setRejectSendMessage(false);
    return true;
  };

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Aplicación a créditos y evaluación</CardTitle>
            <CardDescription>Registra solicitudes y define su estado</CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2"><ClipboardCheck className="w-4 h-4" /> Agregar</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo de Préstamo</TableHead>
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
                  <TableCell className="text-sm">{it.loanType ? loanTypesData[it.loanType as keyof typeof loanTypesData] : '-'}</TableCell>
                  <TableCell>S/ {it.amount.toFixed(2)}</TableCell>
                  <TableCell>{it.months}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">{it.status}</span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedLoan(it); setApprovalModalOpen(true); setApprovalStep(0); setForm({ amount: it.amount, installments: it.months || 6 }); setLoanTypeSelected(loanTypes.find(lt => lt.name === it.loanType) || null); setSendMessage(false); }}>Aprobar</Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedLoan(it); setRejectModalOpen(true); }}>Rechazar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">Sin solicitudes</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) { setUserSelected(null); setForm({ amount: 0, installments: 6 }); } }} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Solicitud de Préstamo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ComboBoxUsers users={users} controller={{ userSelected, setUserSelected }} />
          <Input
            type="number"
            placeholder="Monto"
            value={form.amount || ''}
            onChange={(e) => {
              const val = e.target.value;
              setForm((p) => ({ ...p, amount: val === '' ? 0 : Number(val) || 0 }));
            }}
          />
          <Button onClick={() => { if (addItem()) setIsModalOpen(false); }} className="w-full">Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={approvalModalOpen} onOpenChange={(open) => { setApprovalModalOpen(open); if (!open) { setApprovalStep(0); setSelectedLoan(null); setLoanTypeSelected(null); setForm({ amount: 0, installments: 6 }); setSendMessage(false); } }} modal={false}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aprobar Solicitud de Préstamo - Paso {approvalStep + 1} de 3</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {approvalStep === 0 && selectedLoan && (
            <>
              <div>
                <Label>Usuario</Label>
                <Input value={selectedLoan.name} readOnly />
              </div>
              <div>
                <Label>Monto</Label>
                <Input
                  type="number"
                  value={form.amount || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((p) => ({ ...p, amount: val === '' ? 0 : Number(val) || 0 }));
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setForm((p) => ({ ...p, amount: selectedLoan.amount * 0.5 }))}>50%</Button>
                  <Button variant="outline" size="sm" onClick={() => setForm((p) => ({ ...p, amount: selectedLoan.amount * 0.7 }))}>70%</Button>
                </div>
              </div>
              {(() => {
                const selectedUser = users.find(u => u.dni === selectedLoan.dni);
                return selectedUser ? (
                  <div className="p-4 border rounded bg-muted">
                    <p><strong>DNI:</strong> {selectedUser.dni}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Roles:</strong> {selectedUser.roles?.join(', ') || 'Sin roles'}</p>
                    <p><strong>Préstamos Activos:</strong> {items.filter(it => it.dni === selectedUser.dni && it.status === "Aprobado").length}</p>
                    <p><strong>Acciones:</strong> 0</p>
                  </div>
                ) : null;
              })()}
            </>
          )}
          {approvalStep === 1 && (
            <>
              <ComboboxLoanTypes loanTypes={loanTypes} controller={{ loanTypeSelected, setLoanTypeSelected }} />
              <Input
                type="number"
                placeholder="Cuotas"
                value={form.installments || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((p) => ({ ...p, installments: val === '' ? 0 : Number(val) || 0 }));
                }}
              />
            </>
          )}
          {approvalStep === 2 && (
            <>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: form.installments }, (_, i) => {
                      const installmentAmount = form.amount / form.installments;
                      const date = new Date();
                      date.setMonth(date.getMonth() + i + 1);
                      return (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>S/ {installmentAmount.toFixed(2)}</TableCell>
                          <TableCell>{date.toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="send-message-approval" checked={sendMessage} onCheckedChange={(checked) => setSendMessage(checked === true)} />
                <label htmlFor="send-message-approval">Enviar cuotas por mensaje</label>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setApprovalStep(Math.max(0, approvalStep - 1))} disabled={approvalStep === 0}>
              Anterior
            </Button>
            {approvalStep < 2 ? (
              <Button onClick={() => setApprovalStep(approvalStep + 1)} disabled={approvalStep === 1 && (!loanTypeSelected || form.installments <= 0)}>
                Siguiente
              </Button>
            ) : (
              <Button onClick={() => { if (approveLoan()) setApprovalStep(0); }} className="w-full">
                Aprobar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={rejectModalOpen} onOpenChange={(open) => { setRejectModalOpen(open); if (!open) { setSelectedLoan(null); setRejectReason(''); setRejectSendMessage(false); } }} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar Solicitud de Préstamo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Motivo del Rechazo</Label>
            <Textarea
              placeholder="Ingrese el motivo del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="reject-send-message" checked={rejectSendMessage} onCheckedChange={(checked) => setRejectSendMessage(checked === true)} />
            <label htmlFor="reject-send-message">Enviar por mensaje</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => { if (rejectLoan()) {} }}>Rechazar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
   </div>
  );
}


