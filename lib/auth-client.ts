import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { Platform } from 'react-native';

import { authStorage } from './auth-storage';
import { authOrigin, getApiBaseUrl } from './config';

function resolveBaseURL() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return getApiBaseUrl();
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
  fetchOptions:
    Platform.OS === 'web'
      ? { credentials: 'include' as const }
      : {
          headers: {
            origin: authOrigin,
          },
        },
  plugins: [
    expoClient({
      scheme: 'shitjakosmobile',
      storagePrefix: 'shitjakos',
      storage: authStorage,
    }),
    emailOTPClient(),
  ],
});
