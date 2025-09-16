"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IUser } from "@/types/IUser";

export function ComboBoxUsers({
  users,
  controller: { userSelected, setUserSelected },
}: {
  users: IUser[];
  controller: {
    userSelected: IUser | null;
    setUserSelected: (value: IUser | null) => void;
  };
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          cy-data="open-combobox-users"
          aria-expanded={open}
          className="w-full justify-between z-50"
        >
          {userSelected ? `${userSelected.name} ${userSelected.lastname}` : "Selecciona usuario..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[1000] w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar usuario..." className="h-9" />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup cy-data="combobox-users-group">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.name} ${user.lastname} ${user.dni} ${user.email}`.toLowerCase()}
                  onSelect={() => {
                    // Seleccionar o deseleccionar usando el objeto directo
                    if (userSelected && userSelected.id === user.id) {
                      setUserSelected(null);
                    } else {
                      setUserSelected(user);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0">
                    <span className="text-xl">
                      Socio: {user.name + " " + user.lastname}
                    </span>
                    <span className="text-sm">doc: {user.dni}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      userSelected && userSelected.id === user.id ? "opacity-100" : "opacity-0"
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
