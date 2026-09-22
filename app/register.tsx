import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/components/AuthScreen';
import { PasswordField } from '@/components/PasswordField';
import { authStyles as styles } from '@/constants/authStyles';
import { createAccount, resendVerificationCode, verifyEmail } from '@/lib/auth';

const PENDING_PASSWORD_KEY = 'shitjakos-pending-password';

function firstParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return '';
  try {
    return decodeURIComponent(String(raw)).trim();
  } catch {
    return String(raw).trim();
  }
}

function readPendingPassword() {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(PENDING_PASSWORD_KEY) ?? '';
  }
  return '';
}

function storePendingPassword(password: string) {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(PENDING_PASSWORD_KEY, password);
  }
}

function clearPendingPassword() {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(PENDING_PASSWORD_KEY);
  }
}

function goToCodeStep(email: string, registrationId: string) {
  router.replace({
    pathname: '/register',
    params: { email, registration: registrationId },
  });
}

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ email?: string; registration?: string }>();
  const pendingEmail = firstParam(params.email).toLowerCase();
  const registrationId = firstParam(params.registration);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    pendingEmail ? `We sent a 6-digit code to ${pendingEmail}. Check inbox and spam.` : '',
  );
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function onCreateAccount() {
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setBusy(true);
    const result = await createAccount(name, email, password);
    const nextEmail = result.email ?? email.trim().toLowerCase();
    if (result.ok && result.registrationId) {
      storePendingPassword(password);
      setCode('');
      setBusy(false);
      inFlight.current = false;
      goToCodeStep(nextEmail, result.registrationId);
      return;
    }
    setError(result.error ?? 'Please try again.');
    setBusy(false);
    inFlight.current = false;
  }

  async function onVerify() {
    setError('');
    setBusy(true);
    const result = await verifyEmail(
      pendingEmail,
      code,
      registrationId,
      password || readPendingPassword(),
    );
    if (!result.ok) {
      setError(result.error ?? 'Invalid or expired code.');
      setBusy(false);
      return;
    }
    clearPendingPassword();
    setBusy(false);
    if (result.signedIn) {
      router.replace('/');
      return;
    }
    if (result.notice) {
      setMessage(result.notice);
    }
  }

  async function onResendVerification() {
    setError('');
    setBusy(true);
    const result = await resendVerificationCode(pendingEmail, registrationId);
    if (!result.ok) {
      setError(result.error ?? 'Could not send the code. Please try again.');
      setBusy(false);
      return;
    }
    setCode('');
    setMessage(result.notice ?? '');
    setBusy(false);
  }

  if (pendingEmail && registrationId) {
    return (
      <AuthScreen title="Verify your email" subtitle="Enter the 6-digit code we sent you">
        <Text style={styles.label}>Verification code</Text>
        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/[^\d]/g, '').slice(0, 6))}
          autoComplete="one-time-code"
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor="#9aa19a"
          textContentType="oneTimeCode"
          maxLength={6}
          autoFocus
          style={styles.codeInput}
          editable={!busy}
          onSubmitEditing={onVerify}
        />

        {message ? (
          <Text role="status" style={styles.notice}>
            {message}
          </Text>
        ) : null}
        {error ? (
          <Text role="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            (busy || pressed) && styles.primaryButtonPressed,
          ]}
          onPress={onVerify}
          disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Verify and continue</Text>
          )}
        </Pressable>

        <Pressable style={styles.forgotLink} onPress={onResendVerification} disabled={busy}>
          <Text style={styles.forgotLinkText}>Resend code</Text>
        </Pressable>

        <Pressable
          style={styles.footerLink}
          disabled={busy}
          onPress={() => router.replace('/register')}>
          <Text style={styles.footerLinkText}>Back to create account</Text>
        </Pressable>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Create your account" subtitle="Then enter the verification code from your email">
      <Text style={styles.label}>Your name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        autoComplete="name"
        autoCapitalize="words"
        placeholder="Your name"
        placeholderTextColor="#9aa19a"
        textContentType="name"
        style={styles.input}
        editable={!busy}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor="#9aa19a"
        textContentType="emailAddress"
        style={styles.input}
        editable={!busy}
      />

      <Text style={styles.label}>Password</Text>
      <PasswordField
        value={password}
        onChangeText={setPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!busy}
        onSubmitEditing={onCreateAccount}
      />
      <Text style={styles.hint}>At least 12 characters.</Text>

      {error ? (
        <Text role="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          (busy || pressed) && styles.primaryButtonPressed,
        ]}
        onPress={onCreateAccount}
        disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Create account</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Link href="/login" asChild>
          <Pressable disabled={busy}>
            <Text style={styles.footerLinkText}>Already have an account? Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}
