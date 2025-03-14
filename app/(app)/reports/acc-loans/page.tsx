import { LoansTable } from "./LoansTable";

export default function LoansPage() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Prestamos Acumulados La unica</h1>
      </div>
      <LoansTable />
    </>
  );
}
