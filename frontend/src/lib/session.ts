import * as SecureStore from 'expo-secure-store';

import type { SessionUser } from '@/types';

const SESSION_KEY = 'limo.session';

export async function readSession(): Promise<SessionUser | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
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
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
