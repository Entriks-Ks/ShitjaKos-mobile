import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { homeColors } from '@/constants/home';
import type { DemoShop } from '@/constants/shops';

export function ShopCard({
  shop,
  onPress,
  width,
}: {
  shop: DemoShop;
  onPress: () => void;
  width?: number;
}) {
  return (
    <Pressable
      style={[styles.card, width ? { width } : null]}
      onPress={onPress}
      accessibilityRole="button">
      <Image source={shop.image} style={styles.photo} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {shop.name}
        </Text>
        <Text style={styles.tagline} numberOfLines={2}>
          {shop.tagline}
        </Text>
        <View style={styles.meta}>
          <View style={styles.city}>
            <AppIcon name="pin" size={12} color={homeColors.muted} />
            <Text style={styles.cityText}>{shop.city}</Text>
          </View>
          <AppIcon name="arrowUpRight" size={16} color={homeColors.leaf} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: homeColors.line,
  },
  photo: {
    width: '100%',
    height: 112,
    backgroundColor: '#e7ece3',
  },
  body: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: homeColors.ink,
  },
  tagline: {
    color: homeColors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  city: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    color: homeColors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
});
