"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ClipboardCheck, Trash2, Eye, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { ComboBoxUsers } from "@/components/combobox/ComboboxUsers";
import { ComboboxLoanTypes } from "@/components/combobox/ComboboxLoanTypes";
import { IUser } from "@/types/IUser";
import { ILoan, ILoanType } from "@/types/ILoan";
import { loanTypesData, LoanTypesEnum } from "@/constants";
import { IAssemblyScheduleRun, ICreditApplication, ILoanPayment, IUserStock } from "../types";
import { apiCreateCreditApplication, apiGetAssemblyRun, apiGetCreditApplicationsWithLoans, apiDeleteCreditApplication, apiApproveCreditApplication, apiRejectCreditApplication } from "../api";
import { useAssembly } from "../AssemblyContext";
import apiClient from "@/config/apiClient";
import { IDeposit } from "../../incomes/deposits/types";
import {  ISocialFundsTransaction } from "@/types/ISocialFunds";
import { IOtherIncome } from "../../incomes/others/types";
import { formatCurrency } from "@/lib/utils";
import { IWithdrawal } from "../../expenses/withdrawls/types";
import { IPayout } from "../../expenses/payouts/types";
import { ISocialFundsExpenseTransaction } from "../../expenses/social/types";
import { IOtherExpense } from "../../expenses/others/types";
import { IDividendsWithdraw } from "../../expenses/dividends/types";
import { IAdministrativeExpense } from "../../expenses/administrative/types";
import { getExpensesSum } from "../../reports/expenses/utils";
type LoanReq = { id: string; dni: string; name: string; amount: number; months: number; status: "Pendiente" | "Aprobado" | "Rechazado"; loanType?: string };

export default function Loans() {
  const { users, bank } = useContext(AppContext);
  const [creditApplications, setCreditApplications] = useState<ICreditApplication[]>([]);
  const { assembly, updateCashBalance } = useAssembly();
  const configuredLoanRate = bank?.bank?.loanInterestRate ?? 0.02;
  const configuredRoundingMode = bank?.bank?.loanInterestRoundingMode ?? "NORMAL";
  const configuredRoundingDigits = bank?.bank?.loanInterestRoundingDigits ?? 2;
  const roundingModeLabels = {
    NORMAL: "normal",
    UP: "hacia arriba",
    DOWN: "hacia abajo",
  };
  const [lastMonthBalance, setLastMonthBalance] = useState<{
     incomes: {
        deposits: IDeposit[],
    users: IUser[],
    payments: ILoanPayment[];
    stocks: IUserStock[]
    socialFunds: ISocialFundsTransaction[]
    others: IOtherIncome[]
    }
    expenses: {
       withdrawals: IWithdrawal[],
        // users: IUser[],
        loans: ILoan[],
        payouts: IPayout[],
        socialFunds: ISocialFundsExpenseTransaction[],
        others: IOtherExpense[],
        dividends: IDividendsWithdraw[],
        administrative: IAdministrativeExpense[],
    },
    balance: number
  }>({
    incomes: {
      deposits: [],
      users: [],
      payments: [],
      stocks: [],
      socialFunds: [],
      others: []
    },
    expenses: {
      withdrawals: [],
      loans: [],
      dividends: [],
      administrative: [],
      others: [],
      socialFunds: [],
      payouts: [],
    }
    ,balance: 0
  });
      
       const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [userSelected, setUserSelected] = useState<IUser | null>(null);
  const [form, setForm] = useState<{ amount: number; installments: number; purpose: string }>({ amount: 0, installments: 6, purpose: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalStep, setApprovalStep] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState<LoanReq | null>(null);
  const [loanTypeSelected, setLoanTypeSelected] = useState<ILoanType | null>(null);
  const [sendMessage, setSendMessage] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSendMessage, setRejectSendMessage] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ICreditApplication | null>(null);
  const [loanTypes, setLoanTypes] = useState<ILoanType[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch loan types from API or define them statically
    const fetchLoanTypes = async () => {
      // Simulate fetching loan types
     const types = await apiClient.get<ILoanType[]>('/loans/types').then(res => res.data);
      setLoanTypes(types);
    };
    fetchLoanTypes();
  }, []);

  const fetchLastMonthBalance = async() => {
    if (!assemblyRun) return;
    console.log(assemblyRun.startAt);
    const currentDate = new Date(assemblyRun?.startAt).toISOString();
    const res = await apiClient.get('/reports/balances/month?date=' + currentDate)
    console.log('Last month balance:', res.data);
    if (res.data) {
      setLastMonthBalance(res.data)
    }
  }

  useEffect(() => {
    fetchLastMonthBalance();
  },[assemblyRun])

  const handleCreateCreditApplication = async () => {
    if (isSubmitting) return; // Prevent duplicate submissions

    if (!assemblyRun) {
      throw new Error("No active assembly run");
    }
    if (!userSelected || form.amount <= 0) return false;

    setIsSubmitting(true);
    try {
      const data = await apiCreateCreditApplication({
        userId: userSelected.id,
        amount: form.amount,
        purpose: form.purpose || 'Crédito solicitado en asamblea',
        scheduleRunId: assemblyRun.id || ''
      });
      if (data) {
       setCreditApplications((prev) => [data, ...prev]);
       setIsModalOpen(false);
       setUserSelected(null);
       setForm({ amount: 0, installments: 6, purpose: '' });
      }
    } catch (error) {
      console.error("Error creating credit application:", error);
    } finally {
      setIsSubmitting(false);
    }
   }

  const handleDeleteCreditApplication = async () => {
    if (!applicationToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      // Find the application to check if it has a loan
      const application = creditApplications.find(app => app.id === applicationToDelete);
      if (application?.loan) {
        // Delete the associated loan
        await apiClient.delete(`/loans/${application.loan.id}`);
      }
      await apiDeleteCreditApplication(applicationToDelete);
      setCreditApplications((prev) => prev.filter((app) => app.id !== applicationToDelete));
      setDeleteConfirmOpen(false);
      setApplicationToDelete(null);
      // Refresh the balance after deletion
      await fetchLastMonthBalance();
    } catch (error) {
      console.error("Error deleting credit application:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setApplicationToDelete(null);
  };



   useEffect(() => {
       //get assembly run
       (async () => {
         if (!assembly?.lastRun) return;
         const data = await apiGetAssemblyRun(assembly.lastRun.id);
         console.log({ data });
         setAssemblyRun(data);
       })();
     }, [assembly?.lastRun]);
  

  useEffect(() => {
      // Fetch or compute payments data here and set it
        // setPaymentsData(fetchedData);
           if (!assemblyRun) return;
        const fetchData = async () => {
          try {
            const data = await apiGetCreditApplicationsWithLoans(assemblyRun.id);
            console.log("Fetched credit applications data:", data);
            setCreditApplications(data);
          } catch (error) {
            console.error("Error fetching credit applications data:", error);
          }
        };
        fetchData();
  }, [assemblyRun])

  const getLoanTypeDisplay = (loanType: string | { name?: string } | null | undefined): string => {
    if (!loanType) return '-';

    // If it's already a string, try to map it
    if (typeof loanType === 'string') {
      return loanTypesData[loanType as LoanTypesEnum] || loanType;
    }

    // If it's an object with a name property
    if (loanType.name && typeof loanType.name === 'string') {
      return loanTypesData[loanType.name as LoanTypesEnum] || loanType.name;
    }

    // Fallback
    return String(loanType);
  };

  const roundLoanInterest = (value: number) => {
    const factor = 10 ** configuredRoundingDigits;
    if (configuredRoundingMode === "UP") return Math.ceil(value * factor - Number.EPSILON) / factor;
    if (configuredRoundingMode === "DOWN") return Math.floor(value * factor + Number.EPSILON) / factor;
    return Math.round(value * factor) / factor;
  };

  const getPreviewInstallment = (index: number) => {
    const loanTypeName = loanTypeSelected?.name as LoanTypesEnum | undefined;
    const baseCapital = form.amount / form.installments;
    const remainingBalance = form.amount - baseCapital * index;
    const capital = loanTypeName === LoanTypesEnum.MATURITY && index < form.installments - 1 ? 0 : baseCapital;
    const interestBase =
      loanTypeName === LoanTypesEnum.VARIABLE || loanTypeName === LoanTypesEnum.REBATE
        ? remainingBalance
        : form.amount;

    return {
      capital: loanTypeName === LoanTypesEnum.MATURITY && index === form.installments - 1 ? form.amount : capital,
      interest: roundLoanInterest(interestBase * configuredLoanRate),
    };
  };

  const handleApproveCreditApplication = async () => {
    if (!selectedLoan || !loanTypeSelected || form.installments <= 0 || isApproving) return false;

    setIsApproving(true);
    try {
      // Find the credit application to get the userId
      const creditApp = creditApplications.find(app => app.id === selectedLoan.id);
      if (!creditApp) {
        console.error("Credit application not found");
        return false;
      }

      // Prepare loan data for approval (usar tasa configurada en settings/platform)
      const loanData = {
        userId: creditApp.userId,
        amount: form.amount,
        interestRate: configuredLoanRate,
        initalInstallments: form.installments,
        loanTypeId: loanTypeSelected?.id || '',
        date: assemblyRun?.startAt ?? new Date(),
        paymentFrecuency: "monthly"
      };

      await apiApproveCreditApplication(selectedLoan.id, loanData);

      // Refresh the credit applications list
      if (assemblyRun) {
        const data = await apiGetCreditApplicationsWithLoans(assemblyRun.id);
        setCreditApplications(data);
      }

      // Refresh the last month balance to include the new loan
      await fetchLastMonthBalance();

      setApprovalModalOpen(false);
      setSelectedLoan(null);
      setLoanTypeSelected(null);
      setForm({ amount: 0, installments: 6, purpose: '' });
      setSendMessage(false);
      return true;
    } catch (error) {
      console.error("Error approving credit application:", error);
      return false;
    } finally {
      setIsApproving(false);
    }
  };
  const handleRejectCreditApplication = async () => {
    if (!selectedLoan || isRejecting) return false;

    setIsRejecting(true);
    try {
      // Find the application to check if it has a loan
      const application = creditApplications.find(app => app.id === selectedLoan.id);
      if (application?.loan) {
        // Delete the associated loan
        await apiClient.delete(`/loans/${application.loan.id}`);
      }
      await apiRejectCreditApplication(selectedLoan.id, {
        confirm: true,
        reason: rejectReason.trim()
      });

      // Refresh the credit applications list
      if (assemblyRun) {
        const data = await apiGetCreditApplicationsWithLoans(assemblyRun.id);
        setCreditApplications(data);
      }

      setRejectConfirmOpen(false);
      setSelectedLoan(null);
      setRejectReason('');
      setRejectSendMessage(false);
      // Refresh the balance after rejection
      await fetchLastMonthBalance();
      return true;
    } catch (error) {
      console.error("Error rejecting credit application:", error);
      return false;
    } finally {
      setIsRejecting(false);
    }
  };

  const expensesSum = getExpensesSum(lastMonthBalance.expenses);

  const getCurrentBalance = (data: {
        deposits: IDeposit[],
    users: IUser[],
    payments: ILoanPayment[];
    stocks: IUserStock[]
    socialFunds: ISocialFundsTransaction[]
    others: IOtherIncome[]
    }) => {
      const deposits = data.deposits.reduce((acc,it) => acc + it.amount,0)
      const payments = data.payments.reduce((acc,it) => acc + it.amount + Number(it.interest),0)
      const stocks = data.stocks.reduce((acc,it)=> acc + (it.quantity * it.price),0)
      const socialFunds = data.socialFunds.reduce((acc,it) => acc+it.amount,0);
      const others = data.others.reduce((acc,it) => acc + it.amount,0)
      return deposits + payments + stocks + socialFunds + others
    }

  const currentBalance =  getCurrentBalance(lastMonthBalance.incomes);
  const currentApplicationsSum  = creditApplications.filter(item => item.status==='pending').reduce((acc,item) => acc + item.amount,0);
  const expenseKeys: (keyof typeof expensesSum)[] = Object.keys(expensesSum) as (keyof typeof expensesSum)[];
  const expensesAmount = expenseKeys.reduce((acc, it) => acc + expensesSum[it], 0) + currentApplicationsSum;

  // Update context balance whenever it changes
  useEffect(() => {
    const availableBalance = currentBalance - expensesAmount;
    updateCashBalance({
      currentBalance,
      totalExpenses: expensesAmount,
      availableBalance,
      lastUpdated: new Date()
    });
  }, [currentBalance, expensesAmount, updateCashBalance]);

  return (
   <div className="flex flex-col gap-4">
    {/* Arqueo de Caja */}
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Arqueo de Caja</CardTitle>
          <Badge variant="outline" className="text-xs font-medium">Resumen del mes</Badge>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 flex-wrap pb-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <span className="text-muted-foreground">Anterior:</span>
            <span className="font-semibold tabular-nums">{formatCurrency(lastMonthBalance.balance)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold tabular-nums">{formatCurrency(currentBalance)}</span>
            <span className="text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold tabular-nums">{formatCurrency(expensesAmount)}</span>
            <span className="text-muted-foreground">Egresos</span>
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <span className={`text-xs font-bold ${(currentBalance + lastMonthBalance.balance - expensesAmount) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            Neto: {formatCurrency(currentBalance + lastMonthBalance.balance - expensesAmount)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-5 pb-5">
          <div className="rounded-lg border bg-muted/20 overflow-hidden">
            <Table className="w-full">
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-xs text-muted-foreground">1. Saldo anterior</TableCell>
                  <TableCell className="text-right text-sm font-medium border-r">{formatCurrency(lastMonthBalance.balance)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">2. Ingresos</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrency(currentBalance)}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-xs font-medium">3. Bruto (2+1)</TableCell>
                  <TableCell className="text-right text-sm font-semibold border-r">{formatCurrency(currentBalance + lastMonthBalance.balance)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">4. Egresos</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrency(expensesAmount)}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableCell className="text-xs font-semibold">Saldo Neto (3-4)</TableCell>
                  <TableCell className="text-right text-sm font-bold">{formatCurrency(currentBalance + lastMonthBalance.balance - expensesAmount)}</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Credit Applications */}
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Solicitudes de Crédito</CardTitle>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5 h-8 text-xs">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Agregar
          </Button>
        </div>

        {creditApplications.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <span className="font-semibold tabular-nums">{creditApplications.length}</span>
              <span className="text-muted-foreground">Solicitudes</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="font-semibold tabular-nums">{creditApplications.filter(a => a.status === 'pending').length}</span>
              <span className="text-muted-foreground">Pendientes</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold tabular-nums">{creditApplications.filter(a => a.status === 'approved').length}</span>
              <span className="text-muted-foreground">Aprobados</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Applications List */}
        <div className="px-5 pb-5 space-y-1.5 max-h-[500px] overflow-y-auto">
          {creditApplications.map((it) => {
            const statusConfig: Record<string, { color: string; label: string }> = {
              'approved': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', label: 'Aprobado' },
              'rejected': { color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800', label: 'Rechazado' },
              'pending': { color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800', label: 'Pendiente' },
            };
            const sc = statusConfig[it.status] || statusConfig['pending'];

            return (
              <div key={it.id} className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all">
                {/* Avatar */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0 ${
                  it.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : it.status === 'rejected'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {it.user.name?.[0]}
                  {it.user.lastname?.[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {it.user.lastname}, {it.user.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${sc.color}`}>
                      {sc.label}
                    </Badge>
                    {it.loan?.loanType && (
                      <span className="text-[11px] text-muted-foreground">
                        {getLoanTypeDisplay(it.loan.loanType)}
                      </span>
                    )}
                    {it.loan?.initalInstallments && (
                      <span className="text-[11px] text-muted-foreground">
                        {it.loan.initalInstallments} meses
                      </span>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground">Solicitado</div>
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">S/ {it.amount.toFixed(2)}</div>
                  </div>
                  {it.loan?.amount && (
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground">Aprobado</div>
                      <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">S/ {it.loan.amount.toFixed(2)}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLoan({ id: it.id, dni: it.user.dni ?? "", name: it.user.name, amount: it.amount, months: it.loan?.initalInstallments || 6, status: it.status as "Pendiente" | "Aprobado" | "Rechazado" });
                      setApproveConfirmOpen(true);
                      setDropdownOpen(null);
                    }}
                    className="h-7 px-2 text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Aprobar
                  </Button>

                  <DropdownMenu
                    open={dropdownOpen === it.id}
                    onOpenChange={(open) => setDropdownOpen(open ? it.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedApplication(it);
                          setDetailsModalOpen(true);
                          setDropdownOpen(null);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedLoan({ id: it.id, dni: it.user.dni ?? "", name: it.user.name, amount: it.amount, months: it.loan?.initalInstallments || 6, status: it.status as "Pendiente" | "Aprobado" | "Rechazado" });
                          setRejectConfirmOpen(true);
                          setDropdownOpen(null);
                        }}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setApplicationToDelete(it.id);
                          setDeleteConfirmOpen(true);
                          setDropdownOpen(null);
                        }}
                        className="cursor-pointer text-gray-600 focus:text-gray-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          {creditApplications.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              No hay solicitudes de préstamo
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) { setUserSelected(null); setForm({ amount: 0, installments: 6,purpose:''}); } }} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Solicitud de Préstamo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="user-select">Seleccionar Usuario</Label>
             <ComboBoxUsers users={users} controller={{ userSelected, setUserSelected }} />
           </div>

           <div className="space-y-2">
             <Label htmlFor="loan-amount">Monto del Préstamo</Label>
             <Input
               id="loan-amount"
               type="number"
               placeholder="Ingrese el monto"
               value={form.amount || ''}
               onChange={(e) => {
                 const val = e.target.value;
                 setForm((p) => ({ ...p, amount: val === '' ? 0 : Number(val) || 0 }));
               }}
             />
           </div>

           <div className="space-y-2">
             <Label htmlFor="loan-purpose">Propósito del Préstamo</Label>
             <Input
               id="loan-purpose"
               type="text"
               placeholder="Describa el propósito del préstamo"
               value={form.purpose || ''}
               onChange={(e) => {
                 const val = e.target.value;
                 setForm((p) => ({ ...p, purpose: val }));
               }}
             />
           </div>

           <Button
             onClick={handleCreateCreditApplication}
             className="w-full"
             disabled={isSubmitting}
           >
             {isSubmitting ? "Guardando..." : "Guardar Solicitud"}
           </Button>
         </div>
      </DialogContent>
    </Dialog>
    <Dialog open={approvalModalOpen} onOpenChange={(open) => { setApprovalModalOpen(open); if (!open) { setApprovalStep(0); setSelectedLoan(null); setLoanTypeSelected(null); setForm({ amount: 0, installments: 6, purpose: '' }); setSendMessage(false); } }} modal={false}>
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
                    {/* <p><strong>Roles:</strong> {selectedUser.roles?.join(', ') || 'Sin roles'}</p> */}
                    <p><strong>Préstamos Activos:</strong> {creditApplications.filter(app => app.user.dni === selectedUser.dni && app.status === "approved").length}</p>
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
              <div className="p-3 rounded-md bg-muted/40 border text-xs text-muted-foreground">
                Tasa de interés aplicada: <strong className="text-foreground">{(configuredLoanRate * 100).toFixed(2)}% mensual</strong>
                {" "}(configurable en Ajustes → Plataforma)
                <div className="mt-1">
                  Redondeo del interés: <strong className="text-foreground">{roundingModeLabels[configuredRoundingMode]}</strong>
                  {" "}a <strong className="text-foreground">{configuredRoundingDigits}</strong> decimales.
                </div>
              </div>
            </>
          )}
          {approvalStep === 2 && (
            <>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Capital</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: form.installments }, (_, i) => {
                      const { capital, interest } = getPreviewInstallment(i);
                      const date = new Date();
                      date.setMonth(date.getMonth() + i + 1);
                      return (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>S/ {capital.toFixed(2)}</TableCell>
                          <TableCell>S/ {interest.toFixed(configuredRoundingDigits)}</TableCell>
                          <TableCell>S/ {(capital + interest).toFixed(2)}</TableCell>
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
              <Button
                onClick={async () => { const result = await handleApproveCreditApplication(); if (result) setApprovalStep(0); }}
                className="w-full"
                disabled={isApproving}
              >
                {isApproving ? "Aprobando..." : "Aprobar"}
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
            <Button onClick={async () => { await handleRejectCreditApplication(); }}>Rechazar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>¿Estás seguro de que deseas eliminar esta solicitud de préstamo?</p>
          <p className="text-sm text-muted-foreground">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancelDelete}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteCreditApplication}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Approve Confirmation Dialog */}
    <Dialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirmar Aprobación
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Estás a punto de aprobar</strong> la solicitud de préstamo de{' '}
              <span className="font-semibold">{selectedLoan?.name}</span> por un monto de{' '}
              <span className="font-semibold">S/ {selectedLoan?.amount.toFixed(2)}</span>.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Esta acción creará el préstamo y sus cuotas correspondientes. ¿Deseas continuar?
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setApproveConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              setApproveConfirmOpen(false);
              setApprovalModalOpen(true);
              setApprovalStep(0);
              setForm({ amount: selectedLoan?.amount || 0, installments: selectedLoan?.months || 6, purpose: '' });
              setLoanTypeSelected(loanTypes.find(lt => lt.id === selectedApplication?.loan?.loanTypeId) || null);
              setSendMessage(false);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Continuar con Aprobación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Reject Confirmation Dialog */}
    <Dialog open={rejectConfirmOpen} onOpenChange={setRejectConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Confirmar Rechazo
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Estás a punto de rechazar</strong> la solicitud de préstamo de{' '}
              <span className="font-semibold">{selectedLoan?.name}</span> por un monto de{' '}
              <span className="font-semibold">S/ {selectedLoan?.amount.toFixed(2)}</span>.
            </p>
            <p className="text-sm text-red-700 mt-2">
              Esta acción marcará la solicitud como rechazada. ¿Deseas continuar?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              Motivo del Rechazo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Ingrese el motivo detallado del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[80px]"
              required
            />
            <p className="text-xs text-gray-500">
              Este motivo será visible para el solicitante y ayudará a mejorar futuras solicitudes.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!rejectReason.trim()) {
                alert('Por favor ingrese un motivo de rechazo');
                return;
              }
              setRejectConfirmOpen(false);
              await handleRejectCreditApplication();
            }}
            className="bg-red-600 hover:bg-red-700"
            disabled={!rejectReason.trim() || isRejecting}
          >
            {isRejecting ? "Rechazando..." : "Continuar con Rechazo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Details Modal */}
    <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Detalles de la Solicitud
          </DialogTitle>
        </DialogHeader>
        {selectedApplication && (
          <div className="space-y-6">
            {/* User Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">Nombre</Label>
                <p className="text-lg font-semibold">{selectedApplication.user.name} {selectedApplication.user.lastname}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">DNI</Label>
                <p className="text-lg font-semibold">{selectedApplication.user.dni}</p>
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-700">Monto Solicitado</Label>
                  <p className="text-2xl font-bold text-blue-800">S/ {selectedApplication.amount.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Label className="text-sm font-medium text-green-700">Monto Aprobado</Label>
                  <p className="text-2xl font-bold text-green-800">
                    {selectedApplication.loan?.amount ? `S/ ${selectedApplication.loan.amount.toFixed(2)}` : '-'}
                  </p>
                </div>
              </div>

              {/* Loan Information */}
              {selectedApplication.loan && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Label className="text-sm font-medium text-purple-700 mb-2 block">Información del Préstamo</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-purple-600">Tipo de Préstamo</Label>
                      <p className="font-medium">{getLoanTypeDisplay(selectedApplication.loan.loanType)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-purple-600">Cuotas</Label>
                      <p className="font-medium">{selectedApplication.loan.initalInstallments} meses</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purpose */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <Label className="text-sm font-medium text-yellow-700 mb-2 block">Propósito del Préstamo</Label>
                <p className="text-gray-800 leading-relaxed">
                  {selectedApplication.purpose || 'No especificado'}
                </p>
              </div>

              {/* Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Estado</Label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                  selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedApplication.status === 'approved' ? 'Aprobado' :
                   selectedApplication.status === 'rejected' ? 'Rechazado' :
                   'Pendiente'}
                </span>
              </div>

              {/* Reject Reason */}
              {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-sm font-medium text-red-700 mb-2 block">Motivo del Rechazo</Label>
                  <p className="text-red-800 leading-relaxed">
                    {selectedApplication.rejectionReason}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <Label className="font-medium">Fecha de Solicitud</Label>
                  <p>{new Date(selectedApplication.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                {selectedApplication.loan?.date && (
                  <div>
                    <Label className="font-medium">Fecha de Aprobación</Label>
                    <p>{new Date(selectedApplication.loan.date).toLocaleDateString('es-ES')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </div>
  );
}
