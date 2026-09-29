import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppIcon } from '@/components/AppIcon';
import { homeColors } from '@/constants/home';

export function ScreenBack({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.back}>
        <AppIcon name="chevronLeft" size={20} color={homeColors.forest} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeColors.line,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: homeColors.ink,
    letterSpacing: -0.3,
  },
});
