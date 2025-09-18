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
    participants: IAssemblyParticipant[];
}
export interface IAssemblyParticipant {
    id: string;
    user: IUser;
    status: ParticipantStatusTypes;
}
export interface IAssemblySchedule {
    id: string;
    startAt: Date;
    endAt: Date;
    nextRun: Date;
    lastRun: IAssemblyScheduleRun | null;
    lastRuns: Array<IAssemblyScheduleRun>;
}