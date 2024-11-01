import { Member, Expense } from '../types';

const DB_NAME = 'SplitPaymentDB';
const DB_VERSION = 3;

interface PaymentData {
  code: string;
  members: Member[];
  expenses: Expense[];
  createdAt: number;
  lastAccessedAt: number;
}

interface ConsentData {
  deviceId: string;
  consentedAt: number;
}

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('payments')) {
        const paymentStore = db.createObjectStore('payments', { keyPath: 'code' });
        paymentStore.createIndex('createdAt', 'createdAt');
        paymentStore.createIndex('lastAccessedAt', 'lastAccessedAt');
      }

      if (!db.objectStoreNames.contains('consents')) {
        const consentStore = db.createObjectStore('consents', { keyPath: 'deviceId' });
        consentStore.createIndex('consentedAt', 'consentedAt');
      }
    };
  });
}

export async function savePaymentData(
  members: Member[],
  expenses: Expense[],
  existingCode?: string
): Promise<string> {
  const db = await initDB();
  const code = existingCode || generatePaymentCode();
  const now = Date.now();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');

    const paymentData: PaymentData = {
      code,
      members,
      expenses,
      createdAt: now,
      lastAccessedAt: now
    };

    const request = store.put(paymentData);
    
    request.onsuccess = () => resolve(code);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

export async function getPaymentData(code: string): Promise<PaymentData | null> {
  const db = await initDB();
  const now = Date.now();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');
    
    const getRequest = store.get(code);

    getRequest.onsuccess = () => {
      const data = getRequest.result;
      if (data) {
        // Update lastAccessedAt
        data.lastAccessedAt = now;
        store.put(data);
        resolve(data);
      } else {
        resolve(null);
      }
    };
    
    getRequest.onerror = () => reject(getRequest.error);

    transaction.oncomplete = () => db.close();
  });
}

export async function cleanupOldPayments(): Promise<void> {
  const db = await initDB();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');
    const index = store.index('lastAccessedAt');
    const range = IDBKeyRange.upperBound(oneWeekAgo);

    const request = index.openCursor(range);
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function saveConsent(deviceId: string): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['consents'], 'readwrite');
    const store = transaction.objectStore('consents');

    const consent: ConsentData = {
      deviceId,
      consentedAt: Date.now()
    };

    const request = store.put(consent);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

export async function getConsent(deviceId: string): Promise<boolean> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['consents'], 'readonly');
    const store = transaction.objectStore('consents');
    const request = store.get(deviceId);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
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