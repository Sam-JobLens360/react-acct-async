export interface BankTransaction {
  id: string;
  date: string;
  transactionType: string;
  amount: number;
  description: string;
  linkedId: string | null;
  raw: Record<string, unknown>;
}

export interface AccountingTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  notes: string;
  linkedId: string | null;
  raw: Record<string, unknown>;
}

export type FilterMode = 'all' | 'linked' | 'unlinked';

export interface AppState {
  bankTransactions: BankTransaction[];
  accountingTransactions: AccountingTransaction[];
  selectedBankId: string | null;
  selectedAccountingId: string | null;
}

export interface MismatchWarning {
  amountMismatch: boolean;
  dateMismatch: boolean;
  bankAmount: number;
  accountingAmount: number;
  bankDate: string;
  accountingDate: string;
}

export interface PossibleMatch {
  bankId: string;
  accountingId: string;
  score: number;
}
