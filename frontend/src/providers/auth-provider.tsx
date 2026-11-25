import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createAccount, findAccount } from '@/lib/accounts';
import { clearSession, readSession, writeSession } from '@/lib/session';
import type { SessionUser } from '@/types';
import { isValidEmail } from '@/utils/format';

export type AuthMode = 'signin' | 'signup';

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  authenticate: (email: string, mode: AuthMode) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_DELAY_MS = 550;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const session = await readSession();
        if (active) setUser(session);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restore();
    return () => {
      active = false;
    };
  }, []);

  const authenticate = useCallback(async (email: string, mode: AuthMode) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Enter a valid email address.');
    }

    await wait(AUTH_DELAY_MS);

    const existingAccount = await findAccount(normalizedEmail);

    if (mode === 'signin' && !existingAccount) {
      throw new Error('No account found for this email. Sign up instead.');
    }

    if (mode === 'signup' && existingAccount) {
      throw new Error('This email already has an account. Sign in instead.');
    }

    const account = existingAccount ?? (await createAccount(normalizedEmail));
    const session: SessionUser = { email: account.email, name: account.name };

    await writeSession(session);
    setUser(session);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, authenticate, signOut }),
    [user, isLoading, authenticate, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
