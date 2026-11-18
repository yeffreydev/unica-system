"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_LIST, currencyFlag } from "@/lib/currency";

interface Props {
  /** Código ISO 4217 seleccionado, ej. "PEN". */
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** Selector con las mismas monedas que la app móvil. */
export function CurrencySelect({ value, onChange, disabled, id, className }: Props) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className={className} aria-label="Moneda">
        <SelectValue placeholder="Selecciona la moneda" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_LIST.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-2">
              <span aria-hidden>{currencyFlag(c)}</span>
              <span>{c.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {c.code} · {c.symbol}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
