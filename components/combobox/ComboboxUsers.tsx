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
  const [value, setValue] = React.useState("");
  const [search, setSearch] = React.useState("");

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
            ? users.find((user) => String(user.id) === value)?.name
            : "Select user..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-max p-0">
        <Command>
          <CommandInput
            value=""
            placeholder="Search user..."
            className="h-9"
            onValueChange={setSearch}
            accessKey=""
          />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={String(user.id)}
                  onSelect={(currentValue) => {
                    console.log(currentValue, value);
                    setUserSelected(userSelected?.id == value ? null : user);
                    setValue(currentValue);
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
                      value === user.id ? "opacity-100" : "opacity-0"
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
