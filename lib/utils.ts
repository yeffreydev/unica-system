import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { money } from "./currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Monto en la moneda de la asociación. Ver `@/lib/currency`. */
export const formatCurrency = (amount: number) => money(amount);
