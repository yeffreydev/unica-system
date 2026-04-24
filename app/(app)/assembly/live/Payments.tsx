"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CreditCard, Info, Search, Banknote, Loader2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { sileo } from "sileo";
import { IUser } from "@/types/IUser";
import { IAssemblyScheduleRun, ILoanPayment, IPaymentData } from "../types";
import { apiGetAssemblyRun, apiGetPaymentsData, apiRecordPayment } from "../api";
import { useAssembly } from "../AssemblyContext";
import { AppContext } from "@/context/AppContext";

import { ILoanInstallment } from "@/types/ILoan";
import apiClient from "@/config/apiClient";
import { Checkbox } from "@/components/ui/checkbox";

export default function Payments() {
  const { assembly } = useAssembly();
  const { bank } = useContext(AppContext);
  const configuredRoundingMode = bank?.bank?.loanInterestRoundingMode ?? "NORMAL";
  const configuredRoundingDigits = bank?.bank?.loanInterestRoundingDigits ?? 2;

  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [paymentsData, setPaymentsData] = useState<IPaymentData>({
    partners: [],
    installments: [],
    payments: []
  });
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedInstallments, setSelectedInstallments] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [currentMonthInstallments, setCurrentMonthInstallments] = useState<ILoanInstallment[]>([]);
  const [userInstallments, setUserInstallments] = useState<ILoanInstallment[]>([]);
  const [editedAmounts, setEditedAmounts] = useState<Record<string, { capital: string; interest: string; description: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payingUserId, setPayingUserId] = useState<string | null>(null);

  const roundConfiguredInterest = (value: number) => {
    const factor = 10 ** configuredRoundingDigits;
    if (configuredRoundingMode === "UP") return Math.ceil(value * factor - Number.EPSILON) / factor;
    if (configuredRoundingMode === "DOWN") return Math.floor(value * factor + Number.EPSILON) / factor;
    return Math.round(value * factor) / factor;
  };

  const getInstallmentInterest = (installment: ILoanInstallment) => {
    const paidInterest = installment.paymentInterest;
    if (paidInterest !== null && paidInterest !== undefined) return Number(paidInterest);
    return roundConfiguredInterest(Number(installment.interest || 0));
  };

  useEffect(() => {
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      setAssemblyRun(data);
    })();
  }, [assembly?.lastRun]);

  useEffect(() => {
    if (!assemblyRun) return;
    const fetchData = async () => {
      try {
        const data = await apiGetPaymentsData(assemblyRun.id);
        setPaymentsData(data);
      } catch (error) {
        console.error("Error fetching payments data:", error);
      }
    };
    fetchData();
  }, [assemblyRun]);

  useEffect(() => {
    const fetchAssemblyMonthInstallments = async () => {
      if (!assemblyRun?.id) return;
      try {
        const response = await apiClient.get(`/schedules/assembly/run/${assemblyRun.id}/installments`);
        setCurrentMonthInstallments(response.data);
      } catch (error) {
        console.error("Error fetching assembly month installments:", error);
      }
    };
    fetchAssemblyMonthInstallments();
  }, [assemblyRun?.id]);

  const handlePayInterest = (user: IUser) => {
    setSelectedUser(user);

    const installmentsForUser = currentMonthInstallments.filter(
      inst => inst.user?.id === user.id && inst.isAssemblyMonth
    );
    setUserInstallments(installmentsForUser);

    const installmentIds = installmentsForUser.map(inst => inst.id || '');
    setSelectedInstallments(installmentIds);

    const initialAmounts: Record<string, { capital: string; interest: string; description: string }> = {};
    installmentsForUser.forEach(inst => {
      if (inst.id) {
        if (inst.paymentAmount !== null && inst.paymentAmount !== undefined) {
          initialAmounts[inst.id] = {
            capital: inst.paymentAmount.toString(),
            interest: (inst.paymentInterest || 0).toString(),
            description: inst.paymentDescription || ''
          };
        } else {
          const roundedInterest = getInstallmentInterest(inst);
          initialAmounts[inst.id] = {
            capital: '0',
            interest: roundedInterest.toString(),
            description: ''
          };
        }
      }
    });
    setEditedAmounts(initialAmounts);
    setModalOpen(true);
  };

  const handleShowDetails = (user: IUser) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const partnersWithLoans = paymentsData.partners.filter((user) =>
    currentMonthInstallments.some((inst) => inst.user?.id === user.id && inst.isAssemblyMonth)
  );

  const calculateTotals = () => {
    const totalInstallment = paymentsData.installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
    const totalCapital = paymentsData.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalInterest = paymentsData.payments.reduce((sum, payment) => sum + Number(payment.interest || 0), 0);
    const totalPaid = totalCapital + totalInterest;
    const totalPending = totalInstallment - totalPaid;

    return { totalInstallment, totalCapital, totalInterest, totalPaid, totalPending };
  };

  const confirmPayment = async () => {
    if (!selectedUser || isSubmitting) return;
    setIsSubmitting(true);
    setPayingUserId(selectedUser.id);

    const selectedInstallmentsData = userInstallments.filter(inst =>
      selectedInstallments.includes(inst.id || '')
    );

    try {
      // Procesamos secuencialmente para aprovechar la idempotencia del backend (findFirst + update por installmentId).
      // Si la red falla en medio, reintentar la misma acción no duplica pagos.
      for (const inst of selectedInstallmentsData) {
        const edited = editedAmounts[inst.id || ''];
        const capital = parseFloat(edited?.capital) || 0;
        const interest = parseFloat(edited?.interest) || 0;
        const instDescription = edited?.description || '';

        await apiRecordPayment(assemblyRun!.id, {
          userId: selectedUser.id,
          amount: capital,
          interest: interest,
          date: assemblyRun?.startAt ?? new Date(),
          description: instDescription || undefined,
          installmentId: inst.id,
        });
      }

      try {
        const data = await apiGetPaymentsData(assemblyRun!.id);
        setPaymentsData(data);
      } catch (error) {
        console.error("Error refreshing payments data:", error);
      }

      try {
        const response = await apiClient.get(`/schedules/assembly/run/${assemblyRun!.id}/installments`);
        setCurrentMonthInstallments(response.data);
      } catch (error) {
        console.error("Error refreshing installments:", error);
      }

      sileo.success({
        title: "Pago registrado",
        description: `Cuotas de ${selectedUser.name} actualizadas correctamente.`,
      });

      setModalOpen(false);
      setSelectedUser(null);
      setSelectedInstallments([]);
      setUserInstallments([]);
      setEditedAmounts({});
    } catch (error) {
      console.error("Error confirming payment:", error);
      sileo.error({
        title: "Error al registrar el pago",
        description: "Revisa tu conexión e intenta de nuevo. No se duplicarán pagos ya realizados.",
      });
    } finally {
      setIsSubmitting(false);
      setPayingUserId(null);
    }
  };

  const totals = calculateTotals();
  const paidCount = paymentsData.partners.filter(user => {
    const userPayments = paymentsData.payments.filter(p => p.userId === user.id);
    return userPayments.reduce((sum, p) => sum + Number(p.amount || 0) + Number(p.interest || 0), 0) > 0;
  }).length;

  return (
    <Card className="w-full overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Recolectar Intereses</CardTitle>
          <Badge variant="outline" className="text-xs font-medium gap-1">
            <Banknote className="w-3 h-3" />
            {partnersWithLoans.length} socios
          </Badge>
        </div>

        {/* Stats */}
        {assemblyRun && (
          <div className="flex items-center gap-2 flex-wrap pb-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold tabular-nums">{paidCount}</span>
              <span className="text-muted-foreground">Pagaron</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-semibold tabular-nums">S/ {totals.totalCapital.toFixed(2)}</span>
              <span className="text-muted-foreground">Capital</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="font-semibold tabular-nums">S/ {totals.totalInterest.toFixed(2)}</span>
              <span className="text-muted-foreground">Interés</span>
            </div>
            {totals.totalPaid > 0 && (
              <>
                <div className="h-4 w-px bg-border mx-1" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  S/ {totals.totalPaid.toFixed(2)} total
                </span>
              </>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {!assemblyRun ? (
          <div className="px-5 pb-5 space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="px-5 pt-1 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-0 focus-visible:ring-1 text-sm"
                />
              </div>
            </div>

            {/* Partners List */}
            <div className="px-5 pb-5 space-y-1.5 max-h-[500px] overflow-y-auto">
              {[...partnersWithLoans]
                .filter((user) => {
                  if (!searchQuery.trim()) return true;
                  const fullName = `${user.lastname} ${user.name}`.toLowerCase();
                  return fullName.includes(searchQuery.toLowerCase());
                })
                .sort((a, b) => {
                  const lastNameCompare = (a.lastname || '').localeCompare(b.lastname || '', 'es');
                  if (lastNameCompare !== 0) return lastNameCompare;
                  return (a.name || '').localeCompare(b.name || '', 'es');
                })
                .map((user) => {
                  const userPayments = paymentsData.payments.filter(p => p.userId === user.id);
                  const paymentAmount = userPayments.reduce((sum, p) => sum + Number(p.amount || 0) + Number(p.interest || 0), 0);
                  const hasPaid = paymentAmount > 0;

                  const userAssemblyInstallments = currentMonthInstallments.filter(
                    inst => inst.user?.id === user.id && inst.isAssemblyMonth
                  );

                  const totalBalance = userAssemblyInstallments.reduce((sum, inst) => sum + (inst.loan?.balance || 0), 0);
                  const uniqueLoanIds = new Set(userAssemblyInstallments.map(inst => inst.loanId));
                  const activeLoansCount = uniqueLoanIds.size;
                  const totalInterest = userAssemblyInstallments.reduce((sum, inst) => sum + getInstallmentInterest(inst), 0);
                  const totalInterestPaid = userAssemblyInstallments.reduce((sum, inst) => sum + (inst.paymentInterest || 0), 0);
                  const interestFullyPaid = totalInterestPaid >= totalInterest && totalInterest > 0;
                  const needsAttention = totalInterest > 0 && !hasPaid;

                  return (
                    <div
                      key={user.id}
                      className={`group flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all ${
                        needsAttention ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0 ${
                        hasPaid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {user.name?.[0]}
                        {user.lastname?.[0]}
                      </div>

                      {/* Name & Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {user.lastname}, {user.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {activeLoansCount > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium">
                              {activeLoansCount} {activeLoansCount === 1 ? 'préstamo' : 'préstamos'}
                            </Badge>
                          )}
                          {totalBalance > 0 && (
                            <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                              S/ {totalBalance.toFixed(2)}
                            </span>
                          )}
                          {totalInterest > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                              Int: S/ {totalInterest.toFixed(2)}
                              {interestFullyPaid && <Check className="w-3 h-3 text-emerald-500" />}
                            </span>
                          )}
                          {activeLoansCount === 0 && (
                            <span className="text-[11px] text-muted-foreground">Sin préstamos</span>
                          )}
                        </div>
                      </div>

                      {/* Payment Badge */}
                      {hasPaid && (
                        <button
                          onClick={() => handleShowDetails(user)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/60 transition-colors"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          S/ {paymentAmount.toFixed(2)}
                        </button>
                      )}

                      {!hasPaid && paymentAmount === 0 && (
                        <Button
                          onClick={() => handleShowDetails(user)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {/* Action */}
                      <Button
                        onClick={() => handlePayInterest(user)}
                        size="sm"
                        variant={hasPaid ? "outline" : "default"}
                        className="gap-1.5 h-8 text-xs shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                        disabled={payingUserId === user.id}
                      >
                        {payingUserId === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        {hasPaid ? "Editar" : "Pagar"}
                      </Button>
                    </div>
                  );
                })}
              {partnersWithLoans.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay socios con préstamos en esta asamblea
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Payment Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!isSubmitting) setModalOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago de Cuotas</DialogTitle>
            <DialogDescription>
              {selectedUser && `Selecciona las cuotas a pagar para ${selectedUser.lastname}, ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {selectedUser && (
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
                              onCheckedChange={() => {}}
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
                                  disabled
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={confirmPayment} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando...</>
              ) : (
                "Registrar Pago"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Pago</DialogTitle>
            <DialogDescription>
              {selectedUser && `Información detallada de pagos para ${selectedUser.lastname}, ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
            {selectedUser && (() => {
              const userPaymentsDetail = paymentsData.payments.filter(p => p.userId === selectedUser.id);
              const paidCapital = userPaymentsDetail.reduce((sum, p) => sum + Number(p.amount || 0), 0);
              const paidInterest = userPaymentsDetail.reduce((sum, p) => sum + Number(p.interest || 0), 0);
              const totalPaid = paidCapital + paidInterest;

              const userInstallmentsForDetail = currentMonthInstallments.filter(
                inst => inst.user?.id === selectedUser.id && inst.isAssemblyMonth
              );

              const allBalancesPaid = userInstallmentsForDetail.every(
                inst => (inst.loan?.balance || 0) === 0
              );

              return (
                <>
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
                        const expectedCapital = installment.payment;
                        const expectedInterest = getInstallmentInterest(installment);

                        const installmentPaidCapital = totalPaid > 0 ? expectedCapital : 0;
                        const installmentPaidInterest = totalPaid > 0 ? expectedInterest : 0;
                        const installmentPaid = installmentPaidCapital + installmentPaidInterest;
                        const installmentTotal = expectedCapital + expectedInterest;

                        const paidPercentage = (installmentPaid / installmentTotal) * 100;

                        return (
                          <div
                            key={installment.id || index}
                            className="p-4 border rounded-lg bg-card"
                          >
                            <div className="space-y-3">
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
    </Card>
  );
}
