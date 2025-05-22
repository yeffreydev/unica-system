import { loanTypesData, LoanTypesEnum } from "@/constants";
export interface InstallmentInterface {
  id: number;
  payment: number;
  interest: number;
  date: Date;
  balance: number;
  paid?: boolean;
  status?: string;
}
function calculateFixedInstallments(
  loanAmount: number,
  interestRate: number,
  startDate: Date,
  initialInstallments: number
) {
  const installmentsArray: InstallmentInterface[] = [];
  let remainingBalance = loanAmount;

  for (let i = 0; i < initialInstallments; i++) {
    const installmentAmount = loanAmount / initialInstallments;
    const interest = loanAmount * interestRate;
    const date = new Date(startDate);
    remainingBalance -= installmentAmount;
    date.setMonth(date.getMonth() + i);
    installmentsArray.push({
      id: i,
      payment: installmentAmount,
      interest,
      balance: remainingBalance,
      date,
    });
  }

  return installmentsArray;
}

function calculateVariableInstallments(
  loanAmount: number,
  interestRate: number,
  startDate: Date,
  initialInstallments: number
) {
  const installmentsArray: InstallmentInterface[] = [];
  let remainingBalance = loanAmount;

  for (let i = 0; i < initialInstallments; i++) {
    const installmentAmount = loanAmount / initialInstallments;
    const interest = remainingBalance * interestRate;
    const date = new Date(startDate);
    remainingBalance -= installmentAmount;
    date.setMonth(date.getMonth() + i);
    installmentsArray.push({
      id: i,
      payment: installmentAmount,
      interest,
      balance: remainingBalance,
      date,
    });
  }

  return installmentsArray;
}

function calculateRebateInstallments(
  loanAmount: number,
  interestRate: number,
  startDate: Date,
  initialInstallments: number
) {
  const installmentsArray: InstallmentInterface[] = [];
  let remainingBalance = loanAmount;

  for (let i = 0; i < initialInstallments; i++) {
    const installmentAmount = loanAmount / initialInstallments;
    const interest = remainingBalance * interestRate;
    const date = new Date(startDate);
    remainingBalance -= installmentAmount;
    date.setMonth(date.getMonth() + i);
    installmentsArray.push({
      id: i,
      payment: installmentAmount,
      interest,
      balance: remainingBalance,
      date,
    });
  }

  return installmentsArray;
}

function calculateMaturityInstallments(
  loanAmount: number,
  interestRate: number,
  startDate: Date,
  initialInstallments: number
) {
  const installmentsArray: InstallmentInterface[] = [];
  const totalInstallments = initialInstallments;
  const interest = loanAmount * interestRate;

  for (let i = 0; i < totalInstallments; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);

    if (i === totalInstallments - 1) {
      installmentsArray.push({
        id: i,
        payment: loanAmount,
        balance: 0,
        interest,
        date,
      });
    } else {
      installmentsArray.push({
        id: i,
        payment: 0,
        balance: loanAmount,
        interest,
        date,
      });
    }
  }

  return installmentsArray;
}

export function calculateInstallments(
  loanType: keyof typeof loanTypesData,
  loanAmount: number,
  interestRate: number,
  initialInstallments: number,
  startDate: Date
) {
  if (loanType === LoanTypesEnum.FIXED) {
    return calculateFixedInstallments(
      loanAmount,
      interestRate,
      startDate,
      initialInstallments
    );
  }
  if (loanType === LoanTypesEnum.VARIABLE) {
    return calculateVariableInstallments(
      loanAmount,
      interestRate,
      startDate,
      initialInstallments
    );
  }
  if (loanType === LoanTypesEnum.REBATE) {
    return calculateRebateInstallments(
      loanAmount,
      interestRate,
      startDate,
      initialInstallments
    );
  }
  if (loanType === LoanTypesEnum.MATURITY) {
    return calculateMaturityInstallments(
      loanAmount,
      interestRate,
      startDate,
      initialInstallments
    );
  }

  return [];
}
