"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText, Calendar, Clock, Users, TrendingUp, CreditCard,
  Wallet, ArrowUpRight, ArrowDownLeft, ClipboardCheck, CheckCircle,
  Loader2, XCircle, AlertCircle, UserCheck, UserX, Timer, Download
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import jsPDF from "jspdf";
import { formatCurrency } from "@/lib/utils";
import { loanTypesData, LoanTypesEnum, socialFundsData } from "@/constants";
import { useAssembly } from "../AssemblyContext";
import {
  apiGetAssemblyRun,
  apiGetPartnersWithShares,
  apiGetPaymentsData,
  apiGetCreditApplicationsWithLoans,
  apiGetSavingsData,
  apiGetAssemblyActaSummary,
} from "../api";
import apiClient from "@/config/apiClient";
import {
  IAssemblyScheduleRun,
  IPartnerShares,
  IPaymentData,
  ICreditApplication,
  ISavingsPartner,
  ParticipantStatusTypes,
} from "../types";
import { ISocialFundsTransaction } from "@/types/ISocialFunds";
import { IOtherIncome } from "../../incomes/others/types";
import { IAdministrativeExpense } from "../../expenses/administrative/types";
import { ISocialFundsExpenseTransaction } from "../../expenses/social/types";
import { IOtherExpense } from "../../expenses/others/types";
import { IDividendsWithdraw } from "../../expenses/dividends/types";

type ActaOperation = {
  id: string;
  category: "ingreso" | "egreso";
  label: string;
  description: string;
  amount: number;
  date: Date;
  user?: string;
};

const getUserName = (user?: { name?: string | null; lastname?: string | null } | null) => {
  if (!user) return undefined;
  const fullName = [user.lastname, user.name].filter(Boolean).join(", ");
  return fullName || undefined;
};

// Section wrapper for consistent styling
function Section({ number, title, icon: Icon, children, badge }: {
  number: number;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badge?: { label: string; variant: "default" | "secondary" | "outline" | "destructive" };
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
            {number}
          </span>
          <Icon className="w-4 h-4 text-muted-foreground" />
          {title}
        </h3>
        {badge && <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>}
      </div>
      <div className="ml-8">{children}</div>
    </div>
  );
}

export default function Docs() {
  const { assembly } = useAssembly();

  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Data states
  const [partnerShares, setPartnerShares] = useState<IPartnerShares[]>([]);
  const [paymentsData, setPaymentsData] = useState<IPaymentData | null>(null);
  const [creditApplications, setCreditApplications] = useState<ICreditApplication[]>([]);
  const [savingsPartners, setSavingsPartners] = useState<ISavingsPartner[]>([]);
  const [finesIncomes, setFinesIncomes] = useState<IOtherIncome[]>([]);
  const [otherIncomes, setOtherIncomes] = useState<IOtherIncome[]>([]);

  // Operations data
  const [funds, setFunds] = useState<ISocialFundsTransaction[]>([]);
  const [administrativeExpenses, setAdministrativeExpenses] = useState<IAdministrativeExpense[]>([]);
  const [socialFundsExpenses, setSocialFundsExpenses] = useState<ISocialFundsExpenseTransaction[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<IOtherExpense[]>([]);
  const [dividends, setDividends] = useState<IDividendsWithdraw[]>([]);

  // Fetch assembly run
  useEffect(() => {
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      setAssemblyRun(data);
    })();
  }, [assembly?.lastRun]);

  // Fetch all data
  useEffect(() => {
    if (!assemblyRun?.id) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          sharesRes, paymentsRes, creditsRes, savingsRes, actaSummaryRes,
          fundsRes, adminRes, socialExpRes, otherExpRes, dividendsRes
        ] = await Promise.all([
          apiGetPartnersWithShares(assemblyRun.id),
          apiGetPaymentsData(assemblyRun.id),
          apiGetCreditApplicationsWithLoans(assemblyRun.id),
          apiGetSavingsData(assemblyRun.id),
          apiGetAssemblyActaSummary(assemblyRun.id),
          apiClient.get(`/incomes/social-funds/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/administrative/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/social-funds/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/others/schedule-run/${assemblyRun.id}`),
          apiClient.get(`/expenses/dividends/schedule-run/${assemblyRun.id}`),
        ]);

        setPartnerShares(sharesRes);
        setPaymentsData(paymentsRes);
        setCreditApplications(creditsRes);
        setSavingsPartners(savingsRes);
        setFinesIncomes(actaSummaryRes?.fines || []);
        setOtherIncomes(actaSummaryRes?.otherIncomes || []);
        setFunds(fundsRes.data || []);
        setAdministrativeExpenses(adminRes.data || []);
        setSocialFundsExpenses(socialExpRes.data || []);
        setOtherExpenses(otherExpRes.data || []);
        setDividends(dividendsRes.data || []);
      } catch (error) {
        console.error("Error fetching docs data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [assemblyRun?.id]);

  // Computed values
  const participants = assemblyRun?.participants || [];
  const attended = participants.filter(p => p.status === ParticipantStatusTypes.ATTENDED);
  const late = participants.filter(p => p.status === ParticipantStatusTypes.LATE);
  const absent = participants.filter(p => p.status === ParticipantStatusTypes.ABSENT);
  const presentCount = attended.length + late.length;
  const quorumPercent = participants.length > 0 ? Math.round((presentCount / participants.length) * 100) : 0;

  const sharesWithPurchases = partnerShares.filter(p => p.shares.reduce((s, sh) => s + sh.quantity, 0) > 0);
  const totalSharesAmount = partnerShares.reduce((sum, u) => sum + u.shares.reduce((s, sh) => s + sh.quantity * sh.price, 0), 0);
  const totalSharesQty = partnerShares.reduce((sum, u) => sum + u.shares.reduce((s, sh) => s + sh.quantity, 0), 0);

  const payments = paymentsData?.payments || [];
  const totalCapital = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalInterest = payments.reduce((sum, p) => sum + Number(p.interest || 0), 0);
  const totalPayments = totalCapital + totalInterest;

  const totalFines = finesIncomes.reduce((sum: number, inc: IOtherIncome) => sum + inc.amount, 0);

  const approvedCredits = creditApplications.filter(c => c.status === 'approved');
  const totalApprovedCreditAmount = approvedCredits.reduce((sum, c) => sum + Number(c.loan?.amount ?? c.amount ?? 0), 0);

  const savingsWithDeposits = savingsPartners.filter(p => p.deposits.length > 0 || p.payouts.length > 0 || (p.withdrawals ?? []).length > 0);
  const totalSavingsDeposits = savingsPartners.reduce((sum, p) => sum + p.deposits.reduce((s, d) => s + d.amount, 0), 0);
  const totalSavingsPayouts = savingsPartners.reduce((sum, p) => sum + p.payouts.reduce((s, d) => s + d.amount, 0), 0);
  const totalSavingsWithdrawals = savingsPartners.reduce((sum, p) => sum + (p.withdrawals ?? []).reduce((s, d) => s + d.amount, 0), 0);

  // Operations totals
  const totalFundsAmount = funds.reduce((sum, f) => sum + f.amount, 0);
  const totalOtherIncomesAmount = otherIncomes.reduce((sum: number, o: IOtherIncome) => sum + o.amount, 0);
  const totalIncomeOps = totalFundsAmount + totalOtherIncomesAmount;

  const totalAdminAmount = administrativeExpenses.reduce((sum, a) => sum + a.amount, 0);
  const totalSocialExpAmount = socialFundsExpenses.reduce((sum, s) => sum + s.amount, 0);
  const totalOtherExpAmount = otherExpenses.reduce((sum, o) => sum + o.amount, 0);
  const totalDividendsAmount = dividends.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenseOps = totalAdminAmount + totalSocialExpAmount + totalOtherExpAmount + totalDividendsAmount + totalApprovedCreditAmount;
  const totalActaIncome = totalFines + totalSharesAmount + totalPayments + totalSavingsDeposits + totalIncomeOps;
  const totalActaExpenses = totalSavingsWithdrawals + totalSavingsPayouts + totalExpenseOps;
  const actaCashBalance = {
    currentBalance: totalActaIncome,
    totalExpenses: totalActaExpenses,
    availableBalance: totalActaIncome - totalActaExpenses,
  };

  const operationRows = useMemo<ActaOperation[]>(() => {
    const rows: ActaOperation[] = [];

    funds.forEach((fund) => rows.push({
      id: `fund-${fund.id}`,
      category: "ingreso",
      label: "Fondo social",
      description: fund.socialFunds?.name ? (socialFundsData[fund.socialFunds.name as keyof typeof socialFundsData] || fund.socialFunds.name) : (fund.description || "Fondo social"),
      amount: fund.amount,
      date: new Date(fund.date),
      user: getUserName(fund.user),
    }));

    otherIncomes.forEach((income) => rows.push({
      id: `other-income-${income.id}`,
      category: "ingreso",
      label: "Otro ingreso",
      description: income.description || "Otro ingreso",
      amount: income.amount,
      date: new Date(income.date),
      user: getUserName(income.user),
    }));

    administrativeExpenses.forEach((expense) => rows.push({
      id: `admin-${expense.id}`,
      category: "egreso",
      label: "Gasto administrativo",
      description: expense.description || "Gasto administrativo",
      amount: expense.amount,
      date: new Date(expense.date),
      user: getUserName(expense.user),
    }));

    socialFundsExpenses.forEach((expense) => rows.push({
      id: `social-expense-${expense.id}`,
      category: "egreso",
      label: "Gasto fondo social",
      description: expense.description || "Gasto fondo social",
      amount: expense.amount,
      date: new Date(expense.date),
      user: getUserName(expense.user),
    }));

    otherExpenses.forEach((expense) => rows.push({
      id: `other-expense-${expense.id}`,
      category: "egreso",
      label: "Otro egreso",
      description: expense.description || "Otro egreso",
      amount: expense.amount,
      date: new Date(expense.date),
      user: getUserName(expense.user),
    }));

    dividends.forEach((dividend) => rows.push({
      id: `dividend-${dividend.id}`,
      category: "egreso",
      label: "Dividendos",
      description: dividend.description || "Pago de dividendos",
      amount: dividend.amount,
      date: new Date(dividend.date),
      user: getUserName(dividend.user),
    }));

    approvedCredits.forEach((credit) => rows.push({
      id: `credit-${credit.id}`,
      category: "egreso",
      label: "Crédito aprobado",
      description: credit.purpose || "Desembolso de crédito",
      amount: Number(credit.loan?.amount ?? credit.amount ?? 0),
      date: new Date(credit.loan?.date ?? credit.createdAt),
      user: getUserName(credit.user),
    }));

    return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [funds, otherIncomes, administrativeExpenses, socialFundsExpenses, otherExpenses, dividends, approvedCredits]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLoanTypeDisplay = (loanType: string | { name?: string } | null | undefined): string => {
    if (!loanType) return '-';
    if (typeof loanType === 'string') return loanTypesData[loanType as LoanTypesEnum] || loanType;
    if (loanType.name && typeof loanType.name === 'string') return loanTypesData[loanType.name as LoanTypesEnum] || loanType.name;
    return String(loanType);
  };

  const handleConfirmActa = async () => {
    setIsConfirming(true);
    try {
      // Simulate confirmation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConfirmed(true);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error confirming acta:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const generatePDF = useCallback(() => {
    if (!assemblyRun) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const colors = {
      primary: [30, 64, 175] as [number, number, number],
      dark: [15, 23, 42] as [number, number, number],
      muted: [100, 116, 139] as [number, number, number],
      light: [241, 245, 249] as [number, number, number],
      green: [22, 163, 74] as [number, number, number],
      red: [220, 38, 38] as [number, number, number],
      amber: [217, 119, 6] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
      border: [226, 232, 240] as [number, number, number],
    };

    const checkPage = (needed: number) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const drawLine = (yPos: number) => {
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    const fmtCurrency = (amount: number) => `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const fmtDate = (date: Date) => new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

    const fmtTime = (date: Date) => new Date(date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const sectionTitle = (num: number, title: string) => {
      checkPage(14);
      // Number circle
      doc.setFillColor(...colors.primary);
      doc.circle(margin + 3.5, y + 2, 3.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.white);
      doc.text(String(num), margin + 3.5, y + 3, { align: 'center' });
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.text(title, margin + 10, y + 3.5);
      y += 10;
    };

    // ===== HEADER =====
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 36, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...colors.white);
    doc.text('ACTA DE REUNIÓN', pageWidth / 2, 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 240);
    doc.text('Registro oficial de acuerdos y decisiones', pageWidth / 2, 23, { align: 'center' });

    // Date/time pills
    const dateStr = fmtDate(assemblyRun.startAt);
    const timeStr = `${fmtTime(assemblyRun.startAt)}${assemblyRun.endAt ? ' - ' + fmtTime(assemblyRun.endAt) : ''}`;
    const attendStr = `${presentCount}/${participants.length} asistentes`;

    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    const pillY = 29;
    const pillTexts = [dateStr, timeStr, attendStr, `Quórum: ${quorumPercent}%`];
    const pillTotalWidth = pillTexts.reduce((sum, t) => sum + doc.getTextWidth(t) + 8, 0) + (pillTexts.length - 1) * 3;
    let pillX = (pageWidth - pillTotalWidth) / 2;
    pillTexts.forEach((text) => {
      const tw = doc.getTextWidth(text) + 8;
      doc.setFillColor(255, 255, 255, 0.15 as unknown as number);
      doc.roundedRect(pillX, pillY - 3.5, tw, 7, 1.5, 1.5, 'F');
      doc.text(text, pillX + 4, pillY + 0.5);
      pillX += tw + 3;
    });

    y = 44;

    // ===== 1. ASISTENCIA =====
    sectionTitle(1, 'Control de asistencia');

    // Attendance pills
    const attendPills = [
      { label: `${attended.length} Presentes`, color: colors.green },
      ...(late.length > 0 ? [{ label: `${late.length} Tardanzas`, color: colors.amber }] : []),
      ...(absent.length > 0 ? [{ label: `${absent.length} Ausentes`, color: colors.red }] : []),
    ];
    let px = margin + 10;
    attendPills.forEach(pill => {
      doc.setFontSize(7);
      const tw = doc.getTextWidth(pill.label) + 6;
      doc.setFillColor(pill.color[0], pill.color[1], pill.color[2]);
      doc.setGState(doc.GState({ opacity: 0.12 }));
      doc.roundedRect(px, y - 1, tw, 6, 1, 1, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));
      doc.setTextColor(pill.color[0], pill.color[1], pill.color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(pill.label, px + 3, y + 2.8);
      px += tw + 3;
    });
    y += 10;

    // Fines table
    if (finesIncomes.length > 0) {
      checkPage(8 + finesIncomes.length * 6 + 8);
      doc.setFillColor(...colors.light);
      doc.roundedRect(margin + 10, y - 1, contentWidth - 10, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...colors.muted);
      doc.text('Multas cobradas', margin + 13, y + 2.8);
      y += 8;

      finesIncomes.forEach((fine: IOtherIncome) => {
        checkPage(6);
        const fullName = fine.user ? `${fine.user.lastname}, ${fine.user.name}` : 'Sin socio';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...colors.dark);
        doc.text(fullName, margin + 13, y + 2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.muted);
        const descX = margin + 13 + doc.getTextWidth(fullName) + 3;
        doc.text(`— ${fine.description || 'Multa'}`, descX, y + 2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.dark);
        doc.text(fmtCurrency(fine.amount), pageWidth - margin, y + 2, { align: 'right' });
        y += 6;
      });

      drawLine(y - 1);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.dark);
      doc.text(`Total: ${fmtCurrency(totalFines)}`, pageWidth - margin, y + 3, { align: 'right' });
      y += 8;
    }

    drawLine(y); y += 6;

    // ===== 3. COMPRA DE ACCIONES =====
    sectionTitle(2, 'Compra de acciones');

    if (sharesWithPurchases.length > 0) {
      sharesWithPurchases.forEach((partner) => {
        checkPage(7);
        const qty = partner.shares.reduce((s, sh) => s + sh.quantity, 0);
        const total = partner.shares.reduce((s, sh) => s + sh.quantity * sh.price, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colors.dark);
        doc.text(`${partner.lastname}, ${partner.name}`, margin + 13, y + 2);
        doc.setTextColor(...colors.muted);
        doc.text(`${qty} ${qty === 1 ? 'acción' : 'acciones'}`, margin + 80, y + 2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.green);
        doc.text(fmtCurrency(total), pageWidth - margin, y + 2, { align: 'right' });
        y += 6;
      });
      drawLine(y - 1);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.dark);
      doc.text(`Total: ${fmtCurrency(totalSharesAmount)}`, pageWidth - margin, y + 3, { align: 'right' });
      y += 8;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text('No se realizaron compras de acciones.', margin + 13, y + 2);
      y += 8;
    }

    drawLine(y); y += 6;

    // ===== 4. PAGOS DE CAPITAL E INTERESES =====
    sectionTitle(3, 'Pago de capital e intereses');

    if (payments.length > 0) {
      // Table header
      checkPage(8 + payments.length * 6 + 10);
      doc.setFillColor(...colors.light);
      doc.rect(margin + 10, y - 1, contentWidth - 10, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...colors.muted);
      doc.text('Socio', margin + 13, y + 3);
      doc.text('Interés', margin + 100, y + 3, { align: 'right' });
      doc.text('Capital', margin + 125, y + 3, { align: 'right' });
      doc.text('Total', pageWidth - margin, y + 3, { align: 'right' });
      y += 8;

      payments.forEach((payment, idx) => {
        checkPage(6);
        const user = paymentsData?.partners?.find(u => u.id === payment.userId);
        const interest = Number(payment.interest || 0);
        if (idx > 0) { drawLine(y - 1); }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colors.dark);
        doc.text(user ? `${user.lastname}, ${user.name}` : '-', margin + 13, y + 2.5);
        doc.setTextColor(...colors.muted);
        doc.text(fmtCurrency(interest), margin + 100, y + 2.5, { align: 'right' });
        doc.text(fmtCurrency(payment.amount), margin + 125, y + 2.5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.dark);
        doc.text(fmtCurrency(payment.amount + interest), pageWidth - margin, y + 2.5, { align: 'right' });
        y += 6;
      });

      // Totals row
      doc.setFillColor(...colors.light);
      doc.rect(margin + 10, y - 1, contentWidth - 10, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.dark);
      doc.text('Totales', margin + 13, y + 3);
      doc.text(fmtCurrency(totalInterest), margin + 100, y + 3, { align: 'right' });
      doc.text(fmtCurrency(totalCapital), margin + 125, y + 3, { align: 'right' });
      doc.text(fmtCurrency(totalPayments), pageWidth - margin, y + 3, { align: 'right' });
      y += 10;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text('No se registraron pagos de capital e intereses.', margin + 13, y + 2);
      y += 8;
    }

    drawLine(y); y += 6;

    // ===== 5. AHORRISTAS =====
    sectionTitle(4, 'Gestión de ahorristas');

    if (savingsWithDeposits.length > 0) {
      savingsWithDeposits.forEach((partner) => {
        checkPage(7);
        const depTotal = partner.deposits.reduce((s, d) => s + d.amount, 0);
        const payTotal = partner.payouts.reduce((s, p) => s + p.amount, 0);
        const withdrawTotal = (partner.withdrawals ?? []).reduce((s, w) => s + w.amount, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colors.dark);
        doc.text(`${partner.lastname}, ${partner.name}`, margin + 13, y + 2);
        if (depTotal > 0) {
          doc.setTextColor(...colors.green);
          doc.text(`+${fmtCurrency(depTotal)}`, margin + 110, y + 2, { align: 'right' });
        }
        if (payTotal > 0) {
          doc.setTextColor(...colors.red);
          doc.text(`Intereses: -${fmtCurrency(payTotal)}`, pageWidth - margin, y + 2, { align: 'right' });
        } else if (withdrawTotal > 0) {
          doc.setTextColor(...colors.red);
          doc.text(`Retiros: -${fmtCurrency(withdrawTotal)}`, pageWidth - margin, y + 2, { align: 'right' });
        }
        y += 6;
        if (payTotal > 0 && withdrawTotal > 0) {
          doc.setTextColor(...colors.red);
          doc.text(`Retiros: -${fmtCurrency(withdrawTotal)}`, pageWidth - margin, y + 2, { align: 'right' });
          y += 6;
        }
      });
      drawLine(y - 1);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...colors.green);
      doc.text(`Depósitos: ${fmtCurrency(totalSavingsDeposits)}`, margin + 13, y + 3);
      doc.setTextColor(...colors.red);
      doc.text(`Retiros: ${fmtCurrency(totalSavingsWithdrawals)} | Intereses: ${fmtCurrency(totalSavingsPayouts)}`, pageWidth - margin, y + 3, { align: 'right' });
      y += 8;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text('No se registraron movimientos de ahorristas.', margin + 13, y + 2);
      y += 8;
    }

    drawLine(y); y += 6;

    // ===== 6. OPERACIONES =====
    sectionTitle(5, 'Operaciones realizadas');

    if (operationRows.length > 0) {
      checkPage(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...colors.muted);
      doc.text('Tipo', margin + 13, y + 2);
      doc.text('Detalle', margin + 44, y + 2);
      doc.text('Monto', pageWidth - margin, y + 2, { align: 'right' });
      y += 5;
      drawLine(y - 1);

      operationRows.forEach((op) => {
        checkPage(9);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(op.category === 'ingreso' ? colors.green[0] : colors.red[0], op.category === 'ingreso' ? colors.green[1] : colors.red[1], op.category === 'ingreso' ? colors.green[2] : colors.red[2]);
        doc.text(op.label, margin + 13, y + 2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.dark);
        doc.text(doc.splitTextToSize(op.description, 78)[0] || '-', margin + 44, y + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(`${op.category === 'ingreso' ? '+' : '-'}${fmtCurrency(op.amount)}`, pageWidth - margin, y + 2, { align: 'right' });
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(...colors.muted);
        doc.text(`${fmtDate(op.date)}${op.user ? ` | ${op.user}` : ''}`, margin + 44, y + 1);
        y += 5;
      });

      drawLine(y - 1);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...colors.green);
      doc.text(`Ingresos operativos: ${fmtCurrency(totalIncomeOps)}`, margin + 13, y + 3);
      doc.setTextColor(...colors.red);
      doc.text(`Egresos operativos: ${fmtCurrency(totalExpenseOps)}`, pageWidth - margin, y + 3, { align: 'right' });
      y += 8;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text('No se registraron operaciones fuera de ahorros.', margin + 13, y + 2);
      y += 8;
    }

    drawLine(y); y += 6;

    // ===== 7. CRÉDITOS =====
    sectionTitle(6, 'Aplicación y aprobación de créditos');

    if (creditApplications.length > 0) {
      creditApplications.forEach((credit) => {
        checkPage(12);
        const statusLabels: Record<string, { label: string; color: [number, number, number] }> = {
          'approved': { label: 'Aprobado', color: colors.green },
          'rejected': { label: 'Rechazado', color: colors.red },
          'pending': { label: 'Pendiente', color: colors.amber },
        };
        const st = statusLabels[credit.status] || statusLabels['pending'];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...colors.dark);
        doc.text(`${credit.user.lastname}, ${credit.user.name}`, margin + 13, y + 2);

        // Status badge
        doc.setFontSize(6.5);
        doc.setTextColor(...st.color);
        const badgeText = st.label;
        const badgeW = doc.getTextWidth(badgeText) + 6;
        doc.setFillColor(st.color[0], st.color[1], st.color[2]);
        doc.setGState(doc.GState({ opacity: 0.12 }));
        doc.roundedRect(pageWidth - margin - badgeW, y - 1.5, badgeW, 6, 1, 1, 'F');
        doc.setGState(doc.GState({ opacity: 1 }));
        doc.text(badgeText, pageWidth - margin - badgeW + 3, y + 2);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...colors.muted);
        let detailParts = [`Solicitado: ${fmtCurrency(credit.amount)}`];
        if (credit.loan?.amount) detailParts.push(`Aprobado: ${fmtCurrency(credit.loan.amount)}`);
        if (credit.loan?.initalInstallments) detailParts.push(`${credit.loan.initalInstallments} meses`);
        if (credit.loan?.loanType) detailParts.push(getLoanTypeDisplay(credit.loan.loanType));
        doc.text(detailParts.join('  •  '), margin + 13, y + 1.5);
        y += 7;
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text('No se presentaron solicitudes de crédito.', margin + 13, y + 2);
      y += 8;
    }

    drawLine(y); y += 6;

    // ===== 8. ARQUEO DE CAJA =====
    sectionTitle(7, 'Arqueo de caja');

    checkPage(14);
    const boxW = (contentWidth - 10) / 3;
    const boxX = margin + 10;

    const boxes = [
      { label: 'INGRESOS', value: fmtCurrency(actaCashBalance.currentBalance), color: colors.green },
      { label: 'EGRESOS', value: fmtCurrency(actaCashBalance.totalExpenses), color: colors.red },
      { label: 'SALDO NETO', value: fmtCurrency(actaCashBalance.availableBalance), color: actaCashBalance.availableBalance >= 0 ? colors.green : colors.red },
    ];

    boxes.forEach((box, i) => {
      const bx = boxX + i * boxW;
      doc.setFillColor(...colors.light);
      if (i === 2) doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setGState(doc.GState({ opacity: i === 2 ? 0.08 : 1 }));
      doc.roundedRect(bx + 1, y - 1, boxW - 2, 14, 1.5, 1.5, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...colors.muted);
      doc.text(box.label, bx + boxW / 2, y + 3, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...box.color);
      doc.text(box.value, bx + boxW / 2, y + 9.5, { align: 'center' });
    });
    y += 18;

    // ===== RESUMEN FINANCIERO =====
    checkPage(30);
    y += 4;
    doc.setFillColor(...colors.primary);
    doc.setGState(doc.GState({ opacity: 0.05 }));
    doc.roundedRect(margin, y - 2, contentWidth, 28, 2, 2, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.text('Resumen Financiero', margin + 4, y + 4);
    y += 8;

    const summaryItems = [
      { label: 'Multas', value: totalFines },
      { label: 'Acciones', value: totalSharesAmount },
      { label: 'Recuperación', value: totalPayments },
      { label: 'Ahorros', value: totalSavingsDeposits },
      { label: 'Operaciones', value: totalIncomeOps },
      { label: 'Egresos', value: totalActaExpenses },
    ];
    const totalRecaudado = totalActaIncome;

    const itemW = (contentWidth - 8) / 4;
    summaryItems.forEach((item, i) => {
      const ix = margin + 4 + (i % 4) * itemW;
      const iy = y + Math.floor(i / 4) * 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...colors.muted);
      doc.text(item.label.toUpperCase(), ix, iy + 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...colors.dark);
      doc.text(fmtCurrency(item.value), ix, iy + 8);
    });

    // Total
    const tx = margin + 4 + 2 * itemW;
    const ty = y + 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...colors.primary);
    doc.text('SALDO NETO', tx, ty + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...(actaCashBalance.availableBalance >= 0 ? colors.green : colors.red));
    doc.text(fmtCurrency(totalRecaudado - totalActaExpenses), tx, ty + 9);
    y += 27;

    // ===== FIRMA / CONFIRMACIÓN =====
    checkPage(30);
    y += 10;
    drawLine(y); y += 10;

    if (isConfirmed) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...colors.green);
      doc.text('ACTA CONFIRMADA', pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...colors.muted);
      doc.text('El acta ha sido leída y aprobada por el administrador.', pageWidth / 2, y, { align: 'center' });
      y += 3;
      doc.text('Todos los acuerdos y decisiones han sido registrados correctamente.', pageWidth / 2, y, { align: 'center' });
    }

    // Footer
    const footerY = pageHeight - 8;
    doc.setFontSize(6);
    doc.setTextColor(...colors.muted);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-PE')} a las ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`, margin, footerY);
    doc.text('Documento generado automáticamente', pageWidth - margin, footerY, { align: 'right' });

    // Save
    const fileName = `Acta_${fmtDate(assemblyRun.startAt).replace(/\s/g, '_').replace(/,/g, '')}.pdf`;
    doc.save(fileName);
  }, [assemblyRun, participants, attended, late, absent, presentCount, quorumPercent,
    sharesWithPurchases, totalSharesAmount, totalSharesQty, partnerShares,
    payments, paymentsData, totalCapital, totalInterest, totalPayments,
    finesIncomes, totalFines, otherIncomes,
    savingsWithDeposits, totalSavingsDeposits, totalSavingsPayouts, totalSavingsWithdrawals, savingsPartners,
    funds, administrativeExpenses, socialFundsExpenses, dividends, otherExpenses, operationRows,
    totalFundsAmount, totalOtherIncomesAmount, totalIncomeOps, totalAdminAmount,
    totalSocialExpAmount, totalOtherExpAmount, totalDividendsAmount, totalExpenseOps,
    totalActaIncome, totalActaExpenses, actaCashBalance, creditApplications, isConfirmed, approvedCredits, getLoanTypeDisplay]);

  if (!assemblyRun || loading) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-0 pt-4 sm:pt-5 px-3 sm:px-5">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header Card */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-0 pt-4 sm:pt-5 px-3 sm:px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-semibold">Acta de Reunión</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generatePDF}
                className="gap-1.5 h-7 text-xs"
              >
                <Download className="w-3 h-3" />
                PDF
              </Button>
              {isConfirmed ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Confirmada
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs font-medium">Borrador</Badge>
              )}
            </div>
          </div>

          {/* Meeting Info Pills */}
          <div className="flex items-center gap-2 flex-wrap pb-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">{formatDate(assemblyRun.startAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">
                {formatTime(assemblyRun.startAt)}
                {assemblyRun.endAt && ` - ${formatTime(assemblyRun.endAt)}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="font-semibold tabular-nums">{presentCount}/{participants.length}</span>
              <span className="text-muted-foreground">Asistentes</span>
            </div>
            <div className="h-4 w-px bg-border mx-1" />
            <span className={`text-xs font-bold ${quorumPercent >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              Quórum: {quorumPercent}%
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-3 sm:px-5 pb-5">
          <div className="space-y-6">

            {/* 1. Asistencia */}
            <Section
              number={1}
              title="Control de asistencia"
              icon={Users}
              badge={{ label: `${presentCount} presentes`, variant: "outline" }}
            >
              <div className="space-y-2">
                {/* Attendance summary */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{attended.length}</span>
                    <span className="text-emerald-600/70">Presentes</span>
                  </div>
                  {late.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 text-xs">
                      <Timer className="w-3 h-3 text-amber-600" />
                      <span className="font-semibold text-amber-700 dark:text-amber-400">{late.length}</span>
                      <span className="text-amber-600/70">Tardanzas</span>
                    </div>
                  )}
                  {absent.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/30 text-xs">
                      <UserX className="w-3 h-3 text-rose-600" />
                      <span className="font-semibold text-rose-700 dark:text-rose-400">{absent.length}</span>
                      <span className="text-rose-600/70">Ausentes</span>
                    </div>
                  )}
                </div>

                {/* Fines collected */}
                {finesIncomes.length > 0 && (
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="px-3 py-2 bg-muted/30 text-xs font-medium text-muted-foreground">
                      Multas cobradas
                    </div>
                    <div className="divide-y">
                      {finesIncomes.map((fine: IOtherIncome, idx: number) => {
                        const fullName = fine.user ? `${fine.user.lastname}, ${fine.user.name}` : "Sin socio";
                        return (
                          <div key={idx} className="flex justify-between items-center px-3 py-2 text-sm gap-3">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium truncate">{fullName}</span>
                              <span className="text-[11px] text-muted-foreground truncate">{fine.description}</span>
                            </div>
                            <span className="font-semibold tabular-nums shrink-0">{formatCurrency(fine.amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end px-3 py-2 bg-muted/20 border-t">
                      <span className="text-xs text-muted-foreground">
                        Total: <span className="font-bold text-foreground">{formatCurrency(totalFines)}</span>
                      </span>
                    </div>
                  </div>
                )}
                {finesIncomes.length === 0 && (
                  <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                    No se registraron multas en esta reunión.
                  </div>
                )}
              </div>
            </Section>

            <div className="border-t" />

            {/* 3. Compra de acciones */}
            <Section
              number={2}
              title="Compra de acciones"
              icon={TrendingUp}
              badge={totalSharesQty > 0 ? { label: `${totalSharesQty} acciones`, variant: "outline" } : undefined}
            >
              {sharesWithPurchases.length > 0 ? (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="divide-y">
                    {sharesWithPurchases.map((partner) => {
                      const qty = partner.shares.reduce((s, sh) => s + sh.quantity, 0);
                      const total = partner.shares.reduce((s, sh) => s + sh.quantity * sh.price, 0);
                      return (
                        <div key={partner.id} className="flex items-center justify-between px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {partner.name?.[0]}{partner.lastname?.[0]}
                            </div>
                            <div>
                              <span className="text-sm font-medium">{partner.lastname}, {partner.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{qty} {qty === 1 ? 'acción' : 'acciones'}</span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end px-3 py-2 bg-muted/20 border-t">
                    <span className="text-xs text-muted-foreground">
                      Total: <span className="font-bold text-foreground">{formatCurrency(totalSharesAmount)}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                  No se realizaron compras de acciones.
                </div>
              )}
            </Section>

            <div className="border-t" />

            {/* 4. Pagos de capital e intereses */}
            <Section
              number={3}
              title="Pago de capital e intereses"
              icon={CreditCard}
              badge={payments.length > 0 ? { label: `${payments.length} pagos`, variant: "outline" } : undefined}
            >
              {payments.length > 0 ? (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground">Socio</th>
                          <th className="text-right px-3 py-2 font-medium text-xs text-muted-foreground">Interés</th>
                          <th className="text-right px-3 py-2 font-medium text-xs text-muted-foreground">Capital</th>
                          <th className="text-right px-3 py-2 font-medium text-xs text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.map((payment, idx) => {
                          const user = paymentsData?.partners?.find(u => u.id === payment.userId);
                          const interest = Number(payment.interest || 0);
                          return (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="px-3 py-2">{user ? `${user.lastname}, ${user.name}` : '-'}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{formatCurrency(interest)}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{formatCurrency(payment.amount)}</td>
                              <td className="text-right px-3 py-2 font-medium tabular-nums">{formatCurrency(payment.amount + interest)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30 font-medium border-t">
                          <td className="px-3 py-2 text-xs">Totales</td>
                          <td className="text-right px-3 py-2 tabular-nums">{formatCurrency(totalInterest)}</td>
                          <td className="text-right px-3 py-2 tabular-nums">{formatCurrency(totalCapital)}</td>
                          <td className="text-right px-3 py-2 font-bold tabular-nums">{formatCurrency(totalPayments)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                  No se registraron pagos de capital e intereses.
                </div>
              )}
            </Section>

            <div className="border-t" />

            {/* 5. Ahorristas */}
            <Section
              number={4}
              title="Gestión de ahorristas"
              icon={Wallet}
              badge={savingsWithDeposits.length > 0 ? { label: `${savingsWithDeposits.length} ahorristas`, variant: "outline" } : undefined}
            >
              {savingsWithDeposits.length > 0 ? (
                <div className="space-y-2">
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="divide-y">
                      {savingsWithDeposits.map((partner) => {
                        const depositsTotal = partner.deposits.reduce((s, d) => s + d.amount, 0);
                        const payoutsTotal = partner.payouts.reduce((s, p) => s + p.amount, 0);
                        const withdrawalsTotal = (partner.withdrawals ?? []).reduce((s, w) => s + w.amount, 0);
                        return (
                          <div key={partner.id} className="flex items-center justify-between px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {partner.name?.[0]}{partner.lastname?.[0]}
                              </div>
                              <span className="text-sm font-medium">{partner.lastname}, {partner.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {depositsTotal > 0 && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  +{formatCurrency(depositsTotal)}
                                </span>
                              )}
                              {payoutsTotal > 0 && (
                                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                  Intereses -{formatCurrency(payoutsTotal)}
                                </span>
                              )}
                              {withdrawalsTotal > 0 && (
                                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                  Retiros -{formatCurrency(withdrawalsTotal)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-muted/20 border-t text-xs">
                      <span className="text-muted-foreground">
                        Depósitos: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSavingsDeposits)}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Retiros: <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalSavingsWithdrawals)}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Intereses: <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalSavingsPayouts)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                  No se registraron movimientos de ahorristas.
                </div>
              )}
            </Section>

            <div className="border-t" />

            {/* 6. Operaciones realizadas */}
            <Section number={5} title="Operaciones realizadas" icon={ArrowUpRight}>
              {operationRows.length > 0 ? (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="divide-y">
                    {operationRows.map((op) => (
                      <div key={op.id} className="px-3 py-2.5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 h-5 ${op.category === "ingreso" ? "text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400" : "text-rose-700 border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400"}`}
                            >
                              {op.label}
                            </Badge>
                            <span className="text-sm font-medium">{op.description}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {op.user && <span>{op.user} · </span>}
                            {op.date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })}
                          </div>
                        </div>
                        <span className={`text-sm font-semibold tabular-nums shrink-0 ${op.category === "ingreso" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {op.category === "ingreso" ? "+" : "-"}{formatCurrency(op.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 border-t bg-muted/20 text-xs">
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-muted-foreground">Ingresos operativos</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncomeOps)}</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between sm:border-l">
                      <span className="text-muted-foreground">Egresos operativos</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalExpenseOps)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                  No se registraron operaciones fuera de ahorros.
                </div>
              )}
            </Section>

            <div className="border-t" />

            {/* 7. Créditos */}
            <Section
              number={6}
              title="Aplicación y aprobación de créditos"
              icon={ClipboardCheck}
              badge={creditApplications.length > 0 ? { label: `${creditApplications.length} solicitudes`, variant: "outline" } : undefined}
            >
              {creditApplications.length > 0 ? (
                <div className="space-y-2">
                  {creditApplications.map((credit) => {
                    const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
                      'approved': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', label: 'Aprobado', icon: CheckCircle },
                      'rejected': { color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800', label: 'Rechazado', icon: XCircle },
                      'pending': { color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800', label: 'Pendiente', icon: AlertCircle },
                    };
                    const sc = statusConfig[credit.status] || statusConfig['pending'];
                    const StatusIcon = sc.icon;

                    return (
                      <div key={credit.id} className="rounded-lg border bg-card p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {credit.user.name?.[0]}{credit.user.lastname?.[0]}
                            </div>
                            <span className="text-sm font-medium">{credit.user.lastname}, {credit.user.name}</span>
                          </div>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border gap-1 ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-9">
                          <span>Solicitado: <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(credit.amount)}</span></span>
                          {credit.loan?.amount && (
                            <span>Aprobado: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(credit.loan.amount)}</span></span>
                          )}
                          {credit.loan?.initalInstallments && (
                            <span>{credit.loan.initalInstallments} meses</span>
                          )}
                          {credit.loan?.loanType && (
                            <span>{getLoanTypeDisplay(credit.loan.loanType)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                  No se presentaron solicitudes de crédito.
                </div>
              )}
            </Section>

            <div className="border-t" />

            {/* 8. Arqueo de caja */}
            <Section number={7} title="Arqueo de caja" icon={Wallet}>
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="grid grid-cols-3 divide-x">
                  <div className="p-3 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Ingresos</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatCurrency(actaCashBalance.currentBalance)}
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Egresos</div>
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {formatCurrency(actaCashBalance.totalExpenses)}
                    </div>
                  </div>
                  <div className="p-3 text-center bg-muted/20">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Saldo Neto</div>
                    <div className={`text-sm font-bold tabular-nums ${actaCashBalance.availableBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(actaCashBalance.availableBalance)}
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Card */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-0 pt-4 sm:pt-5 px-3 sm:px-5">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base font-semibold">Resumen Financiero</CardTitle>
            <Badge variant="outline" className="text-xs font-medium">Esta reunión</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-5 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Multas</div>
              <div className="text-lg font-bold tabular-nums">{formatCurrency(totalFines)}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Acciones</div>
              <div className="text-lg font-bold tabular-nums">{formatCurrency(totalSharesAmount)}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Recuperación</div>
              <div className="text-lg font-bold tabular-nums">{formatCurrency(totalPayments)}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Ahorros</div>
              <div className="text-lg font-bold tabular-nums">{formatCurrency(totalSavingsDeposits)}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Operaciones</div>
              <div className="text-lg font-bold tabular-nums">{formatCurrency(totalIncomeOps)}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Egresos</div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">{formatCurrency(totalActaExpenses)}</div>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
              <div className="text-[10px] text-primary/70 uppercase tracking-wide font-medium">Saldo Neto</div>
              <div className={`text-xl font-bold tabular-nums ${actaCashBalance.availableBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatCurrency(actaCashBalance.availableBalance)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Card */}
      <Card className={`w-full overflow-hidden transition-colors ${isConfirmed ? 'border-emerald-200 dark:border-emerald-800' : ''}`}>
        <CardContent className="p-5">
          {isConfirmed ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">Acta Confirmada</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  El acta ha sido leída y aprobada por el administrador. Todos los acuerdos y decisiones han sido registrados correctamente.
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmada
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Confirmación del Acta</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Revise todos los puntos del acta antes de confirmar. Una vez confirmada, el acta quedará registrada oficialmente.
                </p>
              </div>
              <Button
                onClick={() => setConfirmOpen(true)}
                className="bg-primary hover:bg-primary/90 gap-1.5 shrink-0"
                size="sm"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar Acta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ring-4 ring-primary/10">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Confirmar Acta de Reunión
            </DialogTitle>
            <DialogDescription className="text-center">
              Al confirmar, el acta quedará registrada como documento oficial de la asamblea del{' '}
              <span className="font-medium text-foreground">{formatDate(assemblyRun.startAt)}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asistentes</span>
                <span className="font-medium">{presentCount} de {participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Acciones vendidas</span>
                <span className="font-medium">{totalSharesQty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créditos aprobados</span>
                <span className="font-medium">{approvedCredits.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingresos validados</span>
                <span className="font-bold text-primary">{formatCurrency(totalActaIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo neto</span>
                <span className={`font-bold ${actaCashBalance.availableBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatCurrency(actaCashBalance.availableBalance)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isConfirming}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmActa}
              disabled={isConfirming}
              className="w-full sm:w-auto"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Acta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
