"use client";

import { Input } from "@/components/ui/input";
import { IUser } from "@/types/IUser";

interface Props {
  users: IUser[];
  amounts: Record<string, number>;
  onChange: (userId: string, value: number) => void;
  placeholder?: string;
  unit?: string; // e.g. "S/" or "und."
  step?: string;
  emptyMessage?: string;
}

export function PerUserGrid({
  users,
  amounts,
  onChange,
  placeholder = "0.00",
  unit = "S/",
  step = "0.01",
  emptyMessage,
}: Props) {
  if (users.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
        {emptyMessage ?? "Agrega socios primero para poder asignar montos."}
      </div>
    );
  }

  const total = Object.values(amounts).reduce((acc, v) => acc + (Number(v) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border divide-y">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {u.name} {u.lastname}
              </p>
              <p className="text-xs text-muted-foreground truncate">DNI {u.dni}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">{unit}</span>
              <Input
                type="number"
                step={step}
                min="0"
                placeholder={placeholder}
                value={amounts[u.id] ?? ""}
                onChange={(e) => onChange(u.id, Number(e.target.value) || 0)}
                className="w-32 text-right"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="text-muted-foreground">Total:</span>
        <span className="font-semibold text-foreground">
          {unit} {total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
