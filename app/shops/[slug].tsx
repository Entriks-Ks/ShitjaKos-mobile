import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { ListingCard } from '@/components/ListingCard';
import { ScreenBack } from '@/components/ScreenBack';
import { homeColors, homeCopy, type HomeLocale } from '@/constants/home';
import type { DemoListing } from '@/constants/listings';
import type { DemoShop } from '@/constants/shops';
import { publicShop } from '@/lib/market';
import { useSaved } from '@/lib/saved';

function first(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

function localeOf(value: string): HomeLocale {
  return value === 'en' || value === 'de' ? value : 'sq';
}

export default function ShopScreen() {
  const params = useLocalSearchParams<{ slug?: string; lang?: string }>();
  const slug = first(params.slug);
  const locale = localeOf(first(params.lang));
  const t = homeCopy[locale];
  const { isSaved, toggleSaved } = useSaved();
  const [shop, setShop] = useState<DemoShop | null>(null);
  const [listings, setListings] = useState<DemoListing[]>([]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancel = false;
    setPhase('loading');
    publicShop(slug)
      .then((result) => {
        if (cancel) return;
        setShop(result.shop);
        setListings(result.listings);
        setPhase('ready');
      })
      .catch(() => {
        if (!cancel) setPhase('missing');
      });
    return () => {
      cancel = true;
    };
  }, [slug]);

  if (phase !== 'ready' || !shop) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pad}>
          <ScreenBack title={t.shops} />
          <Text style={styles.missing}>{phase === 'loading' ? 'Duke u ngarkuar…' : t.shopEmpty}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const facts = [
    { icon: 'pin' as const, label: t.shopAddress, value: shop.address || shop.city },
    { icon: 'pin' as const, label: t.shopCity, value: shop.city },
    { icon: 'clock' as const, label: t.shopHours, value: shop.openingHours || t.shopHoursFallback },
    { icon: 'phone' as const, label: t.shopPhone, value: shop.phone, href: `tel:${shop.phone}` },
    { icon: 'mail' as const, label: t.shopEmail, value: shop.email, href: `mailto:${shop.email}` },
  ];

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.cover}>
          <Image source={shop.image} style={styles.coverImage} resizeMode="cover" />
          <SafeAreaView edges={['top']} style={styles.coverBar}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              hitSlop={8}
              style={styles.back}>
              <AppIcon name="chevronLeft" size={20} color={homeColors.forest} />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.pad}>
          <View style={styles.reviewed}>
            <AppIcon name="shield" size={14} color={homeColors.leaf} />
            <Text style={styles.eyebrow}>{t.shopReviewed}</Text>
          </View>
          <Text style={styles.name}>{shop.name}</Text>
          <Text style={styles.tagline}>{shop.tagline}</Text>
          <Text style={styles.description}>{shop.description}</Text>

          <View style={styles.info}>
            <Text style={styles.infoTitle}>{t.shopInfo}</Text>
            {facts.map((fact) => (
              <View key={fact.label} style={styles.fact}>
                <View style={styles.factIcon}>
                  <AppIcon name={fact.icon} size={14} color="#235641" />
                </View>
                <View style={styles.factCopy}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  {fact.href ? (
                    <Pressable onPress={() => Linking.openURL(fact.href)}>
                      <Text style={styles.factLink}>{fact.value}</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.factValue}>{fact.value}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.section}>
            {t.shopListings} ({listings.length})
          </Text>
          {listings.length ? (
            <View style={styles.grid}>
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  locale={locale}
                  liked={isSaved(listing.id)}
                  onPress={() => router.push(`/listing/${listing.id}?lang=${locale}` as Href)}
                  onToggleSaved={() => toggleSaved(listing.id)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.missing}>{t.shopEmpty}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeColors.cream,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    paddingBottom: 32,
  },
  cover: {
    height: 210,
    backgroundColor: '#e7ece3',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverBar: {
    position: 'absolute',
    top: 0,
    left: 16,
  },
  back: {
    width: 36,
    height: 36,
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: {
    padding: 16,
  },
  reviewed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: homeColors.leaf,
  },
  name: {
    fontFamily: 'GeistSemiBold',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: '#1f302a',
  },
  tagline: {
    marginTop: 6,
    color: homeColors.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  description: {
    marginTop: 4,
    color: homeColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  info: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: homeColors.line,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: homeColors.ink,
    marginBottom: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ea',
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4ee',
  },
  factIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#eef4ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factCopy: {
    flex: 1,
    gap: 2,
  },
  factLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#7d8c82',
  },
  factValue: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2c3328',
  },
  factLink: {
    fontSize: 14,
    lineHeight: 20,
    color: '#235641',
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '800',
    color: homeColors.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  missing: {
    color: homeColors.muted,
    fontSize: 15,
  },
});
