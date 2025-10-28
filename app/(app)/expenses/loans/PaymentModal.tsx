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
import { ILoan, ILoanInstallment } from "@/types/ILoan";
import apiClient from "@/config/apiClient";
import { formatCurrency } from "@/lib/utils";

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
  const [installments, setInstallments] = useState<string>("3");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentInstallment, setCurrentInstallment] = useState<ILoanInstallment | null>(null);

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
      const response = await apiClient.post(`/loans/paid-all/${loan.id}`, {
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
    if (!loan?.id || !paymentAmount || !installments) return;

    const amount = parseFloat(paymentAmount);
    const numInstallments = parseInt(installments);

    if (amount <= 0 || amount > (loan.balance || 0)) {
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
    if (isOpen) {
      fetchCurrentInstallment();
    }
  }, [isOpen, loan?.id]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pagar Préstamo</DialogTitle>
            <DialogDescription>
              Realizar pago del préstamo de {loan?.user?.name} {loan?.user?.lastname}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Balance pendiente:</span>
                <span className="text-lg font-bold text-red-600">
                  S/ {formatCurrency(balance)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">¿Qué tipo de pago deseas realizar?</h3>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handlePayAllClick}
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full h-12"
                    variant={paymentType === 'full' ? 'default' : 'outline'}
                  >
                    💰 Pagar Todo (S/ {formatCurrency(balance)})
                  </Button>
                  <Button
                    onClick={() => setPaymentType('partial')}
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full h-12"
                    variant={paymentType === 'partial' ? 'default' : 'outline'}
                  >
                    💳 Pagar Monto Parcial
                  </Button>
                </div>
              </div>

              {paymentType === 'partial' && (
                <div className="border-t pt-6 space-y-4">
                  <h4 className="text-md font-medium text-center">Detalles del Pago Parcial</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="payment-amount">Monto a pagar</Label>
                      <Input
                        id="payment-amount"
                        type="number"
                        placeholder="Ingrese el monto"
                        value={paymentAmount || (currentInstallment ? currentInstallment.payment.toString() : "")}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        max={balance}
                        min={0}
                        step="0.01"
                        className="text-lg"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Máximo: S/ {formatCurrency(balance)}
                        {currentInstallment && (
                          <span className="block text-blue-600">
                            Cuota actual: S/ {formatCurrency(currentInstallment.payment)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="installments">Número de cuotas para el saldo restante</Label>
                      <Input
                        id="installments"
                        type="number"
                        placeholder="Ej: 3, 6, 12"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        min={1}
                        max={60}
                        className="text-lg"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Cuotas en las que se dividirá el saldo restante después del pago
                      </p>
                      {currentInstallment && (
                        <p className="text-sm text-blue-600 mt-1">
                          Interés actual: S/ {formatCurrency(currentInstallment.interest)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={handlePartialPaymentClick}
                      disabled={!paymentAmount || !installments || isSubmitting}
                      size="lg"
                      className="px-8"
                    >
                      {isSubmitting ? "Procesando..." : "Procesar Pago Parcial"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Pay All */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Pago Completo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas pagar el monto completo de S/ {formatCurrency(balance)}?
              Esta acción marcará el préstamo como pagado en su totalidad y no se podrá deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
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
              {isSubmitting ? "Procesando..." : "Confirmar Pago Completo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};