import { DialogForm } from "@/components/dialogs/DialogForm";
import { CapitalAndInterestForm } from "@/components/forms/CapitalAndInterestForm";
import { PaymentsTable } from "./PaymentsTable";

export default function CapitalPaymentsPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Pagos de Capital e Intereses</h1>
        <DialogForm>
          <CapitalAndInterestForm />
        </DialogForm>
      </div>
      <PaymentsTable />
    </>
  );
}
