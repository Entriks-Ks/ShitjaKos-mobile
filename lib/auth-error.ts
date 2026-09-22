import { apiBaseUrl } from './config';

export function authErrorMessage(cause: unknown) {
  const detail = cause instanceof Error ? cause.message : 'Network request failed';
  if (/failed to fetch|network request failed|load failed/i.test(detail)) {
    return `Could not reach ShitjaKos at ${apiBaseUrl}. Keep the web app running on port 3001.`;
  }
  return detail;
}

export function resultError(error: { message?: string | null } | null | undefined, fallback: string) {
  return error?.message ?? fallback;
}
