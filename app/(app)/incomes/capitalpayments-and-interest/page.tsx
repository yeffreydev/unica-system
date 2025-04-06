import { DialogForm } from "@/components/dialogs/DialogForm";
import { CapitalAndInterestForm } from "@/components/forms/CapitalAndInterestForm";
import { PaymentsTable } from "./PaymentsTable";

const capitalPayments = [
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
  {
    fullname: "nombres y apelliods",
    amount: "1000",
    date: "2021-10-10",
  },
];

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
