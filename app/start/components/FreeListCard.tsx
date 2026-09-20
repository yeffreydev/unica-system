"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FreeMoneyEntry } from "../types";

interface Props {
  items: FreeMoneyEntry[];
  onChange: (items: FreeMoneyEntry[]) => void;
  descriptionPlaceholder?: string;
  addLabel?: string;
}

export function FreeListCard({
  items,
  onChange,
  descriptionPlaceholder = "Descripción",
  addLabel = "Agregar",
}: Props) {
  const update = (idx: number, patch: Partial<FreeMoneyEntry>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const add = () =>
    onChange([
      ...items,
      { id: crypto.randomUUID(), amount: 0, description: "", userId: null },
    ]);

  const total = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
            Aún no has agregado entradas. Pulsa &laquo;{addLabel}&raquo; para empezar.
          </div>
        ) : (
          items.map((it, idx) => (
            <div
              key={it.id}
              className="flex items-center gap-2 rounded-lg border border-border p-3"
            >
              <Input
                placeholder={descriptionPlaceholder}
                value={it.description}
                onChange={(e) => update(idx, { description: e.target.value })}
                className="flex-1"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-medium text-muted-foreground">S/</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={it.amount || ""}
                  onChange={(e) => update(idx, { amount: Number(e.target.value) || 0 })}
                  className="w-32 text-right"
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => remove(idx)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> {addLabel}
        </Button>
        <div className="text-sm">
          <span className="text-muted-foreground">Total:</span>{" "}
          <span className="font-semibold text-foreground">
            S/ {total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
