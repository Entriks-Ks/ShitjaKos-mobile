import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { categoryPhoto, homeCategories, homeColors, homeCopy, type HomeLocale } from '@/constants/home';
import type { DemoListing } from '@/constants/listings';
import { groupCategories, loadCategories, searchListings } from '@/lib/market';
import { useSaved } from '@/lib/saved';

export default function HomeScreen() {
  const locale: HomeLocale = 'sq';
  const t = homeCopy[locale];
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 430);
  const cardWidth = Math.floor((pageWidth - 32 - 32) / 3);
  const [query, setQuery] = useState('');
  const { isSaved, toggleSaved } = useSaved();
  const [products, setProducts] = useState<DemoListing[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; image: ImageSourcePropType }[]>(
    homeCategories.map((item) => ({ id: item.id, label: item.label[locale], image: item.image })),
  );
  const [heroBox, setHeroBox] = useState({ width: 0, height: 0 });
  const heroImageWidth = heroBox.height * (1200 / 490);
  const heroImageLeft = (heroBox.width - heroImageWidth) * 0.8;
  useEffect(() => {
    let cancel = false;
    loadCategories()
      .then((items) => {
        const groups = groupCategories(items, locale);
        if (!cancel && groups.length) {
          setCategories(groups.map((group) => ({ id: group.id, label: group.label, image: categoryPhoto(group.id) })));
        }
      })
      .catch(() => {});
    searchListings({ sort: 'newest', limit: 12 })
      .then((items) => {
        if (!cancel) setProducts(items);
      })
      .catch(() => {
        if (!cancel) setProducts([]);
      });
    return () => {
      cancel = true;
    };
  }, []);

  function openBrowse(extra?: { q?: string; category?: string }) {
    const nextQuery = extra?.q ?? query.trim();
    const nextCategory = extra?.category ?? '';
    router.push(
      `/search?q=${encodeURIComponent(nextQuery)}&category=${encodeURIComponent(nextCategory)}` as Href,
    );
  }

  return (
    <View style={styles.shell}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <SafeAreaView edges={['top']} style={styles.headerWrap}>
          <View style={styles.header}>
            <Text style={styles.brand}>
              shitja<Text style={styles.brandKos}>kos</Text><Text style={styles.brandDot}>.</Text>
            </Text>
            <View style={styles.headerActions}>
              <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/profile' as Href)}>
                <AppIcon name="personOutline" size={22} color="#1c1c1c" />
              </Pressable>
              <Pressable hitSlop={8} onPress={() => router.push('/cart' as Href)}>
                <AppIcon name="heartOutline" size={22} color="#1c1c1c" />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        <View
          style={styles.hero}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setHeroBox({ width, height });
          }}>
          <View style={styles.heroArt} pointerEvents="none">
            {heroBox.height > 0 ? (
              <Image
                source={require('@/assets/images/main-image-made.jpg')}
                resizeMode="cover"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: heroImageLeft,
                  width: heroImageWidth,
                  height: heroBox.height,
                }}
              />
            ) : null}
          </View>
          <Text style={styles.headline}>
            {t.headline}
            {'\n'}
            <Text style={styles.subhead}>{t.subhead}</Text>
          </Text>
          <Text style={styles.heroText}>{t.intro}</Text>
          <View style={styles.heroSearch}>
            <SearchBar
              locale={locale}
              query={query}
              onQueryChange={setQuery}
              onSubmit={() => openBrowse()}
            />
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t.popular}</Text>
          <Pressable onPress={() => openBrowse({ q: '', category: '' })}>
            <Text style={styles.seeAll}>{t.seeAll}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((item) => (
            <Pressable
              key={item.id}
              style={styles.category}
              onPress={() => openBrowse({ q: '', category: item.id })}>
              <View style={styles.categoryIcon}>
                <Image source={item.image} style={styles.categoryImage} resizeMode="cover" />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t.recommended}</Text>
          <Pressable onPress={() => openBrowse()}>
            <Text style={styles.seeAll}>{t.seeAll}</Text>
          </Pressable>
        </View>
        {products.length ? (
          <View style={styles.products}>
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
          <Text style={styles.empty}>{t.noResults}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#fff',
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    paddingBottom: 28,
  },
  headerWrap: {
    backgroundColor: '#fff',
  },
  header: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: 'GeistExtraBold',
    fontSize: 29,
    lineHeight: 44,
    color: '#1f302a',
    letterSpacing: -1.6,
    paddingRight: 2,
  },
  brandKos: {
    fontFamily: 'GeistExtraBold',
    color: '#39875c',
  },
  brandDot: {
    fontFamily: 'GeistExtraBold',
    color: '#b2cb6b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 2,
    borderRadius: 22,
    backgroundColor: '#e8e2d4',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 10,
    minHeight: 250,
    overflow: 'hidden',
  },
  heroArt: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  headline: {
    marginTop: 6,
    fontFamily: 'GeistSemiBold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1.44,
    color: '#1f302a',
    paddingRight: 2,
  },
  subhead: {
    fontFamily: 'GeistSemiBold',
    color: '#48805d',
  },
  heroText: {
    marginTop: 'auto',
    color: '#5c6b62',
    fontSize: 11,
    lineHeight: 14,
    maxWidth: 220,
  },
  heroSearch: {
    marginTop: 8,
    marginHorizontal: -10,
  },
  sectionHead: {
    marginTop: 22,
    marginBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1c1c1c',
  },
  seeAll: {
    color: '#1f6b45',
    fontSize: 13,
    fontWeight: '700',
  },
  categories: {
    paddingHorizontal: 16,
    gap: 14,
  },
  category: {
    width: 84,
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#f4f6f3',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#243128',
    lineHeight: 14,
  },
  products: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 40, 32, 0.35)',
    justifyContent: 'flex-start',
    paddingTop: 88,
    paddingHorizontal: 16,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: homeColors.ink,
  },
  empty: {
    paddingHorizontal: 16,
    color: homeColors.muted,
    fontWeight: '600',
  },
});
