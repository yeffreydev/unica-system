export interface IUser {
  id: string;
  dni: string;
  email: string;
  name: string;
  lastname: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}
