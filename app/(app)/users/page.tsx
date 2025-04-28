"use client";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { UserForm } from "@/components/forms/UserFormt";
import { UsersTable } from "./UsersTable";
import { AppContext } from "@/context/AppContext";
import { useContext } from "react";

export default function Users() {
  const {
    bank: { bank },
  } = useContext(AppContext);
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Usuarios &quot;{bank.name}&quot;</h1>
        <DialogForm>
          <UserForm />
        </DialogForm>
      </div>
      <UsersTable />
    </>
  );
}
