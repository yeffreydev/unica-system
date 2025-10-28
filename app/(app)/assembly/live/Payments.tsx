"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Info } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";
import { IAssemblyScheduleRun, ILoanPayment, IPaymentData } from "../types";
import { apiGetAssemblyRun, apiGetPaymentsData, apiRecordPayment } from "../api";
import { useAssembly } from "../AssemblyContext";
import { getPaymentStatusColor, getRowColor } from "./utils";
import { ILoanInstallment } from "@/types/ILoan";
import apiClient from "@/config/apiClient";

export default function Payments() {
  const { users } = useContext(AppContext);
   const { assembly } = useAssembly();
    
     const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [paymentsData, setPaymentsData] = useState<IPaymentData> ({
    partners: [],
    installments: [],
    payments: []
  })
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [capitalAmount, setCapitalAmount] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currentMonthInstallments, setCurrentMonthInstallments] = useState<ILoanInstallment[]>([]);

 useEffect(() => {
     //get assembly run
     (async () => {
       if (!assembly?.lastRun) return;
       const data = await apiGetAssemblyRun(assembly.lastRun.id);
       console.log({ data });
       setAssemblyRun(data);
     })();
   }, [assembly?.lastRun]);



  //get payments data
  useEffect(() => {
    // Fetch or compute payments data here and set it
    // setPaymentsData(fetchedData);
       if (!assemblyRun) return;
    const fetchData = async () => {
      try {
        const data = await apiGetPaymentsData(assemblyRun.id);
        console.log("Fetched payments data:", data);
        setPaymentsData(data);
      } catch (error) {
        console.error("Error fetching payments data:", error);
      }
    };
    fetchData();
  }, [assemblyRun]);

  useEffect(() => {
    const fetchCurrentMonthInstallments = async () => {
      try {
        const response = await apiClient.get('/schedules/installments/current-month');
        console.log("Fetched current month installments:", response.data);
        setCurrentMonthInstallments(response.data);
      } catch (error) {
        console.error("Error fetching current month installments:", error);
      }
    };
    fetchCurrentMonthInstallments();
  }, []);


 
  const handlePayInterest = (user: IUser) => {
    setSelectedUser(user);
    const existingPayment = paymentsData.payments.find(p => p.userId === user.id);
    const currentInstallment = currentMonthInstallments.find(inst => inst.user?.id === user.id);

    if (existingPayment) {
      setCapitalAmount(existingPayment.amount.toString());
      setInterestAmount((existingPayment.interest ?? 0).toString());
      setDescription(existingPayment.description || '');
    } else {
      // Auto-fill with current installment data
      if (currentInstallment) {
        setCapitalAmount((currentInstallment.payment - currentInstallment.interest).toString());
        setInterestAmount(currentInstallment.interest.toString());
      } else {
        setCapitalAmount('');
        setInterestAmount('');
      }
      setDescription('');
    }
    setModalOpen(true);
  };

  const handleShowDetails = (user: IUser) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  

  // Calculate totals
  const calculateTotals = () => {
    const totalInstallment = paymentsData.installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
    const totalCapital = paymentsData.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalInterest = paymentsData.payments.reduce((sum, payment) => sum + Number(payment.interest || 0), 0);
    const totalPaid = totalCapital + totalInterest;
    const totalPending = totalInstallment - totalPaid;
    
    return {
      totalInstallment,
      totalCapital,
      totalInterest,
      totalPaid,
      totalPending
    };
  };

  const confirmPayment = async() => {
    if (!selectedUser) return;

    const capital = parseFloat(capitalAmount) || 0;
    const interest = parseFloat(interestAmount) || 0;
    // const totalAmount = capital + interest;

  const data: ILoanPayment = await apiRecordPayment(assemblyRun!.id, {
      userId: selectedUser.id,
      amount: Number(capital),
      interest: Number(interest),
      date: assemblyRun?.startAt ?? new Date(),
      description: description || undefined,
    });
    console.log("Payment recorded:", data);
    // Refresh payments data
    if (data) {
      const findPayment = paymentsData.payments.find(p => p.userId === selectedUser.id);
      if (findPayment) {
        // Update existing payment
        findPayment.amount = Number(data.amount);
        findPayment.interest = Number(data.interest);
        findPayment.date = data.date; // Update to latest payment date
      } else {
        // Add new payment
        setPaymentsData(prev => ({
          ...prev,
          payments: [...prev.payments, data]
        }));
      }
    }
    
    setModalOpen(false);
    setSelectedUser(null);
  };

  


 


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recolectar Intereses</CardTitle>
        <CardDescription>Lista de usuarios - registra pagos de intereses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Totals Section - Moved to top */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Cuota</div>
            <div className="text-2xl font-bold">S/ {calculateTotals().totalInstallment.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Capital</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              S/ {calculateTotals().totalCapital.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Interés</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              S/ {calculateTotals().totalInterest.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Pagado</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              S/ {calculateTotals().totalPaid.toFixed(2)}
            </div>
          </div>
          {/* <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Pendiente</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              S/ {calculateTotals().totalPending.toFixed(2)}
            </div>
          </div> */}
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombres</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsData.partners.map((user) => {
                const payment = paymentsData.payments.find(p => p.userId === user.id);
                const paymentAmount = Number(payment?.amount || 0) + Number(payment?.interest || 0);

                 //cuota
                const installment = paymentsData.installments.find(i => i.userId === user.id);
                const hasPaid = (paymentAmount) > 0;
                const installmentAmount = Number(installment?.amount) || 0;

                //payment
                return (
                  <TableRow key={user.id} className={getRowColor(hasPaid, installmentAmount)}>
                    <TableCell className="text-sm font-medium">{`${user.name} ${user.lastname}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <div className="font-semibold">S/ {installmentAmount.toFixed(2)}</div>
                          {(() => {
                            const currentInstallment = currentMonthInstallments.find(
                              inst => inst.user?.id === user.id
                            );
                            return currentInstallment ? (
                              <div className="text-muted-foreground">
                                <span className="font-medium text-blue-600">Cap: S/ {(currentInstallment.payment).toFixed(2)}</span>
                                <span className="ml-2 font-medium text-purple-600">Int: S/ {currentInstallment.interest.toFixed(2)}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPaymentStatusColor(
                            paymentAmount
                          )} text-white`}
                        >
                          S/. {paymentAmount.toFixed(2)}
                        </Badge>
                       
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
                      <Button
                        onClick={() => handlePayInterest(user)}
                        size="sm"
                        variant={hasPaid ? "outline" : "default"}
                        className="gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pagar
                        {/* {payment?.status === 'paid' ? 'Actualizar' : hasPaid ? 'Pagar Más' : 'Pagar'} */}
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
                      S/ {(() => {
                        const installment = paymentsData.installments.find(i => i.userId === selectedUser.id);
                        return (Number(installment?.amount) || 0).toFixed(2);
                      })()}
                    </div>
                  </div>
                 
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capital" className="text-right">
                      Capital a Pagar
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="capital"
                        type="number"
                        value={capitalAmount}
                        onChange={(e) => setCapitalAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="interest" className="text-right">
                      Interés a Pagar
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="interest"
                        type="number"
                        value={interestAmount}
                        onChange={(e) => setInterestAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      {selectedUser && (() => {
                        const currentInstallment = currentMonthInstallments.find(inst => inst.user?.id === selectedUser.id);
                        return currentInstallment ? (
                          <p className="text-sm text-purple-600 mt-1">
                            Interés sugerido: S/ {currentInstallment.interest.toFixed(2)}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Propósito
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción del pago"
                      />
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
              <DialogTitle>Detalles de Pago</DialogTitle>
              <DialogDescription>
                {selectedUser && `Información detallada de pagos para ${selectedUser.name} ${selectedUser.lastname}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {selectedUser && (
                <>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Capital Pagado</Label>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        S/ {(() => {
                          const payment = paymentsData.payments.find(p => p.userId === selectedUser.id);
                          return (Number(payment?.amount) || 0).toFixed(2);
                        })()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Interés Pagado</Label>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        S/ {(() => {
                          const payment = paymentsData.payments.find(p => p.userId === selectedUser.id);
                          return (Number(payment?.interest) || 0).toFixed(2);
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Resumen de Pagos</Label>
                    <div className="space-y-2">
                      {(() => {
                        const payment = paymentsData.payments.find(p => p.userId === selectedUser.id);
                        // const installment = paymentsData.installments.find(i => i.userId === selectedUser.id);
                        // const installmentAmount = Number(installment?.amount) || 0;
                        const paidAmount = Number(payment?.amount) || 0;
                        const paidInterest = Number(payment?.interest) || 0;
                        const totalPaid = paidAmount + paidInterest;

                        // Find the loan balance for this user from current month installments
                        const currentInstallment = currentMonthInstallments.find(inst => inst.user?.id === selectedUser.id);
                        const loanBalance = currentInstallment ? currentInstallment.loan?.balance || 0 : 0;

                        return (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-blue-700 dark:text-blue-400">Pagado este Mes</Label>
                                <div className="text-xl font-bold text-blue-800 dark:text-blue-300">
                                  S/ {totalPaid.toFixed(2)}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-500">
                                  Capital: S/ {paidAmount.toFixed(2)} | Interés: S/ {paidInterest.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">Saldo del Préstamo</Label>
                                <div className="text-xl font-bold text-orange-800 dark:text-orange-300">
                                  S/ {loanBalance.toFixed(2)}
                                </div>
                                <div className="text-xs text-orange-600 dark:text-orange-500">
                                  Balance pendiente del préstamo
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Historial de Pagos</Label>
                    <div className="space-y-2">
                      {(() => {
                        const payment = paymentsData.payments.find(p => p.userId === selectedUser.id);
                        return payment ? (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-green-800 dark:text-green-400">
                                  Pago Registrado
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-500">
                                  {new Date(payment.date).toLocaleDateString('es-PE')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-800 dark:text-green-400">
                                  S/ {(Number(payment.amount) + Number(payment.interest)).toFixed(2)}
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
                        );
                      })()}
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


