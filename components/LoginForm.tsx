import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';

import { PasswordField } from '@/components/PasswordField';
import { authStyles as styles } from '@/constants/authStyles';
import { signIn } from '@/lib/auth';

export function LoginForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const params = useLocalSearchParams<{ reset?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice] = useState(
    params.reset ? 'Password updated. You can now sign in.' : '',
  );
  const [busy, setBusy] = useState(false);

  async function onSignIn() {
    setError('');
    setBusy(true);
    const result = await signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? 'Please try again.');
      setBusy(false);
      return;
    }
    setBusy(false);
    onSuccess?.();
  }

  return (
    <>
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
        autoComplete="password"
        textContentType="password"
        editable={!busy}
        onSubmitEditing={onSignIn}
      />
      <Link href="/forgot" asChild>
        <Pressable style={styles.forgotLink} disabled={busy}>
          <Text style={styles.forgotLinkText}>Forgot password?</Text>
        </Pressable>
      </Link>

      {notice ? (
        <Text role="status" style={styles.notice}>
          {notice}
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
        onPress={onSignIn}
        disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign in</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Pressable disabled={busy} onPress={() => router.push('/register')}>
          <Text style={styles.footerLinkText}>Create an account</Text>
        </Pressable>
      </View>
    </>
  );
}
