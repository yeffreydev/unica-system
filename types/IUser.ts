export interface IUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  // Add other user properties as needed
  dni?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}