import type { SessionUser } from '@/types';

const SESSION_KEY = 'limo.session';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export async function readSession(): Promise<SessionUser | null> {
  const raw = getStorage()?.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed.email || !parsed.name) return null;
    return { email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}

export async function writeSession(user: SessionUser) {
  getStorage()?.setItem(SESSION_KEY, JSON.stringify(user));
}

export async function clearSession() {
  getStorage()?.removeItem(SESSION_KEY);
}
