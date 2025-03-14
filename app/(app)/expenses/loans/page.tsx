import { DialogForm } from "@/components/dialogs/DialogForm";
import { LoanForm } from "@/app/(app)/expenses/loans/LoanForm";
import { LoansTable } from "./LoansTable";

export default function LoansPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Prestamos La unica</h1>
        <DialogForm>
          <LoanForm />
        </DialogForm>
      </div>
      <LoansTable />
    </>
  );
}
