"use client";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { LoanForm } from "@/app/(app)/expenses/loans/LoanForm";
import { LoansTable } from "./LoansTable";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";

export default function LoansPage() {
  const {
    bank: { bank },
  } = useContext(AppContext);

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl">
          Prestamos <span className="font-bold">{bank.name}</span>
        </h1>
        <DialogForm open={isOpenDialog} onOpenChange={setIsOpenDialog}>
          <LoanForm setIsOpenDialog={setIsOpenDialog} />
        </DialogForm>
      </div>
      <LoansTable />
    </>
  );
}
