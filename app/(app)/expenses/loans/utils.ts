// create a method for get color of the loan staus

export enum LoanStatusColor {
  PAID = "bg-green-500",
  PENDING = "bg-orange-400",
}
export enum LoanStatusText {
  PAID = "pagado",
  PENDING = "pendiente",
}

export enum LoanInstallmentStatusColor {
  PAID = "bg-green-100",
}
export const getLoanStatusColor = (status: keyof typeof LoanStatusColor) => {
  return LoanStatusColor[status] || "bg-red-500";
};

export const getLoanStatusText = (status: keyof typeof LoanStatusText) => {
  return LoanStatusText[status] || "desconocido";
};

export const getLoanInstallmentStatusColor = (
  status: keyof typeof LoanInstallmentStatusColor
) => {
  return LoanInstallmentStatusColor[status] || "bg-red-500";
};
