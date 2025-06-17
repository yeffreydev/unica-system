"use client";
import { CapitalAndInterestForm } from "@/app/(app)/incomes/payments/PaymentForm";
import { PaymentsTable } from "./PaymentsTable";

export default function CapitalPaymentsPage() {
  return (
    <>
      <div className="flex justify-between"></div>
      <PaymentsTable />
    </>
  );
}
