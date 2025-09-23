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

export function LegalsDialog({
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
            <Button variant="default" cy-data="open-dialog">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          ) : (
            <Button variant="default" cy-data="open-dialog">
              Agregar
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Pago" : "Ingreso a fondos sociales"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los detalles del ingreso a fondos sociales."
              : "Ingresa los detalles del ingreso a fondos sociales."}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
