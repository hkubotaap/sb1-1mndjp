export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  date: string;
  payerId: string;
  amount: number;
  beneficiaryIds: string[];
  splitType: 'equal' | 'multiply';
  note?: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  isRoundingAdjustment?: boolean;
}

export type RoundingMethod = 'floor' | 'ceil' | 'round';

export interface PaymentData {
  code: string;
  members: Member[];
  expenses: Expense[];
  createdAt: number;
  lastAccessedAt: number;
  deletedAt?: number;
}

export interface ConsentData {
  deviceId: string;
  consentedAt: number;
}

export interface DatabaseSchema {
  payments: PaymentData;
  consents: ConsentData;
}