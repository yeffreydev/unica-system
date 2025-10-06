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
export enum OtherIncomesTags {
  FINE = 'FINE', //multa
  LATE = 'LATE_FEE', //tardanza
  ABSENCE = 'ABSENCE_FEE', //falta
  DONATION = 'DONATION', //donacion
  UNCLASSIFIED = 'UNCLASSIFIED', //sin clasificar
}

export const ParticipantStatus =  {'registered': 'Registrado', 'confirmed': 'Confirmado', 'declined': 'Rechazado', 'attended': 'Asistió', 'late': 'Tarde', 'absent': 'Ausente'};
