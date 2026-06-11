import apiClient from "@/config/apiClient";
import { IOrgRole } from "@/types/IUser";

// Cargos organizativos (Presidente, Secretario, Tesorero, etc.) por única.
export const apiGetOrgRoles = async (): Promise<IOrgRole[]> => {
  const res = await apiClient.get("/org-roles");
  return Array.isArray(res.data) ? res.data : [];
};

export const apiCreateOrgRole = async (name: string): Promise<IOrgRole> => {
  const res = await apiClient.post("/org-roles", { name });
  return res.data;
};

export const apiUpdateOrgRole = async (
  id: string,
  name: string,
): Promise<IOrgRole> => {
  const res = await apiClient.put(`/org-roles/${id}`, { name });
  return res.data;
};

export const apiDeleteOrgRole = async (id: string): Promise<void> => {
  await apiClient.delete(`/org-roles/${id}`);
};
