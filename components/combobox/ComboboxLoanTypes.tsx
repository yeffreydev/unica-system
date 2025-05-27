"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ILoanType } from "@/types/ILoan";
import { loanTypesData } from "@/constants";

export function ComboboxLoanTypes({
  loanTypes,
  controller: { loanTypeSelected, setLoanTypeSelected },
}: {
  loanTypes: ILoanType[];
  controller: {
    loanTypeSelected: ILoanType | null;
    setLoanTypeSelected: (value: ILoanType | null) => void;
  };
}) {
  const [open, setOpen] = React.useState(false);

  // Inicializar value con el ID del tipo de préstamo seleccionado si existe
  const [value, setValue] = React.useState(
    loanTypeSelected ? String(loanTypeSelected.id) : ""
  );

  // Efecto para sincronizar value cuando cambia loanTypeSelected
  React.useEffect(() => {
    setValue(loanTypeSelected ? String(loanTypeSelected.id) : "");
  }, [loanTypeSelected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          cy-data="open-combobox-loan-types"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between z-50"
        >
          {value
            ? // Buscar el tipo de préstamo seleccionado y mostrar su nombre formateado
              loanTypesData[
                (loanTypes.find((loanType) => String(loanType.id) === value)
                  ?.name as keyof typeof loanTypesData) ?? ""
              ]
            : "Selecciona el Tipo de prestamo ..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-max p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No loan type found.</CommandEmpty>
            <CommandGroup cy-data="combobox-loan-types-group">
              {loanTypes.map((loanType) => (
                <CommandItem
                  key={loanType.id}
                  value={String(loanType.id)}
                  onSelect={(currentValue) => {
                    // Lógica mejorada para selección/deselección
                    if (
                      loanTypeSelected &&
                      String(loanTypeSelected.id) === currentValue
                    ) {
                      setLoanTypeSelected(null);
                      setValue("");
                    } else {
                      const selectedLoanType = loanTypes.find(
                        (lt) => String(lt.id) === currentValue
                      );
                      if (selectedLoanType) {
                        setLoanTypeSelected(selectedLoanType);
                        setValue(currentValue);
                      }
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0">
                    <span className="text-xl">
                      {
                        loanTypesData[
                          loanType.name as keyof typeof loanTypesData
                        ]
                      }
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === String(loanType.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
