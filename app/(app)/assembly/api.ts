import apiClient from "@/config/apiClient";
import { IAssemblySchedule, IAssemblyScheduleRun } from "./types";
import { OtherIncomesTags } from "@/constants";


export const apiGetAssemblySchedule = async () => {
  const response = await apiClient.get<IAssemblySchedule>("/schedules/assembly");
  return response.data;
};

export const apiStartAssemblySchedule = async () => {
    const response = await apiClient.post("/schedules/assembly/start");
    return response;
}

export const apiFinishAssembly = async (scheduleRunId: string) => {
    const response = await apiClient.post(`/schedules/assembly/run/${scheduleRunId}/finish`);
    return response.data;
}

export const apiGetAssemblyRun = async (id: string) => {
  const response = await apiClient.get<IAssemblyScheduleRun>(`/schedules/assembly/run/${id}`);
  return response.data;
}
export const apiUpdateParticipantStatusInAssemblyRun = async (participantId: string, status: string) => {
    const response = await apiClient.patch(`/schedules/assembly/run/attendance/${participantId}`, { status });
    return response.data as { count: number };
}

export const apiGetPartnersWithShares = async (runId: string) => {
    const response = await apiClient.get(`/schedules/assembly/run/${runId}/partners-shares`);
    return response.data;
}

export const apiBuySharesInAssembly = async (runId: string, data: { userId: string; shares: number; date: Date; }) => {
    const response = await apiClient.post(`/schedules/assembly/run/${runId}/buy-shares`, data);
    return response.data;
}

//payments

export const apiGetPaymentsData = async(runId: string) => {
    const response = await apiClient.get(`/schedules/assembly/run/${runId}/payments-data`);
    return response.data;
}

export const apiRecordPayment = async(runId: string, data: { userId: string; amount: number; interest: number; date: Date; description?: string; installmentId?: string; }) => {
    const response = await apiClient.post(`/schedules/assembly/run/${runId}/record-payment`, data);
    return response.data;
}


//credit applications
export const apiCreateCreditApplication = async(data: { userId: string; amount: number; purpose: string;scheduleRunId:string }) => {
    const response = await apiClient.post(`/schedules/assembly/run/credit-application`, data);
    return response.data;
}

export const apiGetCreditApplicationsWithLoans = async(runId: string) => {
    const response = await apiClient.get(`/schedules/assembly/run/${runId}/credit-applications`);
    return response.data;
}

export const apiDeleteCreditApplication = async(id: string) => {
    const response = await apiClient.delete(`/schedules/assembly/run/credit-application/${id}`);
    return response.data;
}

export const apiApproveCreditApplication = async(id: string, data: {
    userId: string;
    amount: number;
    interestRate: number;
    initalInstallments: number;
    loanTypeId: string;
    date: Date;
    paymentFrecuency: string;
}) => {
    const response = await apiClient.post(`/schedules/assembly/run/credit-application/${id}/approve`, data);
    return response.data;
}

export const apiRejectCreditApplication = async(id: string, data: { confirm: boolean; reason?: string }) => {
    const response = await apiClient.post(`/schedules/assembly/run/credit-application/${id}/reject`, data);
    return response.data;
}


//pay late or absence fees
export const apiCreateOtherIncomesTransaction = async(data: { userId?: string; description: string; amount: number; date: Date; scheduleRunId?: string; tag?: OtherIncomesTags; }) => {
    const response = await apiClient.post(`/incomes/others/create-transaction`, data);
    return response.data;
}
export const apiGetOtherIncomesByScheduleRun = async(runId: string) => {
    const response = await apiClient.get(`/schedules/assembly/run/${runId}/other-incomes`);
    return response.data;
  }


export const apiDeleteOtherIncomesTransactionAssembly = async (transactionId: string) => {
  const response = await apiClient.delete(`/incomes/others/${transactionId}`);
  return response.data;
};

export const apiAddParticipantToAssemblyRun = async (data: { userId: string; scheduleRunId: string }) => {
  const response = await apiClient.post('/schedules/assembly/run/add-participant', data);
  return response.data;
};

export const apiRemoveParticipantFromAssemblyRun = async (participantId: string) => {
  const response = await apiClient.delete(`/schedules/assembly/run/remove-participant/${participantId}`);
  return response.data;
};

export const apiUpdateParticipantInAssemblyRun = async (scheduleRunId: string, data: { userId: string; action: 'add' | 'remove' }) => {
  const response = await apiClient.patch(`/schedules/assembly/run/${scheduleRunId}/participants`, data);
  return response.data;
};

// savings (ahorristas)
export const apiGetSavingsData = async (runId: string) => {
  const response = await apiClient.get(`/schedules/assembly/run/${runId}/savings-data`);
  return response.data;
};

export const apiRecordSaving = async (runId: string, data: { userId: string; amount: number; date: Date; }) => {
  const response = await apiClient.post(`/schedules/assembly/run/${runId}/record-saving`, data);
  return response.data;
};

export const apiRecordInterestPayment = async (runId: string, data: { userId: string; amount: number; description?: string; date: Date; }) => {
  const response = await apiClient.post(`/schedules/assembly/run/${runId}/record-interest-payment`, data);
  return response.data;
};

export const apiRecordWithdrawal = async (runId: string, data: { userId: string; amount: number; description?: string; date: Date; }) => {
  const response = await apiClient.post(`/schedules/assembly/run/${runId}/record-withdrawal`, data);
  return response.data;
};

// acta summary
export const apiGetAssemblyActaSummary = async (runId: string) => {
  const response = await apiClient.get(`/schedules/assembly/run/${runId}/acta-summary`);
  return response.data;
};

// list all assembly runs (con su acta y estado de confirmación)
export const apiListAssemblyRuns = async () => {
  const response = await apiClient.get(`/schedules/assembly/runs`);
  return response.data as Array<{
    id: string;
    topic: string;
    description?: string;
    startAt: string;
    endAt: string | null;
    status: string;
    acta: null | {
      id: string;
      generatedAt: string;
      confirmed: boolean;
      confirmedAt: string | null;
      confirmedBy: string | null;
    };
    participants: Array<{ id: string; status: string }>;
  }>;
};

export const apiGetActaByRun = async (runId: string) => {
  const response = await apiClient.get(`/schedules/assembly/run/${runId}/acta`);
  return response.data;
};

export const apiSetActaConfirmation = async (runId: string, data: { confirmed: boolean; confirmedBy?: string }) => {
  const response = await apiClient.post(`/schedules/assembly/run/${runId}/acta/confirm`, data);
  return response.data;
};

export const apiRescheduleAssemblyRun = async (runId: string, date: Date) => {
  const response = await apiClient.patch(`/schedules/assembly/run/${runId}/reschedule`, { date: date.toISOString() });
  return response.data;
};

export const apiRescheduleNextAssembly = async (date: Date) => {
  const response = await apiClient.patch(`/schedules/assembly/reschedule-next`, { date: date.toISOString() });
  return response.data;
};

// fines config
export interface IFinesConfig {
  lateFineAmount: number;
  absenceFineAmount: number;
  consecutiveAbsencesLimit: number;
  consecutiveAbsencesFine: number;
}
export const apiGetFinesConfig = async () => {
  const response = await apiClient.get<IFinesConfig>(`/settings/fines`);
  return response.data;
};