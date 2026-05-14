"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "../OnboardingProvider";
import { createLoan, getDefaultLoanType } from "../api";
import { StepShell } from "../components/StepShell";

export function StepLoans() {
  const { state, setState } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const setLoan = (uid: string, patch: Partial<{ amount: number; months: number }>) =>
    setState((s) => {
      const prev = s.loans[uid] ?? { amount: 0, months: 12 };
      return {
        ...s,
        loans: { ...s.loans, [uid]: { ...prev, ...patch } },
      };
    });

  const onNext = async () => {
    setSaving(true);
    try {
      const loanTypeId = state.loanTypeId ?? (await getDefaultLoanType());
      if (!loanTypeId) {
        toast({
          title: "Sin tipo de préstamo",
          description: "Configura los tipos de préstamo antes de continuar.",
          variant: "destructive",
        });
        throw new Error("no loan type");
      }
      if (!state.loanTypeId) setState((s) => ({ ...s, loanTypeId }));
      const rate = (state.bank.loanInterestRate || 0) / 100;

      for (const [uid, loan] of Object.entries(state.loans)) {
        if (loan && loan.amount > 0 && loan.months > 0) {
          await createLoan(uid, loan, loanTypeId, rate, state.cutoffDate);
        }
      }
      toast({ title: "Préstamos registrados" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
      throw e;
    } finally {
      setSaving(false);
    }
  };

  if (state.users.length === 0) {
    return (
      <StepShell stepId="loans" title="Préstamos acumulados por socio" onNext={onNext} saving={saving}>
        <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
          Agrega socios primero.
        </div>
      </StepShell>
    );
  }

  const total = Object.values(state.loans).reduce(
    (acc, l) => acc + (Number(l?.amount) || 0),
    0
  );

  return (
    <StepShell
      stepId="loans"
      title="Préstamos acumulados por socio"
      description={`Préstamos vigentes (saldo + cuotas restantes) por socio a la fecha ${state.cutoffDate}.`}
      onNext={onNext}
      saving={saving}
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-border divide-y">
          <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-6">Socio</div>
            <div className="col-span-3 text-right">Monto (S/)</div>
            <div className="col-span-3 text-right">Cuotas restantes</div>
          </div>
          {state.users.map((u) => {
            const l = state.loans[u.id] ?? { amount: 0, months: 12 };
            return (
              <div key={u.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3">
                <div className="col-span-6 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {u.name} {u.lastname}
                  </p>
                  <p className="text-xs text-muted-foreground">DNI {u.dni}</p>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={l.amount || ""}
                    onChange={(e) => setLoan(u.id, { amount: Number(e.target.value) || 0 })}
                    className="text-right"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="12"
                    value={l.months || ""}
                    onChange={(e) => setLoan(u.id, { months: Number(e.target.value) || 0 })}
                    className="text-right"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end text-sm">
          <span className="text-muted-foreground mr-2">Total préstamos:</span>
          <span className="font-semibold">
            S/ {total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Tasa aplicada: {state.bank.loanInterestRate}% mensual. Tipo: cuota fija (FIXED).
        </p>
      </div>
    </StepShell>
  );
}
