import { DialogForm } from "@/components/dialogs/DialogForm";
import { UserForm } from "@/components/forms/UserFormt";
import { UsersTable } from "./UsersTable";

export default function Users() {
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Usuarios "Cerro La Plata"</h1>
        <DialogForm>
          <UserForm />
        </DialogForm>
      </div>
      <UsersTable />
    </>
  );
}
