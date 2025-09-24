export interface ISocialFunds {
  id: string;
  name: string;
}

export interface ISocialFundsTransaction {
  id: string;
  socialFundsId: string;
  amount: number;
  description: string;
  date: Date;
  userId?: string;
  socialFunds: ISocialFunds;
  user?: {
    id: string;
    name: string;
    lastname: string;
  };
}
