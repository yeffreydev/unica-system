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
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between z-50"
        >
          {value
            ? loanTypesData[
                (loanTypes.find((loanType) => String(loanType.id) === value)
                  ?.name as keyof typeof loanTypesData) ?? ""
              ]
            : "Selecciona el Tipo de prestamo ..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-max p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No loan type found.</CommandEmpty>
            <CommandGroup>
              {loanTypes.map((loanType) => (
                <CommandItem
                  key={loanType.id}
                  value={String(loanType.id)}
                  onSelect={(currentValue) => {
                    console.log(currentValue, value);
                    setLoanTypeSelected(
                      loanTypeSelected?.id == value ? null : loanType
                    );
                    setValue(currentValue);
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
                      value === loanType.id ? "opacity-100" : "opacity-0"
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
