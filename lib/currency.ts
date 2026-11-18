/**
 * Monedas soportadas (ISO 4217). Misma lista que la app móvil
 * (`lib/utils/currency.dart` en an-mobile-app) y que los servidores
 * (`src/common/currency.ts` en an-server y an-app-server): si se agrega una
 * aquí, agregarla allá también.
 */
export interface CurrencyInfo {
  /** ISO 4217, ej. "PEN". */
  code: string;
  /** Símbolo que se muestra antes del monto, ej. "S/". */
  symbol: string;
  name: string;
  country: string;
  /** ISO 3166-1 alpha-2 del país, para la bandera. */
  iso: string;
  /** Decimales que se muestran (CLP no usa centavos). */
  decimals: number;
  thousands: string;
  decimal: string;
  /**
   * Símbolo para PDF: las fuentes estándar de jsPDF solo traen Latin-1, así
   * que un símbolo fuera de ese rango (₡) saldría como basura.
   */
  pdfSymbol?: string;
}

export const DEFAULT_CURRENCY = "PEN";

export const CURRENCIES: Record<string, CurrencyInfo> = {
  PEN: { code: "PEN", symbol: "S/", name: "Sol peruano", country: "Perú", iso: "PE", decimals: 2, thousands: ",", decimal: "." },
  USD: { code: "USD", symbol: "$", name: "Dólar estadounidense", country: "Estados Unidos", iso: "US", decimals: 2, thousands: ",", decimal: "." },
  BRL: { code: "BRL", symbol: "R$", name: "Real brasileño", country: "Brasil", iso: "BR", decimals: 2, thousands: ".", decimal: "," },
  MXN: { code: "MXN", symbol: "$", name: "Peso mexicano", country: "México", iso: "MX", decimals: 2, thousands: ",", decimal: "." },
  CLP: { code: "CLP", symbol: "$", name: "Peso chileno", country: "Chile", iso: "CL", decimals: 0, thousands: ".", decimal: "," },
  ARS: { code: "ARS", symbol: "$", name: "Peso argentino", country: "Argentina", iso: "AR", decimals: 2, thousands: ".", decimal: "," },
  CRC: { code: "CRC", symbol: "₡", name: "Colón costarricense", country: "Costa Rica", iso: "CR", decimals: 2, thousands: ".", decimal: ",", pdfSymbol: "CRC" },
};

export const CURRENCY_LIST: CurrencyInfo[] = Object.values(CURRENCIES);

/** Normaliza a mayúsculas; null si no es una moneda soportada. */
export function normalizeCurrency(code?: string | null): string | null {
  const c = (code || "").trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(CURRENCIES, c) ? c : null;
}

/** Moneda soportada o la de por defecto. */
export function currencyInfo(code?: string | null): CurrencyInfo {
  return CURRENCIES[normalizeCurrency(code) ?? DEFAULT_CURRENCY];
}

/** Bandera como emoji a partir del ISO del país (sin assets). */
export function currencyFlag(c: CurrencyInfo): string {
  return String.fromCodePoint(
    ...c.iso.toUpperCase().split("").map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}

// ---------------------------------------------------------------------------
// Moneda actual
//
// La moneda es de la asociación, no del usuario. `TenantProvider` la fija al
// resolver el dominio —antes de pintar cualquier pantalla— y las pantallas
// solo llaman a `money()`. Los componentes que deben reaccionar a un cambio
// en vivo (el selector de Configuración, el onboarding) usan `useCurrency()`.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "tenant-currency";

function readStored(): CurrencyInfo {
  try {
    if (typeof window !== "undefined") {
      return currencyInfo(window.localStorage.getItem(STORAGE_KEY));
    }
  } catch {
    /* sin acceso a localStorage */
  }
  return CURRENCIES[DEFAULT_CURRENCY];
}

let current: CurrencyInfo = readStored();

export function getCurrency(): CurrencyInfo {
  return current;
}

export function setCurrentCurrency(code?: string | null): CurrencyInfo {
  current = currencyInfo(code);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, current.code);
    }
  } catch {
    /* sin acceso a localStorage */
  }
  return current;
}

/** Símbolo de la moneda actual, ej. "S/". */
export function currencySymbol(): string {
  return current.symbol;
}

export interface MoneyOptions {
  /** Fuerza la cantidad de decimales (por defecto, los de la moneda). */
  decimals?: number;
  /** Usa el símbolo seguro para PDF (jsPDF no dibuja ₡). */
  pdf?: boolean;
  /** Moneda distinta de la actual. */
  currency?: string | null;
}

/** 1250.5 -> "1,250.50" (PEN) · "1.250,50" (BRL) · "1.251" (CLP). Sin símbolo. */
export function formatAmount(value: number | string | null | undefined, opts: MoneyOptions = {}): string {
  const c = opts.currency ? currencyInfo(opts.currency) : current;
  const n = Number(value ?? 0);
  const v = Number.isFinite(n) ? n : 0;
  const d = opts.decimals ?? c.decimals;
  const [int, frac] = Math.abs(v).toFixed(d).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, c.thousands);
  const body = frac ? `${grouped}${c.decimal}${frac}` : grouped;
  // Evita "-0.00" cuando el valor redondea a cero.
  const neg = v < 0 && Number(Math.abs(v).toFixed(d)) !== 0;
  return `${neg ? "-" : ""}${body}`;
}

/** 1250.5 -> "S/ 1,250.50" (PEN) · "R$ 1.250,50" (BRL) · "$ 1.251" (CLP). */
export function money(value: number | string | null | undefined, opts: MoneyOptions = {}): string {
  const c = opts.currency ? currencyInfo(opts.currency) : current;
  const body = formatAmount(value, opts);
  const symbol = opts.pdf ? c.pdfSymbol ?? c.symbol : c.symbol;
  return body.startsWith("-") ? `-${symbol} ${body.slice(1)}` : `${symbol} ${body}`;
}

/** Monto abreviado para ejes de gráficos: 12500 -> "S/ 12.5k", 800 -> "S/ 800". */
export function moneyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const short = (n: number) => String(+n.toFixed(1)).replace(".", current.decimal);
  if (abs >= 1_000_000) return `${sign}${current.symbol} ${short(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}${current.symbol} ${short(abs / 1_000)}k`;
  return `${sign}${current.symbol} ${Math.round(abs)}`;
}
