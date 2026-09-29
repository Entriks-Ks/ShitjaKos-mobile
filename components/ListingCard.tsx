import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { homeColors, type HomeLocale } from '@/constants/home';
import { formatPrice, type DemoListing } from '@/constants/listings';

export function ListingCard({
  listing,
  locale,
  liked,
  onPress,
  onToggleSaved,
  onShopPress,
}: {
  listing: DemoListing;
  locale: HomeLocale;
  liked?: boolean;
  onPress: () => void;
  onToggleSaved?: () => void;
  onShopPress?: () => void;
}) {
  const badge = (
    <Text style={styles.badgeText}>{listing.seller[locale]}</Text>
  );

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardImage}>
        <Image source={listing.image} style={styles.cardPhoto} resizeMode="cover" />
        {listing.shopSlug && onShopPress ? (
          <Pressable style={styles.badge} onPress={onShopPress} hitSlop={6}>
            {badge}
          </Pressable>
        ) : (
          <View style={styles.badge}>{badge}</View>
        )}
        {onToggleSaved ? (
          <Pressable style={styles.heart} onPress={onToggleSaved} hitSlop={8}>
            <AppIcon
              name={liked ? 'heart' : 'heartOutline'}
              size={16}
              color={liked ? '#c45b4b' : homeColors.forest}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardCategory} numberOfLines={1}>
          {listing.category[locale].toUpperCase()}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.cardPrice}>{formatPrice(listing.price)}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.city}>
            <AppIcon name="pin" size={12} color={homeColors.muted} />
            <Text style={styles.cityText}>{listing.city}</Text>
          </View>
          <AppIcon name="arrowUpRight" size={14} color={homeColors.muted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: homeColors.line,
  },
  cardImage: {
    height: 132,
    backgroundColor: '#e7ece3',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: homeColors.ink,
  },
  heart: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: homeColors.muted,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: homeColors.ink,
    lineHeight: 18,
    minHeight: 36,
  },
  cardPrice: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: homeColors.forest,
  },
  cardMeta: {
    marginTop: 8,
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
    color: homeColors.muted,
    fontSize: 12,
  },
});
