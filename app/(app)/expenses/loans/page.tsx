"use client";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { LoanForm } from "@/app/(app)/expenses/loans/LoanForm";
import { LoansTable } from "./LoansTable";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";

export default function LoansPage() {
  const {
    bank: { bank },
  } = useContext(AppContext);

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl">
          Prestamos <span className="font-bold">{bank.name}</span>
        </h1>
        <DialogForm>
          <LoanForm />
        </DialogForm>
      </div>
      <LoansTable />
    </>
  );
}
