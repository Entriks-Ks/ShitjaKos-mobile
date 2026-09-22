import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/AuthScreen';
import { LoginForm } from '@/components/LoginForm';
import { homeColors } from '@/constants/home';
import { signOut, useSession } from '@/lib/auth';

export default function ProfileScreen() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <AuthScreen
        embedded
        title="Your Connection to the Western Balkans Marketplaces"
        subtitle="Log in or register">
        <LoginForm />
      </AuthScreen>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>LLOGARIA IME</Text>
        <Text style={styles.title}>{session.user.name}</Text>
        <Text style={styles.text}>{session.user.email}</Text>
        <Pressable style={styles.outline} onPress={() => signOut()}>
          <Text style={styles.outlineText}>Dil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeColors.cream,
    justifyContent: 'center',
    padding: 20,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: homeColors.line,
    padding: 24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: homeColors.leaf,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: homeColors.ink,
  },
  text: {
    marginTop: 8,
    color: homeColors.muted,
    lineHeight: 20,
  },
  outline: {
    marginTop: 20,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: homeColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: homeColors.forest,
    fontWeight: '700',
  },
});
