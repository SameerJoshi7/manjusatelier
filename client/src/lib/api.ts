const BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  if (!navigator.onLine) {
    throw new ApiError(0, 'You are currently offline. Please check your internet connection.');
  }
  const { body, headers, ...rest } = options;
  
  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE}/api${path}`, {
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeader,
      ...(headers as Record<string, string>),
    } as HeadersInit,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  if (!navigator.onLine) {
    throw new ApiError(0, 'You are currently offline. Please check your internet connection.');
  }
  const token = localStorage.getItem('token');
  const headers = (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit;

  const res = await fetch(`${BASE}/api${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });
  const data = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : null;
  if (!res.ok) throw new ApiError(res.status, data?.message || `Upload failed (${res.status})`);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload,
};
