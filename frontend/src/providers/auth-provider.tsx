import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, createAccount, findAccount } from '@/lib/accounts';
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

    try {
      const existingAccount = await findAccount(normalizedEmail);

      if (mode === 'signin' && !existingAccount) {
        throw new ApiError(400, 'No account found for this email. Sign up instead.');
      }

      if (mode === 'signup' && existingAccount) {
        throw new ApiError(409, 'This email already has an account. Sign in instead.');
      }

      const account = existingAccount ?? (await createAccount(normalizedEmail));
      const session: SessionUser = { email: account.email, name: account.name };

      await writeSession(session);
      setUser(session);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.warn('[auth] unexpected error', error);
      throw new Error('Something went wrong. Please try again.');
    }
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
