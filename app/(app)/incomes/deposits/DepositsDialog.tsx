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
import { Edit, Plus } from "lucide-react";
import { ReactNode } from "react";

export function DepositsDialog({
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!disabledTrigger && (
        <DialogTrigger asChild>
          {isEdit ? (
            <Button variant="default" cy-data="open-dialog">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          ) : (
            <Button variant="default" cy-data="open-dialog">
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Depósito" : "Nuevo Depósito"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los detalles del depósito aquí."
              : "Ingresa los detalles del nuevo depósito aquí."}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
