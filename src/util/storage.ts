// Minimal IndexedDB helper for user data storage
// Keeps UserData shape compatible with previous Firestore document

export interface UserData {
  email: string;
  keys: Array<{ name: string; secret: string; archived?: boolean }>;
  recentKeys: string[];
  code: string;
  webauthn: Array<any>;
}

const DB_NAME = 'betterauthy_db';
const DB_VERSION = 1;
const STORE_USERS = 'users';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getUserData(userId: string): Promise<UserData | undefined> {
  if (!userId) return undefined;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USERS, 'readonly');
    const store = tx.objectStore(STORE_USERS);
    const req = store.get(userId);
    req.onsuccess = () => {
      const result = req.result;
      resolve(result ? (result.data as UserData) : undefined);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function setUserData(userId: string, data: UserData): Promise<void> {
  if (!userId) throw new Error('userId required');
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USERS, 'readwrite');
    const store = tx.objectStore(STORE_USERS);
    const putReq = store.put({ id: userId, data });
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });
}

export async function updateUserData(userId: string, patch: Partial<UserData>): Promise<void> {
  if (!userId) throw new Error('userId required');
  const existing = await getUserData(userId);
  const merged = Object.assign({}, existing || {}, patch) as UserData;
  await setUserData(userId, merged);
}

export async function deleteUserData(userId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USERS, 'readwrite');
    const store = tx.objectStore(STORE_USERS);
    const req = store.delete(userId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
