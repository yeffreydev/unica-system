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
import { Checkbox } from "@/components/ui/checkbox";

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
  const [selectedInstallments, setSelectedInstallments] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [currentMonthInstallments, setCurrentMonthInstallments] = useState<ILoanInstallment[]>([]);
  const [userInstallments, setUserInstallments] = useState<ILoanInstallment[]>([]);
  const [editedAmounts, setEditedAmounts] = useState<Record<string, { capital: string; interest: string }>>({});

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
    
    // Get all installments for this user from current month
    const installmentsForUser = currentMonthInstallments.filter(inst => inst.user?.id === user.id);
    setUserInstallments(installmentsForUser);
    
    // Select all current month installments by default
    const installmentIds = installmentsForUser.map(inst => inst.id || '');
    setSelectedInstallments(installmentIds);
    
    // Initialize edited amounts with default values
    const initialAmounts: Record<string, { capital: string; interest: string }> = {};
    installmentsForUser.forEach(inst => {
      if (inst.id) {
        initialAmounts[inst.id] = {
          capital: (inst.payment - inst.interest).toString(),
          interest: inst.interest.toString()
        };
      }
    });
    setEditedAmounts(initialAmounts);
    
    const existingPayment = paymentsData.payments.find(p => p.userId === user.id);
    setDescription(existingPayment?.description || '');
    
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

    // Calculate totals from selected installments using edited amounts
    const selectedInstallmentsData = userInstallments.filter(inst => 
      selectedInstallments.includes(inst.id || '')
    );
    
    const capital = selectedInstallmentsData.reduce((sum, inst) => {
      const edited = editedAmounts[inst.id || ''];
      return sum + (parseFloat(edited?.capital) || 0);
    }, 0);
    
    const interest = selectedInstallmentsData.reduce((sum, inst) => {
      const edited = editedAmounts[inst.id || ''];
      return sum + (parseFloat(edited?.interest) || 0);
    }, 0);

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
    setSelectedInstallments([]);
    setUserInstallments([]);
    setEditedAmounts({});
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
              <DialogTitle>Registrar Pago de Cuotas</DialogTitle>
              <DialogDescription>
                {selectedUser && `Selecciona las cuotas a pagar para ${selectedUser.name} ${selectedUser.lastname}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {selectedUser && (
                <>
                  {/* Installments List */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Cuotas del Mes Actual</Label>
                    {userInstallments.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                        No hay cuotas pendientes para este mes
                      </div>
                    ) : (
                      userInstallments.map((installment, index) => {
                        const isSelected = selectedInstallments.includes(installment.id || '');
                        const loan = installment.loan;
                        
                        return (
                          <div
                            key={installment.id || index}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-muted hover:border-primary/50'
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedInstallments(prev => 
                                  prev.filter(id => id !== installment.id)
                                );
                              } else {
                                setSelectedInstallments(prev => [...prev, installment.id || '']);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => {}} // Handled by div onClick
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                      Cuota #{installment.installment_number || index + 1}
                                    </span>
                                    {loan && (
                                      <Badge variant="outline" className="text-xs">
                                        {loan.loanType?.name || 'Préstamo'}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Loan Preview */}
                                  {loan && (
                                    <div className="text-xs text-muted-foreground space-y-1 mt-2 p-2 bg-muted/30 rounded">
                                      <div className="flex justify-between">
                                        <span>Monto del préstamo:</span>
                                        <span className="font-medium">S/ {loan.amount?.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Saldo:</span>
                                        <span className="font-medium text-orange-600">S/ {loan.balance?.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tasa de interés:</span>
                                        <span className="font-medium">{loan.interestRate}%</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="ml-3 space-y-2 min-w-[140px]">
                                <div className="text-xs text-muted-foreground font-medium mb-1">Editar montos:</div>
                                <div className="space-y-1.5">
                                  <div>
                                    <Label htmlFor={`capital-${installment.id}`} className="text-xs text-muted-foreground">Capital</Label>
                                    <Input
                                      id={`capital-${installment.id}`}
                                      type="number"
                                      value={editedAmounts[installment.id || '']?.capital || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const numValue = parseFloat(value);
                                        const maxCapital = loan?.balance || 0;
                                        
                                        // Allow empty string or validate against balance
                                        if (value === '' || (numValue >= 0 && numValue <= maxCapital)) {
                                          setEditedAmounts(prev => ({
                                            ...prev,
                                            [installment.id || '']: {
                                              ...prev[installment.id || ''],
                                              capital: value
                                            }
                                          }));
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      step="0.01"
                                      min="0"
                                      max={loan?.balance || undefined}
                                      placeholder="0.00"
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`interest-${installment.id}`} className="text-xs text-muted-foreground">Interés</Label>
                                    <Input
                                      id={`interest-${installment.id}`}
                                      type="number"
                                      value={editedAmounts[installment.id || '']?.interest || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setEditedAmounts(prev => ({
                                          ...prev,
                                          [installment.id || '']: {
                                            ...prev[installment.id || ''],
                                            interest: value
                                          }
                                        }));
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="pt-1 border-t">
                                    <div className="text-xs text-muted-foreground">Total:</div>
                                    <div className="font-bold text-sm">
                                      S/ {(() => {
                                        const edited = editedAmounts[installment.id || ''];
                                        const capital = parseFloat(edited?.capital) || 0;
                                        const interest = parseFloat(edited?.interest) || 0;
                                        return (capital + interest).toFixed(2);
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Input
                      id="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descripción del pago"
                    />
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
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              {selectedUser && (() => {
                const payment = paymentsData.payments.find(p => p.userId === selectedUser.id);
                const paidCapital = Number(payment?.amount) || 0;
                const paidInterest = Number(payment?.interest) || 0;
                const totalPaid = paidCapital + paidInterest;
                
                const userInstallmentsForDetail = currentMonthInstallments.filter(
                  inst => inst.user?.id === selectedUser.id
                );
                
                // Check if all balances are paid off
                const allBalancesPaid = userInstallmentsForDetail.every(
                  inst => (inst.loan?.balance || 0) === 0
                );

                return (
                  <>
                    {/* Celebration Message */}
                    {allBalancesPaid && userInstallmentsForDetail.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">⭐</div>
                          <div className="flex-1">
                            <div className="font-semibold text-yellow-800 dark:text-yellow-300">
                              ¡Felicitaciones!
                            </div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-400">
                              Has pagado todo el saldo del préstamo
                            </div>
                          </div>
                          <div className="text-3xl">⭐</div>
                        </div>
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Capital Pagado</div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          S/ {paidCapital.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Interés Pagado</div>
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          S/ {paidInterest.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Installments Detail */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Cuotas del Mes</Label>
                      {userInstallmentsForDetail.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                          No hay cuotas para este mes
                        </div>
                      ) : (
                        userInstallmentsForDetail.map((installment, index) => {
                          const loan = installment.loan;
                          const expectedCapital = installment.payment - installment.interest;
                          const expectedInterest = installment.interest;
                          
                          // Calculate how much was paid for this installment
                          // This is a simplified version - you might need to adjust based on your business logic
                          const installmentPaidCapital = totalPaid > 0 ? expectedCapital : 0;
                          const installmentPaidInterest = totalPaid > 0 ? expectedInterest : 0;
                          const installmentPaid = installmentPaidCapital + installmentPaidInterest;
                          const installmentTotal = installment.payment;
                          
                          const paidPercentage = (installmentPaid / installmentTotal) * 100;

                          return (
                            <div
                              key={installment.id || index}
                              className="p-4 border rounded-lg bg-card"
                            >
                              <div className="space-y-3">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                      Cuota #{installment.installment_number || index + 1}
                                    </span>
                                    {loan && (
                                      <Badge variant="outline" className="text-xs">
                                        {loan.loanType?.name || 'Préstamo'}
                                      </Badge>
                                    )}
                                  </div>
                                  {paidPercentage === 100 && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Pagado ✓
                                    </Badge>
                                  )}
                                </div>

                                {/* Payment Progress */}
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Pago de cuota</span>
                                    <span className="font-medium">
                                      S/ {installmentPaid.toFixed(2)} / S/ {installmentTotal.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full transition-all"
                                      style={{ width: `${Math.min(paidPercentage, 100)}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Payment Details */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                                    <div className="text-muted-foreground">Capital pagado</div>
                                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                                      S/ {installmentPaidCapital.toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                                    <div className="text-muted-foreground">Interés pagado</div>
                                    <div className="font-semibold text-purple-600 dark:text-purple-400">
                                      S/ {installmentPaidInterest.toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                {/* Loan Info */}
                                {loan && (
                                  <div className="pt-2 border-t space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Saldo del préstamo:</span>
                                      <span className={`font-semibold ${
                                        loan.balance === 0 
                                          ? 'text-green-600 dark:text-green-400' 
                                          : 'text-orange-600 dark:text-orange-400'
                                      }`}>
                                        S/ {(loan.balance || 0).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Monto prestado:</span>
                                      <span className="font-medium">S/ {(loan.amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Capital pagado del saldo:</span>
                                      <span className="font-semibold text-green-600 dark:text-green-400">
                                        S/ {((loan.amount || 0) - (loan.balance || 0)).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
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


