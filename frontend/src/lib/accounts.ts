import { API_URL } from '@/lib/api';

export type StoredAccount = {
  email: string;
  name: string;
  createdAt: number;
};

type ApiUser = {
  id: string;
  username: string;
  email: string;
};

type ApiBody = {
  error?: string;
  user?: ApiUser;
};

const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, email: string): Promise<ApiUser> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });
  } catch (error) {
    if (__DEV__) console.warn(`[api] ${path} request failed (${API_URL})`, error);
    throw new ApiError(0, "We couldn't connect. Check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }

  const data = (await response.json().catch(() => null)) as ApiBody | null;

  if (!response.ok) {
    if (response.status >= 500) {
      if (__DEV__) console.warn(`[api] ${path} server error`, response.status, data);
      throw new ApiError(response.status, 'Something went wrong on our end. Please try again.');
    }
    throw new ApiError(response.status, data?.error ?? 'Something went wrong. Please try again.');
  }

  if (!data?.user) {
    if (__DEV__) console.warn(`[api] ${path} unexpected response`, response.status, data);
    throw new ApiError(response.status, 'Something went wrong. Please try again.');
  }

  return data.user;
}

function toAccount(user: ApiUser): StoredAccount {
  return {
    email: user.email,
    name: user.username,
    createdAt: Date.now(),
  };
}

export async function findAccount(email: string) {
  try {
    const user = await request('/auth/signin', email);
    return toAccount(user);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function createAccount(email: string): Promise<StoredAccount> {
  const user = await request('/auth/signup', email);
  return toAccount(user);
}
