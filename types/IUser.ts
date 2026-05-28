export interface IUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone?: string;
  // Add other user properties as needed
  dni?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const isActiveUser = (user: { deletedAt?: string | null; dni?: string; name?: string }) =>
  !user?.deletedAt && !user?.dni?.startsWith("DELETED-") && user?.name !== "[Usuario Eliminado]";