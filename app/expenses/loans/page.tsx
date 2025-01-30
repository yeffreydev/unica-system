import { Button } from "@/components/ui/button";
import Container from "../../ui/Container";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { LoanForm } from "@/app/expenses/loans/LoanForm";
import { LoansTable } from "./LoansTable";

export default function LoansPage() {
  return (
    <Container>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Prestamos La unica</h1>
        <DialogForm>
          <LoanForm />
        </DialogForm>
      </div>
      <LoansTable />
    </Container>
  );
}
