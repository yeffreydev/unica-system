export interface ISocialFunds {
  id: number;
  name: string;
}

export interface ISocialFundsTransaction {
  id: number;
  socialFundsId: number;
  amount: number;
  description: string;
  date: Date;
  userId: number;
  socialFunds: ISocialFunds;
}
