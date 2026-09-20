/**
 * Dónde está corriendo la app y, por lo tanto, con qué servidor habla.
 *
 * En el navegador es la API en la nube de siempre. Dentro del instalador de
 * escritorio (Tauri) habla con el sidecar en 127.0.0.1: ese proceso tiene su
 * propia base SQLite, hace todos los cálculos sin internet y después
 * sincroniza contra la nube.
 */

/** El instalador expone `__TAURI_INTERNALS__` en la ventana. */
export function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.__TAURI_INTERNALS__ ?? w.__TAURI__);
}

/** Puerto del sidecar; el instalador lo fija al arrancarlo. */
export const LOCAL_API_PORT = process.env.NEXT_PUBLIC_LOCAL_API_PORT || "4100";

export const LOCAL_API_HOST = `http://127.0.0.1:${LOCAL_API_PORT}`;

/** Base URL efectiva de la API para esta ejecución. */
export function resolveApiHost(cloudHost: string | undefined): string {
  return isDesktop() ? LOCAL_API_HOST : (cloudHost ?? "");
}
