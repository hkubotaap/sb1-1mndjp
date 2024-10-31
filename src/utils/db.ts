import { Member, Expense } from '../types';

const DB_NAME = 'SplitPaymentDB';
const DB_VERSION = 1;
const STORE_NAME = 'payments';

interface PaymentData {
  code: string;
  members: Member[];
  expenses: Expense[];
  createdAt: number;
}

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'code' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
  });
}

export async function savePaymentData(members: Member[], expenses: Expense[], existingCode?: string): Promise<string> {
  const db = await initDB();
  const code = existingCode || generatePaymentCode();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const paymentData: PaymentData = {
      code,
      members,
      expenses,
      createdAt: Date.now(),
    };

    const request = existingCode ? store.put(paymentData) : store.add(paymentData);
    request.onsuccess = () => resolve(code);
    request.onerror = () => reject(request.error);
  });
}

export async function getPaymentData(code: string): Promise<PaymentData | null> {
  const db = await initDB();
  const normalizedCode = code.toUpperCase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(normalizedCode);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function generatePaymentCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'WCAN';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}