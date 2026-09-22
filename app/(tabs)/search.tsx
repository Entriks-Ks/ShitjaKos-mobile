import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { homeColors } from '@/constants/home';

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <AppIcon name="search" size={18} color={homeColors.muted} />
        <TextInput
          autoFocus
          placeholder="Çfarë po kërkon?"
          placeholderTextColor={homeColors.muted}
          style={styles.input}
        />
        <AppIcon name="sliders" size={18} color={homeColors.forest} />
      </View>
      <Text style={styles.hint}>Kërko shpallje, kategori ose qytet.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeColors.cream,
    padding: 16,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f2f4f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: homeColors.ink,
  },
  hint: {
    marginTop: 16,
    color: homeColors.muted,
    fontSize: 14,
  },
});
