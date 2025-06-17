"use client";
import { Bell } from "lucide-react";
import { UsersTable } from "./UsersTable";
export default function Users() {
  return (
    <>
      <div className=" px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-10">
        <UsersTable />
      </div>
    </>
  );
}
