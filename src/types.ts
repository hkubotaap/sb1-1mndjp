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
  splitType: 'equal' | 'multiply'; // equal: 均等割り (タクシーなど), multiply: 人数分 (チケットなど)
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export type RoundingMethod = 'floor' | 'ceil' | 'round';