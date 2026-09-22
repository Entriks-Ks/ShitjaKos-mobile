import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { homeColors } from '@/constants/home';
import { useSession } from '@/lib/auth';

export default function PublishScreen() {
  const { data: session } = useSession();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <AppIcon name="plus" size={22} color={homeColors.forest} />
        </View>
        <Text style={styles.title}>Publiko shpallje</Text>
        <Text style={styles.text}>
          {session
            ? 'Së shpejti mund të publikosh shpallje drejtpërdrejt nga app-i.'
            : 'Hyr ose krijo një account për të publikuar shpallje.'}
        </Text>
        {!session ? (
          <Pressable style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Hyr / Regjistrohu</Text>
          </Pressable>
        ) : null}
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
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: homeColors.iconWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  button: {
    marginTop: 20,
    height: 46,
    borderRadius: 999,
    backgroundColor: homeColors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
