import { IUser } from "@/types/IUser";

export interface IAssemblyScheduleRun {
    id: string;
    startAt: Date;
    topic: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    endAt: Date;
    participants: IAssemblyParticipant[];
}
export interface IAssemblyParticipant {
    id: string;
    user: IUser;
    status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'REGISTERED' | 'MISSED' | 'PRESENT' | 'ABSENT' | 'LATE';
}
export interface IAssemblySchedule {
    id: string;
    startAt: Date;
    endAt: Date;
    nextRun: Date;
    lastRun: IAssemblyScheduleRun | null;
    lastRuns: Array<IAssemblyScheduleRun>;
}