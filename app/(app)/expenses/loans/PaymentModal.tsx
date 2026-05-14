"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ILoan, ILoanInstallment, ILoanType } from "@/types/ILoan";
import apiClient from "@/config/apiClient";
import { formatCurrency } from "@/lib/utils";
import { ComboboxLoanTypes } from "@/components/combobox/ComboboxLoanTypes";
import { CheckCircle2, ListPlus, Wallet, Calendar, Layers, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  loan: ILoan | null;
  onPaymentSuccess: () => void;
}

export const PaymentModal = ({
  isOpen,
  onOpenChange,
  loan,
  onPaymentSuccess,
}: PaymentModalProps) => {
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [installments, setInstallments] = useState<string>("1");
  const [initialInstallmentDate, setInitialInstallmentDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentInstallment, setCurrentInstallment] = useState<ILoanInstallment | null>(null);
  const [loanTypes, setLoanTypes] = useState<ILoanType[]>([]);
  const [loanTypeSelected, setLoanTypeSelected] = useState<ILoanType | null>(null);

  const handlePayAllClick = () => {
    setPaymentType('full');
    setShowConfirmDialog(true);
  };

  const handlePartialPaymentClick = () => {
    setPaymentType('partial');
    handlePartialPayment();
  };

  const handlePayAllConfirm = async () => {
    if (!loan?.id) return;

    setIsSubmitting(true);
    setShowConfirmDialog(false);
    try {
      const response = await apiClient.post(`/loans/mark-as-paid-all/${loan.id}`, {
        date: new Date(),
        confirm: true,
      });

      if (response.status === 200 || response.status === 201) {
        onPaymentSuccess();
        onOpenChange(false);
        setPaymentAmount("");
      }
    } catch (error) {
      console.error("Error paying loan:", error);
      alert("Error al procesar el pago completo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartialPayment = async () => {
    if (!loan?.id || !paymentAmount || !installments || !initialInstallmentDate || !loanTypeSelected) return;

    const amount = parseFloat(paymentAmount);
    const numInstallments = parseInt(installments);

    if (amount <= 0 || amount > (loan.amount || 0)) {
      alert("Monto inválido");
      return;
    }

    if (numInstallments <= 0) {
      alert("Número de cuotas inválido");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/loans/pay-partial/${loan.id}`, {
        amount: amount,
        installments: numInstallments,
        date: new Date().toISOString(),
        initialInstallmentDate: initialInstallmentDate,
        loanTypeId: loanTypeSelected.id,
      });

      if (response.status === 200 || response.status === 201) {
        onPaymentSuccess();
        onOpenChange(false);
        setPaymentAmount("");
        setInstallments("3");
      }
    } catch (error) {
      console.error("Error processing partial payment:", error);
      alert("Error al procesar el pago parcial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const balance = loan?.balance || 0;

  // Fetch current installment when modal opens
  useEffect(() => {
    const fetchCurrentInstallment = async () => {
      if (!loan?.id) return;
      try {
        const response = await apiClient.get('/schedules/installments/current-month');
        const installments = response.data;
        const currentInst = installments.find((inst: ILoanInstallment) => inst.loanId === loan.id);
        setCurrentInstallment(currentInst || null);
      } catch (error) {
        console.error("Error fetching current installment:", error);
      }
    };

    const fetchLoanTypes = async () => {
      try {
        const response = await apiClient.get('/loans/types');
        setLoanTypes(response.data);
      } catch (error) {
        console.error("Error fetching loan types:", error);
      }
    };

    if (isOpen) {
      fetchCurrentInstallment();
      fetchLoanTypes();
    }
  }, [isOpen, loan?.id]);

  // Set default loan type when loan or loan types are loaded
  useEffect(() => {
    if (loan && loanTypes.length > 0) {
      const defaultLoanType = loanTypes.find(lt => lt.id === loan.loanTypeId) || null;
      setLoanTypeSelected(defaultLoanType);
    }
  }, [loan, loanTypes]);

  useEffect(() => {
    if (isOpen && loan) {
      setPaymentAmount(loan.balance != null ? String(loan.balance) : "");
    }
    if (!isOpen) {
      setPaymentAmount("");
      setInstallments("1");
      setInitialInstallmentDate("");
      setPaymentType('full');
    }
  }, [isOpen, loan]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Regularizar Préstamo
            </DialogTitle>
            <DialogDescription>
              {loan?.user?.name} {loan?.user?.lastname}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Balance pendiente
              </p>
              <p className="text-2xl font-bold text-destructive mt-1">
                {formatCurrency(balance)}
              </p>
              {loan?.amount != null && (
                <p className="text-xs text-muted-foreground mt-2">
                  Monto original: {formatCurrency(loan.amount)}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Selecciona una acción
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePayAllClick}
                  disabled={isSubmitting}
                  className={`group rounded-xl border p-4 text-left transition-all hover:border-primary hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    paymentType === 'full'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Marcar como pagado</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Liquida todo: {formatCurrency(balance)}
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('partial')}
                  disabled={isSubmitting}
                  className={`group rounded-xl border p-4 text-left transition-all hover:border-primary hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    paymentType === 'partial'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <ListPlus className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Generar cuotas</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Divide el saldo en pagos
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {paymentType === 'partial' && (
              <div className="rounded-xl border bg-card p-4 space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <Layers className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">Detalles de las cuotas</h4>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-amount" className="text-xs font-medium">
                      Balance del préstamo
                    </Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      max={balance}
                      min={0}
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo: {formatCurrency(balance)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="installments" className="text-xs font-medium">
                        Nº de cuotas
                      </Label>
                      <Input
                        id="installments"
                        type="number"
                        placeholder="Ej: 3"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        min={1}
                        max={60}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="initial-installment-date" className="text-xs font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Primera cuota
                      </Label>
                      <Input
                        id="initial-installment-date"
                        type="date"
                        value={initialInstallmentDate}
                        onChange={(e) => setInitialInstallmentDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="loan-type" className="text-xs font-medium">
                      Tipo de préstamo
                    </Label>
                    <ComboboxLoanTypes
                      controller={{ loanTypeSelected, setLoanTypeSelected }}
                      loanTypes={loanTypes}
                    />
                  </div>

                  {currentInstallment && (
                    <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Interés actual: {formatCurrency(currentInstallment.interest)}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handlePartialPaymentClick}
                  disabled={!paymentAmount || !installments || !initialInstallmentDate || !loanTypeSelected || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Procesando..." : "Generar cuotas"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Pay All */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirmar pago completo
            </DialogTitle>
            <DialogDescription>
              Marcarás el préstamo como pagado por{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(balance)}
              </span>
              . Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePayAllConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};