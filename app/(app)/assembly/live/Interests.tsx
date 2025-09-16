"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Info } from "lucide-react";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";

type InterestPayment = { userId: string; quota: number; paidAmount: number; status: 'pending' | 'partial' | 'paid' };

export default function Interests() {
  const { users } = useContext(AppContext);
  const [payments, setPayments] = useState<Map<string, InterestPayment>>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Initialize simulated quotas for users
  const getUserQuota = (userId: string) => {
    // Simulate different quotas based on user index
    const userIndex = users.findIndex(u => u.id === userId);
    return 50 + (userIndex % 3) * 25; // 50, 75, 100, 50, 75...
  };

  const handlePayInterest = (user: IUser) => {
    setSelectedUser(user);
    setPaymentAmount('');
    setModalOpen(true);
  };

  const handleShowDetails = (user: IUser) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const fillRemainingQuota = () => {
    if (!selectedUser) return;
    const quota = getUserQuota(selectedUser.id);
    const currentPaid = getUserPayment(selectedUser.id)?.paidAmount || 0;
    const remaining = Math.max(0, quota - currentPaid);
    setPaymentAmount(remaining.toString());
  };

  const confirmPayment = () => {
    if (!selectedUser || !paymentAmount.trim()) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const quota = getUserQuota(selectedUser.id);
    const existingPayment = payments.get(selectedUser.id);
    const currentPaid = existingPayment?.paidAmount || 0;
    const newPaidAmount = currentPaid + amount;

    let status: 'pending' | 'partial' | 'paid';
    if (newPaidAmount >= quota) {
      status = 'paid';
    } else if (newPaidAmount > 0) {
      status = 'partial';
    } else {
      status = 'pending';
    }

    const payment: InterestPayment = {
      userId: selectedUser.id,
      quota,
      paidAmount: Math.min(newPaidAmount, quota), // Don't exceed quota
      status,
    };

    setPayments(prev => new Map(prev.set(selectedUser.id, payment)));
    setModalOpen(false);
    setSelectedUser(null);
  };

  const getUserPayment = (userId: string) => {
    return payments.get(userId);
  };

  const getPaymentStatusText = (payment: InterestPayment | undefined) => {
    if (!payment || payment.paidAmount === 0) return "Pendiente";
    if (payment.status === 'paid') return "Pagado Total";
    if (payment.status === 'partial') return `Parcial S/ ${payment.paidAmount.toFixed(2)}`;
    return "Pendiente";
  };

  const getPaymentStatusColor = (payment: InterestPayment | undefined) => {
    if (!payment || payment.paidAmount === 0) return "bg-orange-500 hover:bg-orange-600";
    if (payment.status === 'paid') return "bg-green-600 hover:bg-green-700";
    if (payment.status === 'partial') return "bg-blue-500 hover:bg-blue-600";
    return "bg-orange-500 hover:bg-orange-600";
  };

  const totalQuota = users.reduce((sum, user) => sum + getUserQuota(user.id), 0);
  const totalPaid = Array.from(payments.values()).reduce((sum, payment) => sum + payment.paidAmount, 0);
  const totalPending = totalQuota - totalPaid;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recolectar Intereses</CardTitle>
        <CardDescription>Lista de usuarios - registra pagos de intereses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const payment = getUserPayment(user.id);
                const quota = getUserQuota(user.id);
                const hasPaid = payment && payment.paidAmount > 0;
                return (
                  <TableRow key={user.id} className={hasPaid ? "bg-green-50 dark:bg-green-950/10" : "bg-orange-50 dark:bg-orange-950/10"}>
                    <TableCell className="text-sm">{user.dni}</TableCell>
                    <TableCell className="text-sm font-medium">{`${user.name} ${user.lastname}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">S/ {quota.toFixed(2)}</span>
                        <Button
                          onClick={() => handleShowDetails(user)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Info className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getPaymentStatusColor(payment)} text-white`}
                      >
                        {getPaymentStatusText(payment)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handlePayInterest(user)}
                        size="sm"
                        variant={hasPaid ? "outline" : "default"}
                        className="gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        {payment?.status === 'paid' ? 'Actualizar' : hasPaid ? 'Pagar Más' : 'Pagar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No hay usuarios disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            Total cuota: <span className="font-semibold">S/ {totalQuota.toFixed(2)}</span>
          </div>
          <div>
            Total pagado: <span className="font-semibold text-green-700 dark:text-green-400">S/ {totalPaid.toFixed(2)}</span>
          </div>
          <div>
            Pendiente: <span className="font-semibold text-orange-600 dark:text-orange-400">S/ {totalPending.toFixed(2)}</span>
          </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pago de Intereses</DialogTitle>
              <DialogDescription>
                {selectedUser && `Pago para ${selectedUser.name} ${selectedUser.lastname}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedUser && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Cuota Total</Label>
                    <div className="col-span-3 text-sm font-semibold">
                      S/ {getUserQuota(selectedUser.id).toFixed(2)}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Ya Pagado</Label>
                    <div className="col-span-3 text-sm">
                      S/ {getUserPayment(selectedUser.id)?.paidAmount.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Monto a Pagar
                    </Label>
                    <div className="col-span-3 flex gap-2">
                      <Input
                        id="amount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fillRemainingQuota}
                        className="whitespace-nowrap"
                      >
                        Todo
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Total Después</Label>
                    <div className="col-span-3 text-sm font-semibold">
                      S/ {((getUserPayment(selectedUser.id)?.paidAmount || 0) + (parseFloat(paymentAmount) || 0)).toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmPayment}>
                Registrar Pago
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de Cuota</DialogTitle>
              <DialogDescription>
                {selectedUser && `Información detallada de cuotas para ${selectedUser.name} ${selectedUser.lastname}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {selectedUser && (
                <>
                  {/* Current Quota Summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cuota Actual</Label>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        S/ {getUserQuota(selectedUser.id).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado de Pago</Label>
                      <div className="text-lg font-semibold">
                        <Badge
                          variant="secondary"
                          className={`text-sm ${getPaymentStatusColor(getUserPayment(selectedUser.id))} text-white`}
                        >
                          {getPaymentStatusText(getUserPayment(selectedUser.id))}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quota Breakdown */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Desglose de Cuotas</Label>
                    <div className="space-y-2">
                      {/* Simulate multiple quota periods */}
                      {[
                        { period: "Septiembre 2024", amount: 50, status: "paid" },
                        { period: "Octubre 2024", amount: 50, status: "paid" },
                        { period: "Noviembre 2024", amount: 50, status: "partial" },
                        { period: "Diciembre 2024", amount: 50, status: "pending" },
                        { period: "Enero 2025", amount: 50, status: "pending" },
                      ].map((quota, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{quota.period}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Cuota #{index + 1}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">S/ {quota.amount.toFixed(2)}</div>
                            <Badge
                              variant="outline"
                              className={`text-xs mt-1 ${
                                quota.status === 'paid' ? 'border-green-500 text-green-700' :
                                quota.status === 'partial' ? 'border-blue-500 text-blue-700' :
                                'border-gray-500 text-gray-700'
                              }`}
                            >
                              {quota.status === 'paid' ? 'Pagado' :
                               quota.status === 'partial' ? 'Parcial' : 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Historial de Pagos</Label>
                    <div className="space-y-2">
                      {getUserPayment(selectedUser.id)?.paidAmount ? (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-green-800 dark:text-green-400">
                                Pago Registrado
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-500">
                                {new Date().toLocaleDateString('es-PE')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-800 dark:text-green-400">
                                S/ {getUserPayment(selectedUser.id)?.paidAmount.toFixed(2)}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-500">
                                Monto pagado
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500">
                          No hay pagos registrados
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}


