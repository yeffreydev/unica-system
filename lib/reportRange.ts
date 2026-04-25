export const monthsEs = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const monthShort = (yyyymm: string) => {
  const [y, m] = yyyymm.split("-").map(Number);
  return `${monthsEs[m - 1].slice(0, 3)} ${String(y).slice(2)}`;
};

export const monthFull = (yyyymm: string) => {
  const [y, m] = yyyymm.split("-").map(Number);
  return `${monthsEs[m - 1]} ${y}`;
};

export const generateMonthOptions = (startYear = 2024) => {
  const opts: { value: string; label: string }[] = [];
  const now = new Date();
  for (let y = startYear; y <= now.getFullYear(); y++) {
    const endM = y === now.getFullYear() ? now.getMonth() : 11;
    for (let m = 0; m <= endM; m++) {
      const mm = String(m + 1).padStart(2, "0");
      opts.push({ value: `${y}-${mm}`, label: `${monthsEs[m]} ${y}` });
    }
  }
  return opts;
};

export const defaultRange = () => {
  const now = new Date();
  const endY = now.getFullYear();
  const endM = now.getMonth();
  const startD = new Date(endY, endM - 11, 1);
  const startVal = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, "0")}`;
  const endVal = `${endY}-${String(endM + 1).padStart(2, "0")}`;
  return { startVal, endVal };
};

export const monthValToISO = (val: string, end = false) => {
  const [y, m] = val.split("-").map(Number);
  if (end) return new Date(y, m, 0, 23, 59, 59, 999).toISOString();
  return new Date(y, m - 1, 1, 0, 0, 0, 0).toISOString();
};

export const fmtCurrency = (n: number) =>
  `S/. ${(n ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const rangeLabel = (start: string, end: string) =>
  start === end ? monthFull(start) : `${monthFull(start)} - ${monthFull(end)}`;
