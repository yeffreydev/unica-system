"use client";
import { CapitalAndInterestForm } from "@/app/(app)/incomes/payments/PaymentForm";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentDialog } from "./PaymentDialog";
import { usePayment } from "./usePayment";
import { useContext } from "react";
import { PaymentsContext } from "./PaymentsProvider";

export default function CapitalPaymentsPage() {
  const { openDialog, setOpenDialog } = usePayment();
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Pagos de Capital e Intereses</h1>
        <PaymentDialog open={openDialog} onOpenChange={setOpenDialog}>
          <CapitalAndInterestForm setOpenDialog={setOpenDialog} />
        </PaymentDialog>
      </div>
      <PaymentsTable />
    </>
  );
}
