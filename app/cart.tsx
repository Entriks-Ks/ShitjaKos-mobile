import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/ProductCard';
import { ScreenBack } from '@/components/ScreenBack';
import { homeColors, homeCopy, type HomeLocale } from '@/constants/home';
import { useSession } from '@/lib/auth';
import { useSaved } from '@/lib/saved';

export default function CartScreen() {
  const locale: HomeLocale = 'sq';
  const t = homeCopy[locale];
  const { data: session } = useSession();
  const { listings, isSaved, toggleSaved } = useSaved();
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 430);
  const cardWidth = Math.floor((pageWidth - 32 - 12) / 2);
  const products = listings;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenBack title={t.cart} />
        {!session ? (
          <View>
            <Text style={styles.empty}>{t.cartLogin}</Text>
            <Pressable style={styles.button} onPress={() => router.push('/login')}>
              <Text style={styles.buttonText}>{t.login}</Text>
            </Pressable>
          </View>
        ) : products.length ? (
          <View style={styles.grid}>
            {products.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                locale={locale}
                width={cardWidth}
                liked={isSaved(listing.id)}
                onPress={() => router.push(`/listing/${listing.id}` as Href)}
                onToggleSaved={() => toggleSaved(listing.id)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>{t.cartEmpty}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  empty: {
    color: homeColors.muted,
    fontWeight: '600',
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    alignSelf: 'flex-start',
    height: 42,
    paddingHorizontal: 16,
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
