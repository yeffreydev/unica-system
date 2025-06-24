"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { ReactNode } from "react";

export function UserDialog({
  children,
  isEdit = false,
  disabledTrigger = false,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  isEdit?: boolean;
  disabledTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      {!disabledTrigger && (
        <DialogTrigger asChild>
          {isEdit ? (
            <Button cy-data="open-dialog">
              <Edit className="mr-2 h-4 w-4 bg-[#1F407D]" />
              Editar
            </Button>
          ) : (
            <Button className="bg-[#1F407D] rounded-none" cy-data="open-dialog">
              Agregar
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {/* {isEdit ? "Editar Usuario" : "Nuevo Usuario"} */}
          </DialogTitle>
          <DialogDescription>
            {/* {isEdit
              ? "Modifica los detalles del préstamo aquí."
              : "Ingresa los detalles del nuevo préstamo."} */}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
