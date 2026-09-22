import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/components/AuthScreen';
import { PasswordField } from '@/components/PasswordField';
import { authStyles as styles } from '@/constants/authStyles';
import { requestPasswordReset, resetPassword } from '@/lib/auth';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email ?? '').trim().toLowerCase();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    email
      ? `We sent a 6-digit code to ${email}. Check inbox and spam.`
      : 'Enter the 6-digit code from your email.',
  );
  const [busy, setBusy] = useState(false);

  async function onReset() {
    setError('');
    setBusy(true);
    const result = await resetPassword(email, code, password, confirm);
    if (!result.ok) {
      setError(result.error ?? 'Invalid or expired code.');
      setBusy(false);
      return;
    }
    router.replace({ pathname: '/login', params: { reset: '1' } });
    setBusy(false);
  }

  async function onResend() {
    setError('');
    setBusy(true);
    const result = await requestPasswordReset(email);
    if (!result.ok) {
      setError(result.error ?? 'Could not send a new code.');
      setBusy(false);
      return;
    }
    setMessage(`A new code was sent to ${email}. Check inbox and spam.`);
    setCode('');
    setBusy(false);
  }

  return (
    <AuthScreen title="Reset password" subtitle="Enter the code, then choose a new password">
      <Text style={styles.label}>Reset code</Text>
      <TextInput
        value={code}
        onChangeText={(value) => setCode(value.replace(/[^\d]/g, '').slice(0, 6))}
        autoComplete="one-time-code"
        keyboardType="number-pad"
        placeholder="000000"
        placeholderTextColor="#9aa19a"
        textContentType="oneTimeCode"
        maxLength={6}
        style={styles.codeInput}
        editable={!busy}
      />

      <Text style={styles.label}>New password</Text>
      <PasswordField
        value={password}
        onChangeText={setPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!busy}
      />
      <Text style={styles.hint}>At least 12 characters.</Text>

      <Text style={styles.label}>Confirm password</Text>
      <PasswordField
        value={confirm}
        onChangeText={setConfirm}
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!busy}
        onSubmitEditing={onReset}
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
        onPress={onReset}
        disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Update password</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.outlineButton,
          pressed && styles.outlineButtonPressed,
        ]}
        onPress={onResend}
        disabled={busy}>
        <Text style={styles.outlineButtonText}>Resend code</Text>
      </Pressable>

      <Pressable
        style={styles.footerLink}
        disabled={busy}
        onPress={() => router.replace('/login')}>
        <Text style={styles.footerLinkText}>Back to sign in</Text>
      </Pressable>
    </AuthScreen>
  );
}
