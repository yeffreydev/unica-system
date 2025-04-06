export enum LoanTypesEnum {
  FIXED = "FIXED",
  VARIABLE = "VARIABLE",
  REBATE = "REBATE",
  MATURITY = "MATURITY",
}
export const loanTypesData: Record<LoanTypesEnum, string> = {
  FIXED: "Cuota fija",
  VARIABLE: "Cuota variable",
  REBATE: "Cuota al rebatir",
  MATURITY: "Cuota al vencimiento",
};

export const socialFundsData = {
  LEGAL: "Fondo legal",
  SOCIAL: "Fondo social",
};
