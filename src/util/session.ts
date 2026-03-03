// Simple session manager: stores session in localStorage with expiry and sessionStorage fallback

const SESSION_KEY = 'betterauthy_session';

export interface Session {
  userId: string;
  login?: string;
  email?: string;
  token?: string;
  expiresAt?: number; // epoch ms
}

export function setSession(session: Session) {
  if (!session.expiresAt) {
    // default: 7 days
    session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  }
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // fallback to sessionStorage
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getSession(): Session | undefined {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const s = JSON.parse(raw) as Session;
    if (s.expiresAt && Date.now() > s.expiresAt) {
      clearSession();
      return undefined;
    }
    return s;
  } catch {
    return undefined;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function getUserId(): string | undefined {
  return getSession()?.userId;
}
