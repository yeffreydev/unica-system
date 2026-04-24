"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, HandCoins, PiggyBank, Loader2, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { apiGetAssemblyRun, apiGetSavingsData, apiRecordSaving, apiRecordInterestPayment, apiRecordWithdrawal } from "../api";
import { IAssemblyScheduleRun, ISavingsPartner } from "../types";
import { useAssembly } from "../AssemblyContext";
import { AppContext } from "@/context/AppContext";
import { sileo } from "sileo";

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  onChange: (n: number) => void;
};

function NumberInput({ value, onChange, onBlur, ...rest }: NumberInputProps) {
  const toText = (v: number | null | undefined) =>
    v === null || v === undefined || (typeof v === "number" && Number.isNaN(v)) ? "" : String(v);
  const [text, setText] = useState<string>(toText(value));

  useEffect(() => {
    const current = text === "" || text === "." ? NaN : Number(text);
    const valIsEmpty = value === null || value === undefined || (typeof value === "number" && Number.isNaN(value));
    const curIsEmpty = Number.isNaN(current);
    if (valIsEmpty && curIsEmpty) return;
    if (current !== value) setText(toText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      {...rest}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || /^\d*\.?\d*$/.test(v)) {
          setText(v);
          if (v === "" || v === ".") onChange(0);
          else {
            const n = Number(v);
            if (!isNaN(n)) onChange(n);
          }
        }
      }}
      onBlur={onBlur}
    />
  );
}

export default function Savings() {
  const { assembly } = useAssembly();
  const { bank } = useContext(AppContext);
  const savingsRate = bank?.bank?.savingsInterestRate ?? 0.01;

  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [savingsPartners, setSavingsPartners] = useState<ISavingsPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Movement modal (deposit/withdraw toggle)
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementMode, setMovementMode] = useState<"deposit" | "withdraw">("deposit");
  const [selectedPartner, setSelectedPartner] = useState<ISavingsPartner | null>(null);
  const [movementAmount, setMovementAmount] = useState(0);

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

  // Open movement modal (deposit or withdraw)
  const handleOpenMovement = (partner: ISavingsPartner, mode: "deposit" | "withdraw") => {
    setSelectedPartner(partner);
    setMovementMode(mode);
    const existing =
      mode === "deposit"
        ? partner.deposits.reduce((sum, d) => sum + d.amount, 0)
        : (partner.withdrawals ?? []).reduce((sum, w) => sum + w.amount, 0);
    setMovementAmount(existing || 0);
    setMovementModalOpen(true);
  };

  // Confirm deposit or withdraw — refetches after save for consistent balance
  const handleConfirmMovement = async () => {
    if (!selectedPartner || !assemblyRun || isSubmitting) return;
    if (movementMode === "withdraw" && movementAmount > selectedPartner.savingsBalance) {
      sileo.error({
        title: "Monto excede balance",
        description: `Balance disponible: S/ ${selectedPartner.savingsBalance.toFixed(2)}.`,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (movementMode === "deposit") {
        await apiRecordSaving(assemblyRun.id, {
          userId: selectedPartner.id,
          amount: movementAmount,
          date: assemblyRun.startAt ?? new Date(),
        });
        sileo.success({ title: "Depósito registrado", description: `S/ ${movementAmount.toFixed(2)} ingresó al ahorro.` });
      } else {
        await apiRecordWithdrawal(assemblyRun.id, {
          userId: selectedPartner.id,
          amount: movementAmount,
          date: assemblyRun.startAt ?? new Date(),
        });
        sileo.success({ title: "Retiro registrado", description: `S/ ${movementAmount.toFixed(2)} retirado del ahorro.` });
      }

      const fresh = await apiGetSavingsData(assemblyRun.id);
      setSavingsPartners(fresh);

      setMovementModalOpen(false);
      setSelectedPartner(null);
      setMovementAmount(0);
    } catch (error) {
      console.error("Error recording movement:", error);
      sileo.error({ title: "Error", description: "No se pudo registrar la operación." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open interest payment modal
  const handleOpenInterest = (partner: ISavingsPartner) => {
    setSelectedPartner(partner);
    const currentInterest = partner.payouts.reduce((sum, p) => sum + p.amount, 0);
    const suggested = currentInterest > 0 ? currentInterest : Number((partner.savingsBalance * savingsRate).toFixed(2));
    setInterestAmount(suggested);
    setInterestDescription(partner.payouts[0]?.description || "");
    setInterestModalOpen(true);
  };

  // Confirm interest payment
  const handleConfirmInterest = async () => {
    if (!selectedPartner || !assemblyRun || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await apiRecordInterestPayment(assemblyRun.id, {
        userId: selectedPartner.id,
        amount: interestAmount,
        description: interestDescription || "Pago de interés a ahorrista",
        date: assemblyRun.startAt ?? new Date(),
      });

      const fresh = await apiGetSavingsData(assemblyRun.id);
      setSavingsPartners(fresh);

      sileo.success({ title: "Interés pagado", description: `S/ ${interestAmount.toFixed(2)} a ${selectedPartner.name}.` });

      setInterestModalOpen(false);
      setSelectedPartner(null);
      setInterestAmount(0);
      setInterestDescription("");
    } catch (error) {
      console.error("Error recording interest payment:", error);
      sileo.error({ title: "Error", description: "No se pudo registrar el pago de interés." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const savers = savingsPartners.filter((p) => (p.savingsBalance ?? 0) > 0);
  const totalDeposits = savers.reduce(
    (sum, p) => sum + p.deposits.reduce((s, d) => s + d.amount, 0),
    0
  );
  const totalWithdrawals = savers.reduce(
    (sum, p) => sum + (p.withdrawals ?? []).reduce((s, w) => s + w.amount, 0),
    0
  );
  const totalInterestPaid = savers.reduce(
    (sum, p) => sum + p.payouts.reduce((s, py) => s + py.amount, 0),
    0
  );
  const visiblePartners = savingsPartners
    .filter((user) => {
      if (!searchQuery.trim()) return true;
      const fullName = `${user.lastname} ${user.name}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const aHasSavings = (a.savingsBalance ?? 0) > 0;
      const bHasSavings = (b.savingsBalance ?? 0) > 0;
      if (aHasSavings !== bHasSavings) return aHasSavings ? -1 : 1;

      const lastNameCompare = (a.lastname || "").localeCompare(b.lastname || "", "es");
      if (lastNameCompare !== 0) return lastNameCompare;
      return (a.name || "").localeCompare(b.name || "", "es");
    });

  return (
    <Card className="w-full overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Gestión de Ahorristas</CardTitle>
          <Badge variant="outline" className="text-xs font-medium gap-1">
            <PiggyBank className="w-3 h-3" />
            {savers.length} ahorristas
          </Badge>
        </div>

        {/* Stats */}
        {assemblyRun && (
          <div className="flex items-center gap-2 flex-wrap pb-4">
            {totalDeposits > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-xs border border-emerald-200 dark:border-emerald-900">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">+S/ {totalDeposits.toFixed(2)}</span>
                <span className="text-muted-foreground">depósitos</span>
              </div>
            )}
            {totalWithdrawals > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 text-xs border border-amber-200 dark:border-amber-900">
                <TrendingDown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold tabular-nums text-amber-700 dark:text-amber-400">-S/ {totalWithdrawals.toFixed(2)}</span>
                <span className="text-muted-foreground">retiros</span>
              </div>
            )}
            {totalInterestPaid > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 dark:bg-red-950/30 text-xs border border-red-200 dark:border-red-900">
                <HandCoins className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span className="font-semibold tabular-nums text-red-700 dark:text-red-400">-S/ {totalInterestPaid.toFixed(2)}</span>
                <span className="text-muted-foreground">intereses</span>
              </div>
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
              {visiblePartners
                .map((partner) => {
                  const depositRun = partner.deposits.reduce((sum, d) => sum + d.amount, 0);
                  const withdrawRun = (partner.withdrawals ?? []).reduce((sum, w) => sum + w.amount, 0);
                  const interestRun = partner.payouts.reduce((sum, p) => sum + p.amount, 0);
                  const balance = partner.savingsBalance ?? 0;

                  return (
                    <div
                      key={partner.id}
                      className="group flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r from-card to-blue-50/30 dark:to-blue-950/20 hover:shadow-md transition-all"
                    >
                      {/* Avatar */}
                      <div className="flex items-center justify-center w-11 h-11 rounded-full text-xs font-bold shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 ring-2 ring-blue-200/50 dark:ring-blue-900/50">
                        {partner.name?.[0]}
                        {partner.lastname?.[0]}
                      </div>

                      {/* Name & Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {partner.lastname}, {partner.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 text-[11px] font-semibold">
                            <PiggyBank className="w-3 h-3" />
                            S/ {balance.toFixed(2)}
                          </div>
                          {depositRun > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <TrendingUp className="w-3 h-3" />
                              +S/ {depositRun.toFixed(2)}
                            </span>
                          )}
                          {withdrawRun > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <TrendingDown className="w-3 h-3" />
                              -S/ {withdrawRun.toFixed(2)}
                            </span>
                          )}
                          {interestRun > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                              <HandCoins className="w-3 h-3" />
                              -S/ {interestRun.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 shrink-0">
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleOpenInterest(partner); }}
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8 text-xs text-red-700 border-red-200 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:border-red-900 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                        >
                          <HandCoins className="w-3.5 h-3.5" />
                          Pagar Interés
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleOpenMovement(partner, "deposit"); }}
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8 text-xs text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          Depositar
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleOpenMovement(partner, "withdraw"); }}
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8 text-xs text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-900 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
                        >
                          <ArrowDownCircle className="w-3.5 h-3.5" />
                          Retirar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              {visiblePartners.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {searchQuery.trim() ? "No hay socios que coincidan con la búsqueda" : "No hay socios registrados"}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Movement Modal — Deposit / Withdraw */}
      <Dialog open={movementModalOpen} onOpenChange={(open) => { if (!isSubmitting) setMovementModalOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {movementMode === "deposit" ? (
                <><ArrowUpCircle className="w-5 h-5 text-emerald-600" /> Depositar Ahorro</>
              ) : (
                <><ArrowDownCircle className="w-5 h-5 text-amber-600" /> Retirar Ahorro</>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedPartner && `${selectedPartner.name} ${selectedPartner.lastname}`}
              {selectedPartner && (
                <span className="block mt-1 text-[11px]">
                  Balance actual: S/ {(selectedPartner.savingsBalance ?? 0).toFixed(2)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Toggle deposit/withdraw */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovementMode("deposit")}
                disabled={isSubmitting}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50 ${
                  movementMode === "deposit"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 shadow-sm"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Depositar
              </button>
              <button
                type="button"
                onClick={() => setMovementMode("withdraw")}
                disabled={isSubmitting}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50 ${
                  movementMode === "withdraw"
                    ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 shadow-sm"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                Retirar
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Monto (S/)</Label>
              <NumberInput
                value={movementAmount}
                onChange={setMovementAmount}
                className="text-lg font-semibold h-11"
                disabled={isSubmitting}
              />
            </div>

            <div className={`rounded-lg p-3 border ${movementMode === "deposit"
              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
              : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"}`}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {movementMode === "deposit" ? "Se sumará al balance" : "Se restará del balance"}
                </span>
                <span className={`text-lg font-bold ${movementMode === "deposit"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"}`}>
                  {movementMode === "deposit" ? "+" : "-"}S/ {movementAmount.toFixed(2)}
                </span>
              </div>
              {selectedPartner && (
                <div className="text-[11px] text-muted-foreground mt-1">
                  Nuevo balance: S/ {(
                    (selectedPartner.savingsBalance ?? 0) +
                    (movementMode === "deposit" ? movementAmount : -movementAmount)
                  ).toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMovementModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmMovement}
              disabled={isSubmitting}
              className={movementMode === "deposit"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
              ) : movementMode === "deposit" ? "Confirmar Depósito" : "Confirmar Retiro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interest Payment Modal */}
      <Dialog open={interestModalOpen} onOpenChange={(open) => { if (!isSubmitting) setInterestModalOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-red-600" /> Pagar Interés
            </DialogTitle>
            <DialogDescription>
              {selectedPartner && `${selectedPartner.name} ${selectedPartner.lastname}`}
              {selectedPartner && (
                <span className="block mt-1 text-[11px]">
                  Tasa: {(savingsRate * 100).toFixed(2)}% · Balance: S/ {(selectedPartner.savingsBalance ?? 0).toFixed(2)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Monto (S/)</Label>
              <NumberInput
                value={interestAmount}
                onChange={setInterestAmount}
                className="text-lg font-semibold h-11"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Sugerencia: S/ {selectedPartner ? (selectedPartner.savingsBalance * savingsRate).toFixed(2) : "0.00"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Descripción</Label>
              <Input
                type="text"
                placeholder="Pago de interés a ahorrista"
                value={interestDescription}
                onChange={(e) => setInterestDescription(e.target.value)}
                className="h-10"
                disabled={isSubmitting}
              />
            </div>

            <div className="rounded-lg p-3 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Interés a pagar</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  -S/ {interestAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setInterestModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmInterest}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
              ) : selectedPartner && selectedPartner.payouts.length > 0 ? (
                "Actualizar Pago"
              ) : (
                "Pagar Interés"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
