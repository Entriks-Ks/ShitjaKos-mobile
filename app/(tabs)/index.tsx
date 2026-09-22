import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { homeCategories, homeColors, homeCopy, type HomeLocale } from '@/constants/home';
import { demoListings, formatPrice, listingCountLabel } from '@/constants/listings';

export default function HomeScreen() {
  const [locale, setLocale] = useState<HomeLocale>('sq');
  const [saved, setSaved] = useState<string[]>([]);
  const t = homeCopy[locale];

  function toggleSaved(id: string) {
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <View style={styles.shell}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.masthead}>
          <SafeAreaView style={styles.top} edges={['top']}>
            <View style={styles.header}>
              <Text style={styles.brand}>
                shitja<Text style={styles.brandKos}>kos</Text>
                <Text style={styles.brandDot}>.</Text>
              </Text>
            </View>
          </SafeAreaView>

          <View style={styles.hero}>
            <View style={styles.langs}>
              {(['sq', 'en', 'de'] as const).map((item, index) => (
                <View key={item} style={styles.langRow}>
                  {index > 0 ? <Text style={styles.langDivider}>|</Text> : null}
                  <Pressable onPress={() => setLocale(item)}>
                    <Text style={[styles.lang, locale === item && styles.langActive]}>
                      {item.toUpperCase()}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.art} pointerEvents="none">
              <View style={[styles.artCard, styles.artSofa]}>
                <AppIcon name="sofa" size={34} color={homeColors.leaf} />
              </View>
              <View style={[styles.artCard, styles.artLaptop]}>
                <AppIcon name="laptop" size={30} color={homeColors.leaf} />
              </View>
            </View>

            <Text style={styles.headline}>
              {t.headline}
              {'\n'}
              <Text style={styles.subhead}>{t.subhead}</Text>
            </Text>
            <Text style={styles.intro}>{t.intro}</Text>

            <Pressable style={styles.search} onPress={() => router.push('/search')}>
              <AppIcon name="search" size={18} color={homeColors.muted} />
              <TextInput
                editable={false}
                pointerEvents="none"
                placeholder={t.search}
                placeholderTextColor={homeColors.muted}
                style={styles.searchInput}
              />
              <AppIcon name="sliders" size={18} color={homeColors.forest} />
            </Pressable>
          </View>
        </View>

        <View style={styles.categories}>
          <Text style={styles.categoryTitle}>{t.categories}</Text>
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}>
            {homeCategories.map((category) => (
              <Pressable
                key={category.id}
                style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
                onPress={() => router.push('/search')}>
                <View style={styles.tileIcon}>
                  <AppIcon name={category.icon as AppIconName} size={18} color={homeColors.icon} />
                </View>
                <Text numberOfLines={2} style={styles.tileLabel}>
                  {category.label[locale]}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              onPress={() => router.push('/search')}>
              <View style={styles.tileIcon}>
                <AppIcon name="plus" size={18} color={homeColors.icon} />
              </View>
              <Text style={styles.tileLabel}>{t.all}</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.listings}>
          <Text style={styles.eyebrow}>{t.discoverEyebrow}</Text>
          <View style={styles.listingsHead}>
            <Text style={styles.sectionTitle}>{t.discover}</Text>
            <Text style={styles.count}>{listingCountLabel(demoListings.length, locale)}</Text>
          </View>
          <View style={styles.listingGrid}>
            {demoListings.map((listing) => {
              const liked = saved.includes(listing.id);
              return (
                <Pressable
                  key={listing.id}
                  style={styles.card}
                  onPress={() => router.push('/search')}>
                  <View style={styles.cardImage}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{listing.seller[locale]}</Text>
                    </View>
                    <Pressable
                      style={styles.heart}
                      onPress={() => toggleSaved(listing.id)}
                      hitSlop={8}>
                      <AppIcon
                        name={liked ? 'heart' : 'heartOutline'}
                        size={16}
                        color={liked ? '#c45b4b' : homeColors.forest}
                      />
                    </Pressable>
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
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: homeColors.cream,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  masthead: {
    backgroundColor: homeColors.mint,
  },
  top: {
    backgroundColor: homeColors.forest,
  },
  header: {
    backgroundColor: homeColors.forest,
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 8,
  },
  brand: {
    color: '#f3f7ee',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  brandKos: {
    color: '#f3f7ee',
  },
  brandDot: {
    color: '#b2cb6b',
  },
  search: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f2f4f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: homeColors.ink,
    fontSize: 15,
    textAlign: 'left',
  },
  scroll: {
    flex: 1,
    backgroundColor: homeColors.cream,
  },
  content: {
    paddingBottom: 36,
  },
  hero: {
    backgroundColor: homeColors.mint,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  langs: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 2,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lang: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8aa090',
    letterSpacing: 0.4,
  },
  langActive: {
    color: homeColors.forest,
  },
  langDivider: {
    marginHorizontal: 8,
    color: '#b7c4b8',
    fontSize: 11,
  },
  art: {
    position: 'absolute',
    right: 8,
    top: 42,
    width: 150,
    height: 130,
  },
  artCard: {
    position: 'absolute',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artSofa: {
    right: 8,
    top: 0,
    width: 88,
    height: 92,
    backgroundColor: '#c5d59a',
    transform: [{ rotate: '8deg' }],
  },
  artLaptop: {
    right: 62,
    top: 48,
    width: 84,
    height: 72,
    backgroundColor: '#f7f4ea',
    transform: [{ rotate: '-8deg' }],
  },
  headline: {
    marginTop: 12,
    maxWidth: 230,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    color: homeColors.ink,
    letterSpacing: -0.9,
  },
  subhead: {
    color: '#3f7a55',
  },
  intro: {
    marginTop: 10,
    maxWidth: 250,
    color: homeColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  categories: {
    backgroundColor: homeColors.paper,
    paddingTop: 22,
    paddingBottom: 8,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: homeColors.ink,
    letterSpacing: -0.4,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: homeColors.ink,
    letterSpacing: -0.4,
  },
  categoryRow: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 8,
  },
  tile: {
    width: 168,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: homeColors.line,
    borderRadius: 14,
  },
  tilePressed: {
    backgroundColor: '#f4f7ee',
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: homeColors.iconWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    flex: 1,
    color: homeColors.ink,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  listings: {
    backgroundColor: homeColors.cream,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: homeColors.leaf,
    marginBottom: 6,
  },
  listingsHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  count: {
    color: homeColors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  listingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
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
