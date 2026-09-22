import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';

import { AuthScreen } from '@/components/AuthScreen';
import { authStyles as styles } from '@/constants/authStyles';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSendCode() {
    setError('');
    setBusy(true);
    const result = await requestPasswordReset(email);
    if (!result.ok) {
      setError(result.error ?? 'Could not send the code. Please try again.');
      setBusy(false);
      return;
    }
    router.push({ pathname: '/reset', params: { email: result.email ?? email.trim().toLowerCase() } });
    setBusy(false);
  }

  return (
    <AuthScreen title="Forgot password" subtitle="We will send a 6-digit code to reset it">
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
        onSubmitEditing={onSendCode}
      />

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
        onPress={onSendCode}
        disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Send reset code</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Link href="/login" asChild>
          <Pressable disabled={busy}>
            <Text style={styles.footerLinkText}>Back to sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}
