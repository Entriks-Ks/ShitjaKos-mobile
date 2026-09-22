import { router } from 'expo-router';

import { AuthScreen } from '@/components/AuthScreen';
import { LoginForm } from '@/components/LoginForm';

export default function LoginScreen() {
  return (
    <AuthScreen
      title="Your Connection to the Western Balkans Marketplaces"
      subtitle="Log in or register">
      <LoginForm onSuccess={() => router.replace('/')} />
    </AuthScreen>
  );
}
