const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

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

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, email: string): Promise<ApiUser> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is it running?');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? 'Something went wrong.');
  }

  return data.user as ApiUser;
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
