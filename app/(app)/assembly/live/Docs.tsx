"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, CheckCircle, Loader2, Download } from "lucide-react";
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
  apiGetActaByRun,
  apiSetActaConfirmation,
} from "../api";
import { toast } from "@/hooks/use-toast";
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
import {
  ActaPaper,
  ActaTitle,
  ActaSection,
  ActaTable,
  ActaClosing,
  ActaConfirmation,
  ACTA_PDF,
  participantStatusLabel,
  creditStatusLabel,
  fmtDateShort,
  fmtTimeShort,
} from "../acta-theme";

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

const personName = (user?: { name?: string | null; lastname?: string | null } | null) =>
  getUserName(user) ?? "—";

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
          fundsRes, adminRes, socialExpRes, otherExpRes, dividendsRes, actaRes
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
          apiGetActaByRun(assemblyRun.id),
        ]);

        setPartnerShares(sharesRes);
        setPaymentsData(paymentsRes);
        setCreditApplications(creditsRes);
        setSavingsPartners(savingsRes);
        setFinesIncomes(actaSummaryRes?.fines || []);
        setOtherIncomes(actaSummaryRes?.otherIncomes || []);
        setIsConfirmed(Boolean(actaRes?.confirmed));
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

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

  const getLoanTypeDisplay = (loanType: string | { name?: string } | null | undefined): string => {
    if (!loanType) return '-';
    if (typeof loanType === 'string') return loanTypesData[loanType as LoanTypesEnum] || loanType;
    if (loanType.name && typeof loanType.name === 'string') return loanTypesData[loanType.name as LoanTypesEnum] || loanType.name;
    return String(loanType);
  };

  const creditDetail = (credit: ICreditApplication) => {
    const parts = [`Solicitado: ${formatCurrency(credit.amount)}`];
    if (credit.loan?.amount) parts.push(`Aprobado: ${formatCurrency(credit.loan.amount)}`);
    if (credit.loan?.initalInstallments) parts.push(`${credit.loan.initalInstallments} meses`);
    if (credit.loan?.loanType) parts.push(getLoanTypeDisplay(credit.loan.loanType));
    return parts.join(" · ");
  };

  const handleConfirmActa = async () => {
    if (!assemblyRun?.id) return;
    setIsConfirming(true);
    try {
      const acta = await apiSetActaConfirmation(assemblyRun.id, { confirmed: true });
      setIsConfirmed(Boolean(acta?.confirmed ?? true));
      setConfirmOpen(false);
      toast({ title: "Acta confirmada", description: "El acta quedó registrada oficialmente en el servidor." });
    } catch (error) {
      console.error("Error confirming acta:", error);
      toast({ title: "Error", description: "No se pudo confirmar el acta. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setIsConfirming(false);
    }
  };

  // ── PDF (documento formal estilo LaTeX) ────────────────────────────────────
  const generatePDF = useCallback(() => {
    if (!assemblyRun) return;

    const C = ACTA_PDF;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const money = (n: number) => `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const name = (u?: { name?: string | null; lastname?: string | null } | null) => getUserName(u) ?? "—";

    const checkPage = (need: number) => { if (y + need > pageHeight - margin) { doc.addPage(); y = margin; } };
    const ruleAt = (yy: number, w = 0.5, color: [number, number, number] = C.rule) => {
      doc.setDrawColor(...color); doc.setLineWidth(w); doc.line(margin, yy, pageWidth - margin, yy);
    };

    type Col = { key: string; title: string; w: number; align?: "right"; get: (r: any) => string | number };

    const section = (num: string, title: string) => {
      checkPage(14);
      doc.setFont(C.serif, "bold"); doc.setFontSize(11); doc.setTextColor(...C.ink);
      doc.text(`${num}.  ${title.toUpperCase()}`, margin, y + 3, { charSpace: 0.4 });
      y += 5; ruleAt(y, 0.4, C.hair); y += 4;
    };

    const table = (cols: Col[], rows: any[], footer?: Record<string, string | number>, emptyMsg?: string) => {
      if (!rows.length) {
        doc.setFont(C.serif, "italic"); doc.setFontSize(9); doc.setTextColor(...C.muted);
        doc.text(`— ${emptyMsg || "Sin movimientos registrados."}`, margin, y + 2); y += 8; return;
      }
      let x = margin;
      const cs = cols.map((c) => { const o = { ...c, x }; x += c.w; return o; });
      const xt = (c: typeof cs[number]) => (c.align === "right" ? c.x + c.w : c.x);
      const opt = (c: typeof cs[number]) => (c.align === "right" ? { align: "right" as const } : undefined);

      checkPage(16);
      ruleAt(y, 0.6); y += 2.4;
      doc.setFont(C.serif, "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.muted);
      cs.forEach((c) => doc.text(c.title.toUpperCase(), xt(c), y + 1, { ...opt(c), charSpace: 0.3 }));
      y += 3.4; ruleAt(y, 0.3, C.rule); y += 3;

      doc.setFont(C.serif, "normal"); doc.setFontSize(9); doc.setTextColor(...C.ink);
      rows.forEach((r) => {
        checkPage(8);
        cs.forEach((c) => {
          let txt = String(c.get(r) ?? "");
          if (c.align !== "right") txt = doc.splitTextToSize(txt, c.w - 3)[0] || "";
          doc.text(txt, xt(c), y + 2, opt(c));
        });
        y += 5;
        doc.setDrawColor(...C.hair); doc.setLineWidth(0.15); doc.line(margin, y - 1.4, pageWidth - margin, y - 1.4);
      });

      if (footer) {
        checkPage(8);
        doc.setFont(C.serif, "bold"); doc.setFontSize(9); doc.setTextColor(...C.ink);
        cs.forEach((c) => { const v = footer[c.key]; if (v != null) doc.text(String(v), xt(c), y + 2.5, opt(c)); });
        y += 5;
      }
      ruleAt(y, 0.6); y += 6;
    };

    // ── Encabezado (\maketitle) ──
    doc.setFont(C.serif, "normal"); doc.setFontSize(9); doc.setTextColor(...C.muted);
    doc.text("ASAMBLEA GENERAL DE SOCIOS", pageWidth / 2, y + 2, { align: "center", charSpace: 1.4 });
    y += 8;
    doc.setFont(C.serif, "bold"); doc.setFontSize(22); doc.setTextColor(...C.ink);
    doc.text("ACTA DE ASAMBLEA", pageWidth / 2, y + 4, { align: "center", charSpace: 0.8 });
    y += 9;
    doc.setFont(C.serif, "italic"); doc.setFontSize(11); doc.setTextColor(...C.muted);
    doc.text(assemblyRun.topic || "Asamblea General de Socios", pageWidth / 2, y + 2, { align: "center" });
    y += 7;
    const timeStr = `${fmtTimeShort(assemblyRun.startAt)}${assemblyRun.endAt ? " – " + fmtTimeShort(assemblyRun.endAt) : ""}`;
    const lugarStr = assemblyRun.place ? `     ·     ${assemblyRun.place}` : "";
    const metaStr = `${fmtDateShort(assemblyRun.startAt)}     ·     ${timeStr}${lugarStr}     ·     Asistencia ${presentCount}/${participants.length}     ·     Quórum ${quorumPercent}%`;
    doc.setFont(C.serif, "normal"); doc.setFontSize(9); doc.setTextColor(...C.muted);
    doc.text(metaStr, pageWidth / 2, y + 2, { align: "center" });
    y += 5;
    ruleAt(y, 0.6); ruleAt(y + 1.3, 0.6); y += 8;

    // I. Asistencia
    section("I", "Control de asistencia");
    table(
      [
        { key: "socio", title: "Socio", w: 120, get: (p) => name(p.user) },
        { key: "estado", title: "Estado", w: 50, align: "right", get: (p) => participantStatusLabel(p.status) },
      ],
      participants, undefined, "Sin participantes registrados."
    );

    // II. Multas
    section("II", "Multas");
    table(
      [
        { key: "socio", title: "Socio", w: 80, get: (f) => (f.user ? name(f.user) : "Sin socio") },
        { key: "motivo", title: "Motivo", w: 60, get: (f) => f.description || "Multa" },
        { key: "monto", title: "Monto", w: 30, align: "right", get: (f) => money(f.amount) },
      ],
      finesIncomes, { socio: "Total", monto: money(totalFines) }, "Sin multas registradas."
    );

    // III. Acciones
    section("III", "Compra de acciones");
    table(
      [
        { key: "socio", title: "Socio", w: 110, get: (p) => `${p.lastname}, ${p.name}` },
        { key: "cant", title: "Cantidad", w: 30, align: "right", get: (p) => p.shares.reduce((s: number, sh: any) => s + sh.quantity, 0) },
        { key: "monto", title: "Monto", w: 30, align: "right", get: (p) => money(p.shares.reduce((s: number, sh: any) => s + sh.quantity * sh.price, 0)) },
      ],
      sharesWithPurchases, { socio: "Total", monto: money(totalSharesAmount) }, "Sin compras de acciones."
    );

    // IV. Recuperación de préstamos
    section("IV", "Recuperación de préstamos");
    table(
      [
        { key: "socio", title: "Socio", w: 70, get: (p) => { const u = paymentsData?.partners?.find((x) => x.id === p.userId); return u ? `${u.lastname}, ${u.name}` : "—"; } },
        { key: "interes", title: "Interés", w: 33, align: "right", get: (p) => money(Number(p.interest || 0)) },
        { key: "capital", title: "Capital", w: 33, align: "right", get: (p) => money(p.amount) },
        { key: "total", title: "Total", w: 34, align: "right", get: (p) => money(p.amount + Number(p.interest || 0)) },
      ],
      payments,
      { socio: "Totales", interes: money(totalInterest), capital: money(totalCapital), total: money(totalPayments) },
      "Sin pagos de préstamos."
    );

    // V. Ahorristas
    section("V", "Gestión de ahorristas");
    table(
      [
        { key: "socio", title: "Socio", w: 70, get: (p) => `${p.lastname}, ${p.name}` },
        { key: "dep", title: "Depósitos", w: 33, align: "right", get: (p) => money(p.deposits.reduce((s: number, d: any) => s + d.amount, 0)) },
        { key: "int", title: "Intereses", w: 33, align: "right", get: (p) => money(p.payouts.reduce((s: number, d: any) => s + d.amount, 0)) },
        { key: "ret", title: "Retiros", w: 34, align: "right", get: (p) => money((p.withdrawals ?? []).reduce((s: number, d: any) => s + d.amount, 0)) },
      ],
      savingsWithDeposits,
      { socio: "Totales", dep: money(totalSavingsDeposits), int: money(totalSavingsPayouts), ret: money(totalSavingsWithdrawals) },
      "Sin movimientos de ahorristas."
    );

    // VI. Operaciones
    section("VI", "Operaciones realizadas");
    table(
      [
        { key: "tipo", title: "Tipo", w: 40, get: (o) => o.label },
        { key: "detalle", title: "Detalle", w: 95, get: (o) => o.description },
        { key: "monto", title: "Monto", w: 35, align: "right", get: (o) => `${o.category === "ingreso" ? "+" : "-"}${money(o.amount)}` },
      ],
      operationRows,
      { tipo: "Ingresos / Egresos", monto: `${money(totalIncomeOps)} / ${money(totalExpenseOps)}` },
      "Sin operaciones registradas."
    );

    // VII. Créditos
    section("VII", "Aplicación y aprobación de créditos");
    table(
      [
        { key: "socio", title: "Socio", w: 70, get: (c) => `${c.user.lastname}, ${c.user.name}` },
        { key: "detalle", title: "Detalle", w: 70, get: (c) => creditDetail(c) },
        { key: "estado", title: "Estado", w: 30, align: "right", get: (c) => creditStatusLabel(c.status) },
      ],
      creditApplications, undefined, "Sin solicitudes de crédito."
    );

    // VIII. Arqueo de caja
    section("VIII", "Arqueo de caja");
    table(
      [
        { key: "concepto", title: "Concepto", w: 120, get: (r) => r.concepto },
        { key: "monto", title: "Monto", w: 50, align: "right", get: (r) => money(r.monto) },
      ],
      [
        { concepto: "Total de ingresos", monto: actaCashBalance.currentBalance },
        { concepto: "Total de egresos", monto: actaCashBalance.totalExpenses },
        { concepto: "Saldo neto", monto: actaCashBalance.availableBalance },
      ]
    );

    // Cierre
    checkPage(28); y += 2;
    doc.setFont(C.serif, "italic"); doc.setFontSize(9.5); doc.setTextColor(...C.ink);
    const closeTime = assemblyRun.endAt ? fmtTimeShort(assemblyRun.endAt) : fmtTimeShort(assemblyRun.startAt);
    doc.text(
      `En constancia de lo actuado y siendo las ${closeTime} horas, se levanta la sesión y se firma la presente acta en señal de plena conformidad con los acuerdos adoptados por la asamblea.`,
      margin, y + 2, { maxWidth: contentWidth, align: "justify" }
    );
    y += 18;

    // Estado de confirmación
    checkPage(24); y += 12;
    {
      const label = isConfirmed ? "ACTA CONFIRMADA POR EL ADMINISTRADOR" : "ACTA NO CONFIRMADA POR EL ADMINISTRADOR";
      const color: [number, number, number] = isConfirmed ? C.green : [138, 90, 0];
      doc.setFont(C.serif, "bold"); doc.setFontSize(9.5);
      const tw = doc.getTextWidth(label) + 12;
      const cx = pageWidth / 2;
      doc.setDrawColor(...color); doc.setLineWidth(0.4);
      doc.roundedRect(cx - tw / 2, y - 2, tw, 9, 1, 1, "S");
      doc.setTextColor(...color);
      doc.text(label, cx, y + 4, { align: "center", charSpace: 0.3 });
    }

    // Pie
    const footerY = pageHeight - 10;
    doc.setFont(C.serif, "normal"); doc.setFontSize(7); doc.setTextColor(...C.faint);
    doc.text(
      `Documento generado el ${new Date().toLocaleDateString("es-PE")} a las ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}${isConfirmed ? " · Acta confirmada" : ""}`,
      pageWidth / 2, footerY, { align: "center" }
    );

    doc.save(`Acta_${fmtDateShort(assemblyRun.startAt).replace(/\s/g, "_").replace(/,/g, "")}.pdf`);
  }, [assemblyRun, participants, presentCount, quorumPercent,
    sharesWithPurchases, totalSharesAmount, payments, paymentsData, totalCapital, totalInterest, totalPayments,
    finesIncomes, totalFines, savingsWithDeposits, totalSavingsDeposits, totalSavingsPayouts, totalSavingsWithdrawals,
    operationRows, totalIncomeOps, totalExpenseOps, actaCashBalance, creditApplications, isConfirmed, creditDetail]);

  if (!assemblyRun || loading) {
    return (
      <Card className="w-full overflow-hidden">
        <CardContent className="p-8 space-y-4">
          <Skeleton className="h-8 w-64 mx-auto mb-6" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const closeTime = assemblyRun.endAt ? fmtTimeShort(assemblyRun.endAt) : fmtTimeShort(assemblyRun.startAt);

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {/* Barra de herramientas */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="w-4 h-4" />
          Acta de Asamblea
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={generatePDF} className="gap-1.5 h-7 text-xs">
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

      {/* Documento */}
      <Card className="w-full overflow-hidden border-foreground/15">
        <CardContent className="px-5 sm:px-10 py-8 sm:py-10">
          <ActaPaper>
            <ActaTitle
              subtitle={assemblyRun.topic || "Asamblea General de Socios"}
              meta={[
                { label: "Fecha", value: fmtDateShort(assemblyRun.startAt) },
                { label: "Hora", value: `${fmtTimeShort(assemblyRun.startAt)}${assemblyRun.endAt ? ` – ${fmtTimeShort(assemblyRun.endAt)}` : ""}` },
                ...(assemblyRun.place ? [{ label: "Lugar", value: String(assemblyRun.place) }] : []),
                { label: "Asistencia", value: `${presentCount}/${participants.length}` },
                { label: "Quórum", value: `${quorumPercent}%` },
              ]}
            />

            <ActaSection numeral="I" title="Control de asistencia" right={`${participants.length} convocados`}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (p) => personName(p.user) },
                  { key: "estado", header: "Estado", align: "right", render: (p) => participantStatusLabel(p.status) },
                ]}
                rows={participants}
                empty="Sin participantes registrados."
              />
            </ActaSection>

            <ActaSection numeral="II" title="Multas" right={formatCurrency(totalFines)}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (f) => (f.user ? personName(f.user) : "Sin socio") },
                  { key: "motivo", header: "Motivo", render: (f) => f.description || "Multa" },
                  { key: "monto", header: "Monto", align: "right", render: (f) => formatCurrency(f.amount) },
                ]}
                rows={finesIncomes}
                totals={{ socio: "Total", monto: formatCurrency(totalFines) }}
                empty="Sin multas registradas."
              />
            </ActaSection>

            <ActaSection numeral="III" title="Compra de acciones" right={`${totalSharesQty} acciones`}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (p) => `${p.lastname}, ${p.name}` },
                  { key: "cant", header: "Cantidad", align: "right", render: (p) => p.shares.reduce((s: number, sh: any) => s + sh.quantity, 0) },
                  { key: "monto", header: "Monto", align: "right", render: (p) => formatCurrency(p.shares.reduce((s: number, sh: any) => s + sh.quantity * sh.price, 0)) },
                ]}
                rows={sharesWithPurchases}
                totals={{ socio: "Total", monto: formatCurrency(totalSharesAmount) }}
                empty="Sin compras de acciones."
              />
            </ActaSection>

            <ActaSection numeral="IV" title="Pago de capital e intereses">
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (p) => { const u = paymentsData?.partners?.find((x) => x.id === p.userId); return u ? `${u.lastname}, ${u.name}` : "—"; } },
                  { key: "interes", header: "Interés", align: "right", render: (p) => formatCurrency(Number(p.interest || 0)) },
                  { key: "capital", header: "Capital", align: "right", render: (p) => formatCurrency(p.amount) },
                  { key: "total", header: "Total", align: "right", render: (p) => formatCurrency(p.amount + Number(p.interest || 0)) },
                ]}
                rows={payments}
                totals={{ socio: "Totales", interes: formatCurrency(totalInterest), capital: formatCurrency(totalCapital), total: formatCurrency(totalPayments) }}
                empty="Sin pagos de préstamos."
              />
            </ActaSection>

            <ActaSection numeral="V" title="Gestión de ahorristas">
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (p) => `${p.lastname}, ${p.name}` },
                  { key: "dep", header: "Depósitos", align: "right", render: (p) => formatCurrency(p.deposits.reduce((s: number, d: any) => s + d.amount, 0)) },
                  { key: "int", header: "Intereses", align: "right", render: (p) => formatCurrency(p.payouts.reduce((s: number, d: any) => s + d.amount, 0)) },
                  { key: "ret", header: "Retiros", align: "right", render: (p) => formatCurrency((p.withdrawals ?? []).reduce((s: number, d: any) => s + d.amount, 0)) },
                ]}
                rows={savingsWithDeposits}
                totals={{ socio: "Totales", dep: formatCurrency(totalSavingsDeposits), int: formatCurrency(totalSavingsPayouts), ret: formatCurrency(totalSavingsWithdrawals) }}
                empty="Sin movimientos de ahorristas."
              />
            </ActaSection>

            <ActaSection numeral="VI" title="Operaciones realizadas">
              <ActaTable
                columns={[
                  { key: "tipo", header: "Tipo", render: (o) => o.label },
                  { key: "detalle", header: "Detalle", render: (o) => (
                    <span>
                      {o.description}
                      <span className="block text-[10px] text-muted-foreground">
                        {o.user ? `${o.user} · ` : ""}{o.date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })}
                      </span>
                    </span>
                  ) },
                  { key: "monto", header: "Monto", align: "right", render: (o) => `${o.category === "ingreso" ? "+" : "-"}${formatCurrency(o.amount)}` },
                ]}
                rows={operationRows}
                totals={{ tipo: "Ingresos / Egresos", monto: `${formatCurrency(totalIncomeOps)} / ${formatCurrency(totalExpenseOps)}` }}
                empty="Sin operaciones registradas."
              />
            </ActaSection>

            <ActaSection numeral="VII" title="Aplicación y aprobación de créditos" right={creditApplications.length > 0 ? `${creditApplications.length} solicitudes` : undefined}>
              <ActaTable
                columns={[
                  { key: "socio", header: "Socio", render: (c) => `${c.user.lastname}, ${c.user.name}` },
                  { key: "detalle", header: "Detalle", render: (c) => creditDetail(c) },
                  { key: "estado", header: "Estado", align: "right", render: (c) => creditStatusLabel(c.status) },
                ]}
                rows={creditApplications}
                empty="Sin solicitudes de crédito."
              />
            </ActaSection>

            <ActaSection numeral="VIII" title="Arqueo de caja">
              <ActaTable
                columns={[
                  { key: "concepto", header: "Concepto", render: (r) => r.concepto },
                  { key: "monto", header: "Monto", align: "right", render: (r) => formatCurrency(r.monto) },
                ]}
                rows={[
                  { concepto: "Total de ingresos", monto: actaCashBalance.currentBalance },
                  { concepto: "Total de egresos", monto: actaCashBalance.totalExpenses },
                ]}
                totals={{ concepto: "Saldo neto", monto: formatCurrency(actaCashBalance.availableBalance) }}
              />
            </ActaSection>

            <ActaClosing timeLabel={closeTime} />
            <ActaConfirmation confirmed={isConfirmed} />
          </ActaPaper>
        </CardContent>
      </Card>

      {/* Confirmación */}
      <Card className={`w-full overflow-hidden transition-colors print:hidden ${isConfirmed ? 'border-emerald-200 dark:border-emerald-800' : ''}`}>
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
              <Button onClick={() => setConfirmOpen(true)} className="bg-primary hover:bg-primary/90 gap-1.5 shrink-0" size="sm">
                <CheckCircle className="w-4 h-4" />
                Confirmar Acta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ring-4 ring-primary/10">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Confirmar Acta de Asamblea</DialogTitle>
            <DialogDescription className="text-center">
              Al confirmar, el acta quedará registrada como documento oficial de la asamblea del{' '}
              <span className="font-medium text-foreground">{formatDate(assemblyRun.startAt)}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Asistentes</span><span className="font-medium">{presentCount} de {participants.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Acciones vendidas</span><span className="font-medium">{totalSharesQty}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Créditos aprobados</span><span className="font-medium">{approvedCredits.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ingresos validados</span><span className="font-bold text-primary">{formatCurrency(totalActaIncome)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo neto</span>
                <span className={`font-bold ${actaCashBalance.availableBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatCurrency(actaCashBalance.availableBalance)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isConfirming} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleConfirmActa} disabled={isConfirming} className="w-full sm:w-auto">
              {isConfirming ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirmando...</>) : (<><CheckCircle className="mr-2 h-4 w-4" />Confirmar Acta</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
