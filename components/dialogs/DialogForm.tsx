"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AppContext } from "@/context/auth/AppContext";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { ReactNode, useContext } from "react";

export function DialogForm({
  children,
}: {
  children: ReactNode;
  ref?: React.RefObject<HTMLButtonElement>;
}) {
  const { formCloseModalRef } = useContext(AppContext);
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button>Agregar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="hidden">
          <DialogTitle>titulo</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </div>
        {children}
        <DialogClose className="hidden" ref={formCloseModalRef}></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
