import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { authErrorMessage } from './auth-error';
import { authStorage } from './auth-storage';
import { apiBaseUrl, authOrigin } from './config';

const TOKEN_KEY = 'shitjakos.mobile-session';

export type MobileSession = {
  user: { id: string; name: string; email: string };
};

export type AuthActionResult = {
  ok: boolean;
  error?: string;
  signedIn?: boolean;
  email?: string;
  notice?: string;
  token?: string;
  registrationId?: string;
  session?: MobileSession | null;
};

type SessionState = {
  data: MobileSession | null;
  isPending: boolean;
};

let snapshot: SessionState = { data: null, isPending: true };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function getSnapshot() {
  return snapshot;
}

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function storedToken() {
  return (await authStorage.getItemAsync(TOKEN_KEY)) ?? '';
}

async function saveToken(token?: string) {
  if (token) {
    await authStorage.setItemAsync(TOKEN_KEY, token);
    return;
  }
  await authStorage.deleteItemAsync(TOKEN_KEY);
}

async function mobileAuth(
  action: string,
  body: Record<string, string> = {},
): Promise<AuthActionResult> {
  try {
    const token = await storedToken();
    const response = await fetch(`${apiBaseUrl}/api/mobile/auth/${action}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        ...(Platform.OS === 'web' ? {} : { origin: authOrigin }),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const raw = await response.text();
    let data: AuthActionResult;
    try {
      data = raw ? (JSON.parse(raw) as AuthActionResult) : { ok: false, error: 'Please try again.' };
    } catch {
      return { ok: false, error: 'Could not verify the code. Keep ShitjaKos running on port 3001.' };
    }
    if (data.signedIn) {
      try {
        await saveToken(data.token);
        await refreshSession();
      } catch {
        snapshot = { data: data.session ?? snapshot.data, isPending: false };
        emit();
      }
    }
    return data;
  } catch (cause) {
    return { ok: false, error: authErrorMessage(cause) };
  }
}

export async function refreshSession() {
  const result = await mobileAuth('session');
  snapshot = { data: result.session ?? null, isPending: false };
  emit();
  return snapshot.data;
}

export function signIn(email: string, password: string) {
  return mobileAuth('sign-in', { email, password });
}

export function createAccount(name: string, email: string, password: string) {
  return mobileAuth('sign-up', { name, email, password });
}

export function verifyEmail(
  email: string,
  code: string,
  registrationId: string,
  password = '',
) {
  return mobileAuth('verify-email', { email, code, registrationId, password });
}

export function resendVerificationCode(email: string, registrationId: string) {
  return mobileAuth('resend-code', { email, registrationId });
}

export function requestPasswordReset(email: string) {
  return mobileAuth('forgot-password', { email });
}

export function resetPassword(email: string, code: string, password: string, confirm: string) {
  return mobileAuth('reset-password', { email, code, password, confirm });
}

export async function signOut() {
  await mobileAuth('sign-out');
  await saveToken();
  snapshot = { data: null, isPending: false };
  emit();
}
