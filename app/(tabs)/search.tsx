import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { FilterChips } from '@/components/FilterChips';
import { ProductCard } from '@/components/ProductCard';
import { homeColors, homeCopy, type HomeLocale } from '@/constants/home';
import type { DemoListing } from '@/constants/listings';
import { searchListings } from '@/lib/market';
import { useSaved } from '@/lib/saved';

function first(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default function SearchScreen() {
  const locale: HomeLocale = 'sq';
  const t = homeCopy[locale];
  const params = useLocalSearchParams<{
    q?: string;
    category?: string;
    city?: string;
    sort?: string;
  }>();
  const q = first(params.q);
  const category = first(params.category);
  const city = first(params.city);
  const sort = first(params.sort) || 'newest';
  const [draft, setDraft] = useState(q);
  const [categoryMenu, setCategoryMenu] = useState(0);
  const { isSaved, toggleSaved } = useSaved();
  const [results, setResults] = useState<DemoListing[]>([]);
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 430);
  const cardWidth = Math.floor((pageWidth - 32 - 12) / 2);

  useEffect(() => {
    let cancel = false;
    searchListings({ q, category, city, sort, limit: 20 })
      .then((items) => {
        if (!cancel) setResults(items);
      })
      .catch(() => {
        if (!cancel) setResults([]);
      });
    return () => {
      cancel = true;
    };
  }, [q, category, city, sort]);

  useEffect(() => {
    setDraft(q);
  }, [q]);

  function apply(next: { q?: string; category?: string; city?: string; sort?: string }) {
    router.setParams({
      q: next.q ?? q,
      category: next.category ?? category,
      city: next.city ?? city,
      sort: next.sort ?? sort,
    });
  }

  return (
    <View style={styles.shell}>
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.filters}>
          <Pressable hitSlop={8} onPress={() => setCategoryMenu((value) => value + 1)} style={styles.menuButton}>
            <AppIcon name="menu" size={22} color="#1c1c1c" />
          </Pressable>
          <View style={styles.chips}>
            <FilterChips
              locale={locale}
              city={city}
              category={category}
              sort={sort}
              onCityChange={(value) => apply({ city: value })}
              onCategoryChange={(value) => apply({ category: value })}
              onSortChange={(value) => apply({ sort: value })}
              categoryOpenToken={categoryMenu}
              hideCategoryChip
            />
          </View>
        </View>
        <View style={styles.header}>
          <View style={styles.search}>
            <AppIcon name="search" size={16} color="#8b958c" />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => apply({ q: draft.trim() })}
              returnKeyType="search"
              placeholder={t.searchMarketplace}
              placeholderTextColor="#9aa39b"
              style={styles.input}
            />
          </View>
          <Pressable style={styles.filterButton} onPress={() => apply({ q: draft.trim() })}>
            <AppIcon name="sliders" size={18} color="#315744" />
          </Pressable>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {results.length ? (
          <View style={styles.grid}>
            {results.map((listing) => (
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
  top: {
    backgroundColor: '#fff',
  },
  filters: {
    paddingLeft: 12,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  search: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f5f2',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1c1c1c',
    padding: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flex: 1,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
    color: homeColors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
});
