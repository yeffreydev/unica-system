import { CapitalAndInterestForm } from "@/app/(app)/incomes/capitalpayments-and-interest/CapitalAndInterestForm";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentDialog } from "./PaymentDialog";

export default function CapitalPaymentsPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Pagos de Capital e Intereses</h1>
        <PaymentDialog>
          <CapitalAndInterestForm />
        </PaymentDialog>
      </div>
      <PaymentsTable />
    </>
  );
}
