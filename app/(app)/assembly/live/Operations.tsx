"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Filter, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
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

type OperationCategory = 'ingreso' | 'egreso';
type OperationType = 'deposit' | 'fund' | 'other-income' | 'withdrawal' | 'administrative' | 'payout' | 'social-expense' | 'other-expense';

interface UnifiedOperation {
  id: string;
  category: OperationCategory;
  type: OperationType;
  date: Date;
  amount: number;
  user?: string;
  description: string;
  raw: IDeposit | ISocialFundsTransaction | IOtherIncome | IWithdrawal | IAdministrativeExpense | IPayout | ISocialFundsExpenseTransaction | IOtherExpense;
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
        const [depRes, fundsRes, otherIncRes, withdrawRes, adminRes, payoutRes, socialExpRes, otherExpRes] = await Promise.all([
          apiClient.get(`/deposits/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/incomes/social-funds/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/incomes/others/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/withdrawals/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/administrative/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/payouts/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/social-funds/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/others/schedule-run/${assemblyRun.id}`),
        ]);

        setDeposits(depRes.data || []);
        setFunds(fundsRes.data || []);
        setOtherIncomes(otherIncRes.data || []);
        setWithdrawals(withdrawRes.data || []);
        setAdministrativeExpenses(adminRes.data || []);
        setPayouts(payoutRes.data || []);
        setSocialFundsExpenses(socialExpRes.data || []);
        setOtherExpenses(otherExpRes.data || []);
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

    deposits.forEach(d => list.push({
      id: d.id || '', category: 'ingreso', type: 'deposit',
      date: new Date(d.date), amount: d.amount,
      user: d.user?.name || d.user?.lastname || 'Desconocido',
      description: 'Depósito', raw: d
    }));
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
    
    withdrawals.forEach(w => list.push({
      id: w.id.toString(), category: 'egreso', type: 'withdrawal',
      date: new Date(w.date), amount: w.amount,
      user: w.user?.name || w.user?.lastname || 'Desconocido',
      description: 'Retiro', raw: w
    }));
    administrativeExpenses.forEach(a => list.push({
      id: a.id || '', category: 'egreso', type: 'administrative',
      date: new Date(a.date), amount: a.amount,
      user: '-',
      description: a.description || 'Gasto Administrativo', raw: a
    }));
    payouts.forEach(p => list.push({
      id: p.id.toString(), category: 'egreso', type: 'payout',
      date: new Date(p.date), amount: p.amount,
      user: p.user?.name || p.user?.lastname || 'Desconocido',
      description: 'Pago a Ahorrista', raw: p
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

    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [deposits, funds, otherIncomes, withdrawals, administrativeExpenses, payouts, socialFundsExpenses, otherExpenses]);

  const filteredOperations = useMemo(() => {
    if (filterCategory === 'all') return allOperations;
    return allOperations.filter(op => op.category === filterCategory);
  }, [allOperations, filterCategory]);

  const totalIncome = allOperations.filter(op => op.category === 'ingreso').reduce((sum, op) => sum + op.amount, 0);
  const totalExpense = allOperations.filter(op => op.category === 'egreso').reduce((sum, op) => sum + op.amount, 0);

  const getTypeBadge = (type: OperationType) => {
    switch (type) {
      case 'deposit': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Depósito</Badge>;
      case 'fund': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Fondo</Badge>;
      case 'other-income': return <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-cyan-200">Otros Ingresos</Badge>;
      case 'withdrawal': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Retiro</Badge>;
      case 'administrative': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Gasto Admin</Badge>;
      case 'payout': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Pago Interés</Badge>;
      case 'social-expense': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">Gasto Social</Badge>;
      case 'other-expense': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">Otro Gasto</Badge>;
      default: return <Badge variant="outline">Operación</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                 <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="uppercase tracking-wide text-[10px]">Paso 5</Badge>
                 </div>
                <h2 className="text-2xl font-bold tracking-tight">Operaciones del Día</h2>
                <p className="text-muted-foreground">Gestiona todos los movimientos de caja de la asamblea actual.</p>
            </div>
            
            <div className="flex items-center gap-3">
                 <div className="bg-card border rounded-lg px-4 py-2 flex items-center gap-4 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ingresos</span>
                        <span className="text-sm font-semibold text-emerald-600">{formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-border mx-1 my-[-8px]"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Egresos</span>
                        <span className="text-sm font-semibold text-rose-600">{formatCurrency(totalExpense)}</span>
                    </div>
                 </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="gap-2 shadow-md">
                            <Plus className="w-4 h-4" />
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
                                <DropdownMenuItem onClick={() => { setActiveDialog('deposit'); setOpenDialog(true); }}>
                                    Depósito
                                </DropdownMenuItem>
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
                                <DropdownMenuItem onClick={() => { setActiveDialog('withdrawal'); setOpenDialog(true); }}>
                                    Retiro
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setActiveDialog('administrative'); setOpenDialog(true); }}>
                                    Gasto Administrativo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setActiveDialog('payout'); setOpenDialog(true); }}>
                                    Pago a Ahorrista
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setActiveDialog('social-expense'); setOpenDialog(true); }}>
                                    Gasto Social
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setActiveDialog('other-expense'); setOpenDialog(true); }}>
                                    Otros
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <Card className="shadow-sm border-muted/60">
            <CardHeader className="pb-2 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={filterCategory === 'all' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setFilterCategory('all')}
                            className="h-8"
                        >
                            Todas
                        </Button>
                        <Button 
                            variant={filterCategory === 'ingreso' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setFilterCategory('ingreso')}
                            className="h-8 text-emerald-700"
                        >
                            Ingresos
                        </Button>
                        <Button 
                            variant={filterCategory === 'egreso' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setFilterCategory('egreso')}
                            className="h-8 text-rose-700"
                        >
                            Egresos
                        </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        <span>Mostrando {filteredOperations.length} operaciones</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[120px]">Fecha</TableHead>
                            <TableHead className="w-[100px]">Tipo</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Usuario / Beneficiario</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOperations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No hay operaciones registradas en esta categoría.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOperations.map((op) => (
                                <TableRow key={`${op.type}-${op.id}`} className="hover:bg-muted/30">
                                    <TableCell className="text-xs text-muted-foreground font-medium">
                                        {op.date.toLocaleDateString("es-PE", { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: "UTC" })}
                                    </TableCell>
                                    <TableCell>
                                        {getTypeBadge(op.type)}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm text-foreground/80">
                                        {op.description}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {op.user}
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right font-semibold",
                                        op.category === 'ingreso' ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {op.category === 'ingreso' ? '+' : '-'}{formatCurrency(op.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

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
      
      {/* Dialogs usando Dialog directamente como en Payments.tsx */}
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
          </div>
        </div>
      )}
    </>
  );
}