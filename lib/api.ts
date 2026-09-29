import { apiBaseUrl } from '@/lib/config';
import { authStorage } from '@/lib/auth-storage';

const TOKEN_KEY = 'shitjakos.mobile-session';

let memoryToken = '';
let onUnauthorized: (() => void) | null = null;

export function setApiToken(token: string) {
  memoryToken = token;
}

export function currentApiToken() {
  return memoryToken;
}

export async function readApiToken() {
  const token = (await authStorage.getItemAsync(TOKEN_KEY)) ?? '';
  memoryToken = token;
  return token;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function mediaUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await authStorage.getItemAsync(TOKEN_KEY)) ?? '';
  memoryToken = token;
  const headers: Record<string, string> = {};
  new Headers(init.headers).forEach((value, key) => {
    headers[key] = value;
  });
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const isJson = init.body != null && typeof init.body === 'string';
  if (isJson && !isForm && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (isForm) {
    delete headers['Content-Type'];
    delete headers['content-type'];
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (response.status === 401 && token) onUnauthorized?.();

  const raw = await response.text();
  let data: { error?: string; issues?: { message?: string }[] } = {};
  if (raw) {
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      if (!response.ok) throw new ApiError(response.status, 'Serveri nuk u përgjigj si duhet.');
    }
  }
  if (!response.ok) {
    const issue = data.issues?.find((item) => item.message)?.message;
    throw new ApiError(response.status, issue || data.error || 'Kërkesa dështoi.');
  }
  return data as T;
}
