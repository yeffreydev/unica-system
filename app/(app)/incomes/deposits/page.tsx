import { DialogForm } from "@/components/dialogs/DialogForm";
import { DepositForm } from "@/app/(app)/incomes/deposits/DepositForm";
import { DepositsTable } from "./DepositsTable";

export default function DepositsPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Depositos</h1>
        <DialogForm>
          <DepositForm />
        </DialogForm>
      </div>
      <DepositsTable />
    </>
  );
}
