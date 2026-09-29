import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { groupCategoryLabel, localCategoryGroups, type LiveCategoryGroup } from '@/constants/catalog';
import { homeCopy, searchCities, type HomeLocale } from '@/constants/home';
import { groupCategories, loadCategories } from '@/lib/market';

export function FilterChips({
  locale,
  city,
  category,
  sort,
  onCityChange,
  onCategoryChange,
  onSortChange,
  categoryOpenToken = 0,
  hideCategoryChip = false,
}: {
  locale: HomeLocale;
  city: string;
  category: string;
  sort: string;
  onCityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  categoryOpenToken?: number;
  hideCategoryChip?: boolean;
}) {
  const t = homeCopy[locale];
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<'city' | 'category' | 'sort' | null>(null);
  const drawerX = useRef(new Animated.Value(-340)).current;

  useEffect(() => {
    if (categoryOpenToken > 0) setOpen('category');
  }, [categoryOpenToken]);

  useEffect(() => {
    let cancel = false;
    loadCategories()
      .then((items) => {
        const next = groupCategories(items, locale);
        if (!cancel && next.length) setGroups(next);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [locale]);

  useEffect(() => {
    if (open !== 'category') return;
    drawerX.setValue(-340);
    Animated.timing(drawerX, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }, [open, drawerX]);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<LiveCategoryGroup[]>(() => localCategoryGroups(locale));
  const pickedCategory = category ? groupCategoryLabel(groups, category) : '';
  const sortLabel =
    sort === 'price-asc' ? t.priceLow : sort === 'price-desc' ? t.priceHigh : t.sort;

  function choose(kind: 'city' | 'category' | 'sort', value: string) {
    if (kind === 'city') onCityChange(value);
    if (kind === 'category') onCategoryChange(value);
    if (kind === 'sort') onSortChange(value);
    setOpen(null);
  }

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip icon="pin" label={city || t.allCities} onPress={() => setOpen('city')} />
        {hideCategoryChip ? null : (
          <Chip icon="grid" label={pickedCategory || t.categoryField} onPress={() => setOpen('category')} />
        )}
        <Chip icon="sort" label={sortLabel} onPress={() => setOpen('sort')} />
      </ScrollView>
      <Modal visible={open === 'category'} transparent animationType="none" onRequestClose={() => setOpen(null)}>
        <View style={styles.drawerBackdrop}>
          <Animated.View style={[styles.drawer, { paddingTop: insets.top + 12, transform: [{ translateX: drawerX }] }]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Option label={t.allCategories} selected={!category} onPress={() => choose('category', '')} />
              {groups.map((group) => {
                const expanded = openGroup === group.id;
                const picked = category === group.id || group.children.some((child) => child.id === category);
                return (
                  <View key={group.id}>
                    <Pressable
                      onPress={() => setOpenGroup(expanded ? null : group.id)}
                      style={[styles.option, picked && styles.optionSelected]}>
                      <AppIcon name={group.icon} size={16} color="#235641" />
                      <Text style={[styles.optionText, picked && styles.optionTextSelected]}>{group.label}</Text>
                      <AppIcon name="chevronDown" size={14} color="#5d7266" />
                    </Pressable>
                    {expanded ? (
                      <View style={styles.subs}>
                        <Option
                          label={`${t.allCategories} · ${group.label}`}
                          selected={category === group.id}
                          onPress={() => choose('category', group.id)}
                        />
                        {group.children.map((child) => (
                          <Option
                            key={child.id}
                            label={child.label}
                            selected={category === child.id}
                            onPress={() => choose('category', child.id)}
                          />
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
          <Pressable style={styles.drawerRest} onPress={() => setOpen(null)} />
        </View>
      </Modal>
      <Modal visible={open === 'city' || open === 'sort'} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)}>
          <Pressable style={styles.panel} onPress={() => {}}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {open === 'city' ? (
                <>
                  <Option label={t.allCities} selected={!city} onPress={() => choose('city', '')} />
                  {searchCities.map((item) => (
                    <Option
                      key={item}
                      label={item}
                      selected={city === item}
                      onPress={() => choose('city', item)}
                    />
                  ))}
                </>
              ) : null}
              {open === 'sort' ? (
                <>
                  <Option label={t.newest} selected={!sort || sort === 'newest'} onPress={() => choose('sort', 'newest')} />
                  <Option label={t.priceLow} selected={sort === 'price-asc'} onPress={() => choose('sort', 'price-asc')} />
                  <Option label={t.priceHigh} selected={sort === 'price-desc'} onPress={() => choose('sort', 'price-desc')} />
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Chip({
  icon,
  label,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <AppIcon name={icon} size={14} color="#315744" />
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
      <AppIcon name="chevronDown" size={12} color="#8b958c" />
    </Pressable>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.option, selected && styles.optionSelected]}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6ebe4',
    backgroundColor: '#fff',
    maxWidth: 180,
  },
  chipText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#243128',
  },
  drawerBackdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 40, 32, 0.28)',
  },
  drawer: {
    width: '78%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: '#fff',
    paddingBottom: 24,
  },
  drawerRest: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 40, 32, 0.28)',
    justifyContent: 'flex-end',
  },
  panel: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  subs: {
    backgroundColor: '#f7f9f3',
    paddingLeft: 12,
  },
  option: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionSelected: {
    backgroundColor: '#f4faf4',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#243128',
  },
  optionTextSelected: {
    color: '#1f6b45',
  },
});
