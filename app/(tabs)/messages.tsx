import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { homeColors } from '@/constants/home';

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.card}>
        <AppIcon name="bubble" size={28} color={homeColors.leaf} />
        <Text style={styles.title}>Mesazhet</Text>
        <Text style={styles.text}>Bisedat me blerësit dhe shitësit do të shfaqen këtu.</Text>
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
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: homeColors.ink,
  },
  text: {
    color: homeColors.muted,
    lineHeight: 20,
  },
});
