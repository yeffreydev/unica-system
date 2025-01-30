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
import { StocksForm } from "@/components/forms/StocksForm";
import { StocksTable } from "./StocksTable";

export default function DepositsPage() {
  return (
    <Container>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Acciones La Unica</h1>
        <DialogForm>
          <StocksForm />
        </DialogForm>
      </div>
      <StocksTable />
    </Container>
  );
}
