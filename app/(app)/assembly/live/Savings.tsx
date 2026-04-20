"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wallet, HandCoins, PiggyBank } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGetAssemblyRun, apiGetSavingsData, apiRecordSaving, apiRecordInterestPayment } from "../api";
import { IAssemblyScheduleRun, ISavingsPartner } from "../types";
import { useAssembly } from "../AssemblyContext";

export default function Savings() {
  const { assembly } = useAssembly();

  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [savingsPartners, setSavingsPartners] = useState<ISavingsPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Deposit modal
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<ISavingsPartner | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);

  // Interest payment modal
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [interestAmount, setInterestAmount] = useState(0);
  const [interestDescription, setInterestDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assembly run
  useEffect(() => {
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      setAssemblyRun(data);
    })();
  }, [assembly?.lastRun]);

  // Fetch savings data
  useEffect(() => {
    if (!assemblyRun) return;
    const fetchData = async () => {
      try {
        const data = await apiGetSavingsData(assemblyRun.id);
        setSavingsPartners(data);
      } catch (error) {
        console.error("Error fetching savings data:", error);
      }
    };
    fetchData();
  }, [assemblyRun]);

  // Open deposit modal
  const handleOpenDeposit = (partner: ISavingsPartner) => {
    setSelectedPartner(partner);
    const currentDeposit = partner.deposits.reduce((sum, d) => sum + d.amount, 0);
    setDepositAmount(currentDeposit || 0);
    setDepositModalOpen(true);
  };

  // Confirm deposit
  const handleConfirmDeposit = async () => {
    if (!selectedPartner || !assemblyRun || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await apiRecordSaving(assemblyRun.id, {
        userId: selectedPartner.id,
        amount: depositAmount,
        date: assemblyRun.startAt ?? new Date(),
      });

      setSavingsPartners((prev) =>
        prev.map((p) => {
          if (p.id === selectedPartner.id) {
            if (depositAmount === 0) {
              return { ...p, deposits: [] };
            }
            const existingDeposit = p.deposits.find((d) => d.userId === selectedPartner.id);
            if (existingDeposit) {
              return {
                ...p,
                deposits: p.deposits.map((d) =>
                  d.userId === selectedPartner.id ? { ...d, amount: depositAmount } : d
                ),
              };
            } else {
              return {
                ...p,
                deposits: [...p.deposits, result],
              };
            }
          }
          return p;
        })
      );

      setDepositModalOpen(false);
      setSelectedPartner(null);
      setDepositAmount(0);
    } catch (error) {
      console.error("Error recording saving:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open interest payment modal
  const handleOpenInterest = (partner: ISavingsPartner) => {
    setSelectedPartner(partner);
    const currentInterest = partner.payouts.reduce((sum, p) => sum + p.amount, 0);
    setInterestAmount(currentInterest || 0);
    setInterestDescription(partner.payouts[0]?.description || "");
    setInterestModalOpen(true);
  };

  // Confirm interest payment
  const handleConfirmInterest = async () => {
    if (!selectedPartner || !assemblyRun || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await apiRecordInterestPayment(assemblyRun.id, {
        userId: selectedPartner.id,
        amount: interestAmount,
        description: interestDescription || "Pago de interés a ahorrista",
        date: assemblyRun.startAt ?? new Date(),
      });

      setSavingsPartners((prev) =>
        prev.map((p) => {
          if (p.id === selectedPartner.id) {
            if (interestAmount === 0) {
              return { ...p, payouts: [] };
            }
            if (p.payouts.length > 0) {
              return {
                ...p,
                payouts: p.payouts.map((py, i) =>
                  i === 0 ? { ...py, amount: interestAmount, description: interestDescription || py.description } : py
                ),
              };
            } else {
              return {
                ...p,
                payouts: [result],
              };
            }
          }
          return p;
        })
      );

      setInterestModalOpen(false);
      setSelectedPartner(null);
      setInterestAmount(0);
      setInterestDescription("");
    } catch (error) {
      console.error("Error recording interest payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDeposits = savingsPartners.reduce(
    (sum, p) => sum + p.deposits.reduce((s, d) => s + d.amount, 0),
    0
  );
  const totalInterestPaid = savingsPartners.reduce(
    (sum, p) => sum + p.payouts.reduce((s, py) => s + py.amount, 0),
    0
  );
  const depositorsCount = savingsPartners.filter(
    (p) => p.deposits.reduce((s, d) => s + d.amount, 0) > 0
  ).length;

  return (
    <Card className="w-full overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Gestión de Ahorristas</CardTitle>
          <Badge variant="outline" className="text-xs font-medium gap-1">
            <PiggyBank className="w-3 h-3" />
            {savingsPartners.length} ahorristas
          </Badge>
        </div>

        {/* Stats */}
        {assemblyRun && (
          <div className="flex items-center gap-2 flex-wrap pb-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-semibold tabular-nums">{depositorsCount}</span>
              <span className="text-muted-foreground">Ahorraron</span>
            </div>
            {totalDeposits > 0 && (
              <>
                <div className="h-4 w-px bg-border mx-1" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  S/ {totalDeposits.toFixed(2)} ahorros
                </span>
              </>
            )}
            {totalInterestPaid > 0 && (
              <>
                <div className="h-4 w-px bg-border mx-1" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  S/ {totalInterestPaid.toFixed(2)} intereses
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
              {[...savingsPartners]
                .filter((user) => {
                  if (!searchQuery.trim()) return true;
                  const fullName = `${user.lastname} ${user.name}`.toLowerCase();
                  return fullName.includes(searchQuery.toLowerCase());
                })
                .sort((a, b) => {
                  const lastNameCompare = (a.lastname || "").localeCompare(b.lastname || "", "es");
                  if (lastNameCompare !== 0) return lastNameCompare;
                  return (a.name || "").localeCompare(b.name || "", "es");
                })
                .map((partner) => {
                  const depositTotal = partner.deposits.reduce((sum, d) => sum + d.amount, 0);
                  const interestTotal = partner.payouts.reduce((sum, p) => sum + p.amount, 0);
                  const hasDeposit = depositTotal > 0;

                  return (
                    <div
                      key={partner.id}
                      className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all"
                    >
                      {/* Avatar */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0 ${
                        hasDeposit
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {partner.name?.[0]}
                        {partner.lastname?.[0]}
                      </div>

                      {/* Name & Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {partner.lastname}, {partner.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {hasDeposit ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
                              S/ {depositTotal.toFixed(2)}
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Sin ahorro</span>
                          )}
                          {interestTotal > 0 && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Int: S/ {interestTotal.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 shrink-0">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInterest(partner);
                          }}
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/30 opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <HandCoins className="w-3.5 h-3.5" />
                          Interés
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeposit(partner);
                          }}
                          size="sm"
                          variant={hasDeposit ? "outline" : "default"}
                          className="gap-1.5 h-8 text-xs opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          {hasDeposit ? "Editar" : "Agregar"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              {savingsPartners.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay socios disponibles
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Deposit Modal */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPartner && selectedPartner.deposits.length > 0
                ? "Actualizar Ahorro"
                : "Registrar Ahorro"}
            </DialogTitle>
            <DialogDescription>
              {selectedPartner && `${selectedPartner.name} ${selectedPartner.lastname}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Monto (S/)</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                className="text-lg font-semibold h-10"
                min="0"
                step="0.01"
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monto a registrar</span>
                <span className="text-lg font-bold text-primary">S/ {depositAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDepositModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmDeposit} disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : selectedPartner && selectedPartner.deposits.length > 0
                ? "Actualizar"
                : "Registrar Ahorro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interest Payment Modal */}
      <Dialog open={interestModalOpen} onOpenChange={setInterestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar Interés</DialogTitle>
            <DialogDescription>
              {selectedPartner && `${selectedPartner.name} ${selectedPartner.lastname}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Monto (S/)</Label>
              <Input
                type="number"
                value={interestAmount}
                onChange={(e) => setInterestAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                className="text-lg font-semibold h-10"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Descripción</Label>
              <Input
                type="text"
                placeholder="Pago de interés a ahorrista"
                value={interestDescription}
                onChange={(e) => setInterestDescription(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Interés a pagar</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">S/ {interestAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setInterestModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmInterest} disabled={isSubmitting}>
              {isSubmitting
                ? "Procesando..."
                : selectedPartner && selectedPartner.payouts.length > 0
                ? "Actualizar"
                : "Pagar Interés"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
