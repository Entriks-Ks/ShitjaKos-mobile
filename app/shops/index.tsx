import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenBack } from '@/components/ScreenBack';
import { ShopCard } from '@/components/ShopCard';
import { homeColors, homeCopy, type HomeLocale } from '@/constants/home';
import type { DemoShop } from '@/constants/shops';
import { publicShops } from '@/lib/market';

function first(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

function localeOf(value: string): HomeLocale {
  return value === 'en' || value === 'de' ? value : 'sq';
}

export default function ShopsScreen() {
  const params = useLocalSearchParams<{ lang?: string }>();
  const locale = localeOf(first(params.lang));
  const t = homeCopy[locale];
  const [shops, setShops] = useState<DemoShop[]>([]);

  useEffect(() => {
    let cancel = false;
    publicShops()
      .then((items) => {
        if (!cancel) setShops(items);
      })
      .catch(() => {
        if (!cancel) setShops([]);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenBack title={t.shops} />
        <Text style={styles.eyebrow}>{t.shopsEyebrow}</Text>
        <Text style={styles.title}>{t.shopsTitle}</Text>
        <Text style={styles.intro}>{t.shopsIntro}</Text>
        <View style={styles.list}>
          {shops.map((shop) => (
            <ShopCard
              key={shop.slug}
              shop={shop}
              onPress={() => router.push(`/shops/${shop.slug}?lang=${locale}` as Href)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
    paddingBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: homeColors.leaf,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'GeistSemiBold',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: '#1f302a',
    marginBottom: 8,
  },
  intro: {
    color: homeColors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  list: {
    gap: 14,
  },
});
