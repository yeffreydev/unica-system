"use client";

import { Input } from "@/components/ui/input";

interface Props {
  value: number;
  onChange: (n: number) => void;
  label: string;
  hint?: string;
}

export function SingleAmountCard({ value, onChange, label, hint }: Props) {
  return (
    <div className="rounded-lg border border-border p-5 max-w-md">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-sm font-medium text-muted-foreground">S/</span>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="text-right"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}
