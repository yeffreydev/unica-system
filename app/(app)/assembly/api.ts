import apiClient from "@/config/apiClient";
import { IAssemblySchedule, IAssemblyScheduleRun } from "./types";


export const apiGetAssemblySchedule = async () => {
  const response = await apiClient.get<IAssemblySchedule>("/schedules/assembly");
  return response.data;
};

export const apiStartAssemblySchedule = async () => {
    const response = await apiClient.post("/schedules/assembly/start");
    return response;
}

export const apiGetAssemblyRun = async (id: string) => {
  const response = await apiClient.get<IAssemblyScheduleRun>(`/schedules/assembly/run/${id}`);
  return response.data;
}