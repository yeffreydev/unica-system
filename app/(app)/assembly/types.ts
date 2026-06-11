import { ILoan } from "@/types/ILoan";
import { IUser } from "@/types/IUser";

// with lowercase for save in literal in db  
export enum ScheduleRunStatusesTypes {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  CANCELLED = 'cancelled',
}

export enum ParticipantStatusTypes {
  REGISTERED = 'registered',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  ATTENDED = 'attended',
  LATE = 'late',
  ABSENT = 'absent',
}
export interface IAssemblyScheduleRun {
    id: string;
    startAt: Date;
    topic: string;
    status: ScheduleRunStatusesTypes;
    endAt: Date;
    place?: string | null;
    participants: IAssemblyParticipant[];
}
export interface IAssemblyParticipant {
    id: string;
    user: IUser;
    status: ParticipantStatusTypes;
    absencesCount?: number;
    consecutiveAbsencesCount?: number;
}
export interface IAssemblySchedule {
    id: string;
    startAt: Date;
    endAt: Date;
    place?: string | null;
    nextRun: Date;
    lastRun: IAssemblyScheduleRun | null;
    lastRuns: Array<IAssemblyScheduleRun>;
}


export interface IPartnerShares extends IUser {
  shares: IUserStock[]; // number of shares owned
  price: number;
}

export interface IUserStock {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanPayment {
  id: string;
  amount: number;
  interest: number | null;
  date: Date;
  userId: string | null;
  description?: string | null;
}

export interface IloanInstallment {
  userId: string;
  id: string;
  amount: number;
  interest: number;
  balance: number;
}

export interface IPaymentData {
  partners: IUser[];
  payments: ILoanPayment[]
  installments: IloanInstallment[];
}
export interface ICreditApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  rejectionReason?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  loan?: ILoan | null;
  scheduleRunId?: string;
  user: IUser;
}

export interface ISavingsDeposit {
  id: string;
  amount: number;
  date: string;
  userId?: string;
  scheduleRunId?: string;
  user?: IUser;
}

export interface ISavingsPayout {
  id: string;
  amount: number;
  description: string;
  date: string;
  userId?: string;
  user?: IUser;
}

export interface ISavingsWithdrawal {
  id: string;
  amount: number;
  description: string;
  date: string;
  userId?: string;
  scheduleRunId?: string;
  user?: IUser;
}

export interface ISavingsPartner extends IUser {
  savingsBalance: number;
  deposits: ISavingsDeposit[];
  payouts: ISavingsPayout[];
  withdrawals: ISavingsWithdrawal[];
}