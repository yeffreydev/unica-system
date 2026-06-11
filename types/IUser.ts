export interface IOrgRole {
  id: string;
  name: string;
  isDefault?: boolean;
  // número de socios asignados (incluido por el backend en el listado)
  _count?: { users: number };
}

export interface IUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone?: string;
  // Add other user properties as needed
  dni?: string;
  role?: string;
  // cargo organizativo (Presidente, Secretario, etc.) — no es rol de sistema
  orgRoleId?: string | null;
  orgRole?: Pick<IOrgRole, "id" | "name" | "isDefault"> | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const isActiveUser = (user: { deletedAt?: string | null; dni?: string; name?: string }) =>
  !user?.deletedAt && !user?.dni?.startsWith("DELETED-") && user?.name !== "[Usuario Eliminado]";