"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Filter, Plus, ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

import { IDeposit } from "../../incomes/deposits/types";
import { DepositForm } from "../../incomes/deposits/DepositForm";
import { useAssembly } from "../AssemblyContext";
import { IAssemblyScheduleRun } from "../types";
import { apiGetAssemblyRun } from "../api";
import apiClient from "@/config/apiClient";
import { ISocialFundsTransaction } from "@/types/ISocialFunds";

import { SocialLegalFundsForm } from "../../incomes/social/SocialLegalFundsForm";
import { IOtherIncome } from "../../incomes/others/types";

import { OtherIncomeForm } from "../../incomes/others/OtherIncomeForm";
import { socialFundsData } from "@/constants";
import { IWithdrawal } from "../../expenses/withdrawls/types";

import { WithdrawForm } from "../../expenses/withdrawls/WithdrawForm";
import { IAdministrativeExpense } from "../../expenses/administrative/types";

import { AdminExpenseForm } from "../../expenses/administrative/AdminExpenseForm";
import { IPayout } from "../../expenses/payouts/types";

import { InterestPaymentForm } from "../../expenses/payouts/InterestPaymentForm";
import { ISocialFundsExpenseTransaction } from "../../expenses/social/types";

import { SocialLegalFundsExpenseForm } from "../../expenses/social/SocialLegalFundsExpenseForm";
import { IOtherExpense } from "../../expenses/others/types";

import { OtherExpenseForm } from "../../expenses/others/OtherExpenseForm";
import { ISocialFunds } from "@/types/ISocialFunds";
import { IDividendsWithdraw } from "../../expenses/dividends/types";
import { DividendsWithdrawForm } from "../../expenses/dividends/DividendsWithdrawForm";

type OperationCategory = 'ingreso' | 'egreso';
type OperationType = 'deposit' | 'fund' | 'other-income' | 'withdrawal' | 'administrative' | 'payout' | 'social-expense' | 'other-expense' | 'dividend';

interface UnifiedOperation {
  id: string;
  category: OperationCategory;
  type: OperationType;
  date: Date;
  amount: number;
  user?: string;
  description: string;
  raw: IDeposit | ISocialFundsTransaction | IOtherIncome | IWithdrawal | IAdministrativeExpense | IPayout | ISocialFundsExpenseTransaction | IOtherExpense | IDividendsWithdraw;
}

export default function Operations() {
  const [deposits, setDeposits] = useState<IDeposit[]>([]);
  const [funds, setFunds] = useState<ISocialFundsTransaction[]>([]);
  const [otherIncomes, setOtherIncomes] = useState<IOtherIncome[]>([]);
  const [withdrawals, setWithdrawals] = useState<IWithdrawal[]>([]);
  const [administrativeExpenses, setAdministrativeExpenses] = useState<IAdministrativeExpense[]>([]);
  const [payouts, setPayouts] = useState<IPayout[]>([]);
  const [socialFundsExpenses, setSocialFundsExpenses] = useState<ISocialFundsExpenseTransaction[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<IOtherExpense[]>([]);
  const [dividends, setDividends] = useState<IDividendsWithdraw[]>([]);

  const { assembly } = useAssembly();
  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [socialFunds, setSocialFunds] = useState<ISocialFunds[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [activeDialog, setActiveDialog] = useState<OperationType | null>(null);
  const [editDeposit, setEditDeposit] = useState<IDeposit | null>(null);

  const closeDialog = () => {
    setOpenDialog(false);
    setActiveDialog(null);
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: OperationType} | null>(null);

  const [filterCategory, setFilterCategory] = useState<'all' | 'ingreso' | 'egreso'>('all');

  useEffect(() => {
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      setAssemblyRun(data);
    })();
  }, [assembly?.lastRun]);

  useEffect(() => {
    if (!assemblyRun?.id) return;

    const fetchAll = async () => {
       try {
        const [depRes, fundsRes, otherIncRes, withdrawRes, adminRes, payoutRes, socialExpRes, otherExpRes, dividendsRes] = await Promise.all([
          apiClient.get(`/deposits/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/incomes/social-funds/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/incomes/others/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/withdrawals/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/administrative/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/payouts/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/social-funds/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/others/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/dividends/schedule-run/${assemblyRun.id}`),
        ]);

        setDeposits(depRes.data || []);
        setFunds(fundsRes.data || []);
        setOtherIncomes(otherIncRes.data || []);
        setWithdrawals(withdrawRes.data || []);
        setAdministrativeExpenses(adminRes.data || []);
        setPayouts(payoutRes.data || []);
        setSocialFundsExpenses(socialExpRes.data || []);
        setOtherExpenses(otherExpRes.data || []);
        setDividends(dividendsRes.data || []);
       } catch(e) {
         console.error("Error fetching operations", e);
       }
    };

    fetchAll();
  }, [assemblyRun?.id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/banks/social-funds-types");
        setSocialFunds(res.data || []);
      } catch (error) {
        console.error("Error fetching social funds types:", error);
      }
    })();
  }, []);

  const addDeposit = (deposit: IDeposit) => {
    setDeposits((prev) => [deposit, ...prev]);
  }

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;

    setDeleteConfirmOpen(false);

    try {
        switch(type) {
            case 'deposit':
                await apiClient.delete(`/deposits/${id}`);
                setDeposits(prev => prev.filter(i => i.id !== id));
                break;
            case 'fund':
                await apiClient.delete(`/incomes/social-funds/${id}`);
                setFunds(prev => prev.filter(i => i.id !== id));
                break;
            case 'other-income':
                await apiClient.delete(`/incomes/others/${id}`);
                setOtherIncomes(prev => prev.filter(i => i.id.toString() !== id));
                break;
            case 'withdrawal':
                await apiClient.delete(`/withdrawals/${id}`);
                setWithdrawals(prev => prev.filter(i => i.id.toString() !== id));
                break;
            case 'administrative':
                await apiClient.delete(`/expenses/administrative/${id}`);
                setAdministrativeExpenses(prev => prev.filter(i => i.id !== id));
                break;
            case 'payout':
                await apiClient.delete(`/payouts/${id}`);
                setPayouts(prev => prev.filter(i => i.id.toString() !== id));
                break;
            case 'social-expense':
                await apiClient.delete(`/expenses/social-funds/${id}`);
                setSocialFundsExpenses(prev => prev.filter(i => i.id.toString() !== id));
                break;
            case 'other-expense':
                await apiClient.delete(`/expenses/others/${id}`);
                setOtherExpenses(prev => prev.filter(i => i.id.toString() !== id));
                break;
            case 'dividend':
                await apiClient.delete(`/expenses/dividends/${id}`);
                setDividends(prev => prev.filter(i => i.id.toString() !== id));
                break;
        }
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
    } finally {
        setItemToDelete(null);
    }
  };

  const confirmDelete = (id: string, type: OperationType) => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const allOperations = useMemo<UnifiedOperation[]>(() => {
    const list: UnifiedOperation[] = [];

    funds.forEach(f => list.push({
      id: f.id || '', category: 'ingreso', type: 'fund',
      date: new Date(f.date), amount: f.amount,
      user: f.user?.name || f.user?.lastname || 'Desconocido',
      description: `Fondo Social (${f.socialFunds?.name ? (socialFundsData[f.socialFunds.name as keyof typeof socialFundsData] || f.socialFunds.name) : 'General'})`,
      raw: f
    }));
    otherIncomes.forEach(o => list.push({
      id: o.id.toString(), category: 'ingreso', type: 'other-income',
      date: new Date(o.date), amount: o.amount,
      user: o.user?.name || o.user?.lastname || 'Desconocido',
      description: o.description || 'Otro Ingreso', raw: o
    }));

    administrativeExpenses.forEach(a => list.push({
      id: a.id || '', category: 'egreso', type: 'administrative',
      date: new Date(a.date), amount: a.amount,
      user: '-',
      description: a.description || 'Gasto Administrativo', raw: a
    }));
    socialFundsExpenses.forEach(s => list.push({
      id: s.id.toString(), category: 'egreso', type: 'social-expense',
      date: new Date(s.date), amount: s.amount,
      user: '-',
      description: s.description || 'Gasto Fondo Social', raw: s
    }));
    otherExpenses.forEach(o => list.push({
      id: o.id.toString(), category: 'egreso', type: 'other-expense',
      date: new Date(o.date), amount: o.amount,
      user: '-',
      description: o.description || 'Otro Gasto', raw: o
    }));
    dividends.forEach(d => list.push({
      id: d.id.toString(), category: 'egreso', type: 'dividend',
      date: new Date(d.date), amount: d.amount,
      user: d.user?.name || d.user?.lastname || 'Desconocido',
      description: 'Utilidades', raw: d
    }));

    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [deposits, funds, otherIncomes, withdrawals, administrativeExpenses, payouts, socialFundsExpenses, otherExpenses, dividends]);

  const filteredOperations = useMemo(() => {
    if (filterCategory === 'all') return allOperations;
    return allOperations.filter(op => op.category === filterCategory);
  }, [allOperations, filterCategory]);

  const totalIncome = allOperations.filter(op => op.category === 'ingreso').reduce((sum, op) => sum + op.amount, 0);
  const totalExpense = allOperations.filter(op => op.category === 'egreso').reduce((sum, op) => sum + op.amount, 0);

  const getTypeBadge = (type: OperationType) => {
    const styles: Record<OperationType, { className: string; label: string }> = {
      'deposit': { className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', label: 'Depósito' },
      'fund': { className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800', label: 'Fondo' },
      'other-income': { className: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800', label: 'Otros Ing.' },
      'withdrawal': { className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800', label: 'Retiro' },
      'administrative': { className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800', label: 'Gasto Admin' },
      'payout': { className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800', label: 'Pago Interés' },
      'social-expense': { className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800', label: 'Gasto Social' },
      'other-expense': { className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800', label: 'Otro Gasto' },
      'dividend': { className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800', label: 'Utilidades' },
    };
    const s = styles[type] || { className: '', label: 'Operación' };
    return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${s.className}`}>{s.label}</Badge>;
  };

  return (
    <>
      <Card className="w-full overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-0 pt-4 sm:pt-5 px-3 sm:px-5">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base font-semibold">Operaciones del Día</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5 h-8 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Operación
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Seleccionar Tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 text-emerald-700">
                    <ArrowUpRight className="w-4 h-4" />
                    Ingresos
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => { setActiveDialog('fund'); setOpenDialog(true); }}>
                      Fondo Social
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActiveDialog('other-income'); setOpenDialog(true); }}>
                      Otros
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 text-rose-700">
                    <ArrowDownLeft className="w-4 h-4" />
                    Egresos
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => { setActiveDialog('administrative'); setOpenDialog(true); }}>
                      Gasto Administrativo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActiveDialog('social-expense'); setOpenDialog(true); }}>
                      Gasto Social
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActiveDialog('other-expense'); setOpenDialog(true); }}>
                      Otros
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActiveDialog('dividend'); setOpenDialog(true); }}>
                      Utilidades
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          {assemblyRun && (
            <div className="flex items-center gap-2 flex-wrap pb-4">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold tabular-nums">{allOperations.filter(op => op.category === 'ingreso').length}</span>
                <span className="text-muted-foreground">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-semibold tabular-nums">{allOperations.filter(op => op.category === 'egreso').length}</span>
                <span className="text-muted-foreground">Egresos</span>
              </div>
              {totalIncome > 0 && (
                <>
                  <div className="h-4 w-px bg-border mx-1" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(totalIncome)}
                  </span>
                </>
              )}
              {totalExpense > 0 && (
                <>
                  <div className="h-4 w-px bg-border mx-1" />
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(totalExpense)}
                  </span>
                </>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {!assemblyRun ? (
            <div className="px-3 sm:px-5 pb-5 space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="px-3 sm:px-5 pt-1 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant={filterCategory === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterCategory('all')}
                    className="h-7 text-xs px-2.5"
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filterCategory === 'ingreso' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterCategory('ingreso')}
                    className="h-7 text-xs px-2.5 text-emerald-700 dark:text-emerald-400"
                  >
                    Ingresos
                  </Button>
                  <Button
                    variant={filterCategory === 'egreso' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterCategory('egreso')}
                    className="h-7 text-xs px-2.5 text-rose-700 dark:text-rose-400"
                  >
                    Egresos
                  </Button>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {filteredOperations.length} operaciones
                </div>
              </div>

              {/* Operations List */}
              <div className="px-3 sm:px-5 pb-5 space-y-1.5 max-h-[500px] overflow-y-auto">
                {filteredOperations.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    No hay operaciones registradas
                  </div>
                ) : (
                  filteredOperations.map((op) => (
                    <div
                      key={`${op.type}-${op.id}`}
                      className="group flex flex-wrap items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-card hover:shadow-sm transition-all"
                    >
                      {/* Category Icon */}
                      <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs font-bold shrink-0 ${
                        op.category === 'ingreso'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {op.category === 'ingreso'
                          ? <ArrowUpRight className="w-4 h-4" />
                          : <ArrowDownLeft className="w-4 h-4" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-[140px]">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm truncate">{op.description}</span>
                          {getTypeBadge(op.type)}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          {op.user && op.user !== '-' && <span>{op.user}</span>}
                          <span>{op.date.toLocaleDateString("es-PE", { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: "UTC" })}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <span className={cn(
                        "text-sm font-semibold tabular-nums shrink-0",
                        op.category === 'ingreso' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {op.category === 'ingreso' ? '+' : '-'}{formatCurrency(op.amount)}
                      </span>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => confirmDelete(op.id, op.type)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirmOpen(false)}></div>
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative z-10 border">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">¿Estás completamente seguro?</h2>
              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. Esto eliminará permanentemente la operación y ajustará el balance de caja.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {openDialog && activeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeDialog}></div>
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative z-10 border">
            {activeDialog === 'deposit' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Depósito a cuenta de ahorros</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del depósito.</p>
                </div>
                <DepositForm defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} addDeposit={addDeposit} setOpenDialog={closeDialog} editDeposit={editDeposit} setEditDeposit={setEditDeposit} />
              </>
            )}
            {activeDialog === 'fund' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Fondo Social</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del fondo social.</p>
                </div>
                <SocialLegalFundsForm defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} setOpenDialog={closeDialog} socialFundsTransactions={funds} setSocialFundsTransactions={setFunds} scheduleRunId={assemblyRun?.id} />
              </>
            )}
            {activeDialog === 'other-income' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Otro Ingreso</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del ingreso.</p>
                </div>
                <OtherIncomeForm setOpenDialog={closeDialog} otherIncomes={otherIncomes} setOtherIncomes={setOtherIncomes} defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} />
              </>
            )}
            {activeDialog === 'withdrawal' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Retiro</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del retiro.</p>
                </div>
                <WithdrawForm setOpenDialog={closeDialog} withdrawals={withdrawals} setWithdrawals={setWithdrawals} defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} />
              </>
            )}
            {activeDialog === 'administrative' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Gasto Administrativo</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del gasto.</p>
                </div>
                <AdminExpenseForm setOpenDialog={closeDialog} administrativeExpenses={administrativeExpenses} setAdministrativeExpenses={setAdministrativeExpenses} defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} />
              </>
            )}
            {activeDialog === 'payout' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Pago a Ahorrista</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del pago.</p>
                </div>
                <InterestPaymentForm setOpenDialog={closeDialog} payouts={payouts} setPayouts={setPayouts} defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} />
              </>
            )}
            {activeDialog === 'social-expense' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Gasto Fondo Social</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del gasto.</p>
                </div>
                <SocialLegalFundsExpenseForm socialFunds={socialFunds} setOpenDialog={closeDialog} socialFundsTransactions={socialFundsExpenses} setSocialFundsTransactions={setSocialFundsExpenses} defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} />
              </>
            )}
            {activeDialog === 'other-expense' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Otro Gasto</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del gasto.</p>
                </div>
                <OtherExpenseForm setOpenDialog={closeDialog} otherExpenses={otherExpenses} setOtherExpenses={setOtherExpenses} defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} />
              </>
            )}
            {activeDialog === 'dividend' && (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Utilidades</h2>
                  <p className="text-sm text-muted-foreground">Ingresa los detalles del retiro de utilidades.</p>
                </div>
                <DividendsWithdrawForm setOpenDialog={closeDialog} dividends={dividends} setDividends={setDividends} defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
