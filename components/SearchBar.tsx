import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { homeColors, homeCopy, type HomeLocale } from '@/constants/home';

export function SearchBar({
  locale,
  query,
  onQueryChange,
  onSubmit,
}: {
  locale: HomeLocale;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const t = homeCopy[locale];

  return (
    <View style={styles.bar}>
      <View style={styles.control}>
        <AppIcon name="search" size={14} color="#235641" />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          placeholder={t.search}
          placeholderTextColor="#7a8c80"
          style={styles.input}
        />
      </View>
      <Pressable style={styles.submit} onPress={onSubmit} accessibilityLabel={t.searchField}>
        <AppIcon name="search" size={15} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef4ee',
    borderWidth: 1,
    borderColor: '#d5e4d6',
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 4,
    gap: 8,
    shadowColor: '#173f35',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  control: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontSize: 13,
    fontWeight: '600',
    color: homeColors.ink,
  },
  submit: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#235641',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
