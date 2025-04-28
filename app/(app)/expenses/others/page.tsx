import { DialogForm } from "@/components/dialogs/DialogForm";
import { OtherExpenseForm } from "@/app/(app)/expenses/others/OtherExpenseForm";
import { OtherIncomesTable } from "./OtherExpensesTable";

export default function OtherIncomesPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Otros Egresos</h1>
        <DialogForm>
          <OtherExpenseForm />
        </DialogForm>
      </div>
      <OtherIncomesTable />
    </>
  );
}
