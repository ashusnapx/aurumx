export interface Transaction {
  id: number;
  creditCardId: number;
  amount: number;
  merchant: string;
  transactionDate: string;
  processed: boolean;
}

export interface GenerateTransactionsRequest {
  creditCardId: number;
}
