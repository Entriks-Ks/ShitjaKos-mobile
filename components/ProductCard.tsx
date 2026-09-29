import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { homeColors, type HomeLocale } from '@/constants/home';
import { formatPrice, type DemoListing } from '@/constants/listings';

export function ProductCard({
  listing,
  locale,
  liked,
  onPress,
  onToggleSaved,
  width,
}: {
  listing: DemoListing;
  locale: HomeLocale;
  liked?: boolean;
  onPress: () => void;
  onToggleSaved?: () => void;
  width: number;
}) {
  return (
    <Pressable style={[styles.card, { width }]} onPress={onPress}>
      <View style={[styles.photo, { backgroundColor: listing.tone, height: Math.round(width * 0.92) }]}>
        <Image source={listing.image} style={styles.photoImage} resizeMode="cover" />
        <Pressable style={styles.heart} onPress={onToggleSaved} hitSlop={8}>
          <AppIcon
            name={liked ? 'heart' : 'heartOutline'}
            size={16}
            color={liked ? '#c45b4b' : '#8b958c'}
          />
        </Pressable>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {listing.title}
      </Text>
      <Text style={styles.price}>{formatPrice(listing.price)}</Text>
      <View style={styles.meta}>
        <AppIcon name="pin" size={11} color="#8b958c" />
        <Text style={styles.metaText} numberOfLines={1}>
          {listing.city}
        </Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {listing.ago[locale]}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 0,
    flexShrink: 0,
    gap: 2,
  },
  photo: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c1c1c',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f6b45',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 11,
    color: homeColors.muted,
  },
  dot: {
    color: '#c5ccc6',
    fontSize: 11,
  },
});
