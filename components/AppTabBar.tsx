import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { homeColors } from '@/constants/home';

type AppTabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: object }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
      };
    }
  >;
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
};

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 6);

  return (
    <View style={[styles.bar, { paddingBottom: bottom }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = String(options.title ?? route.name);
          const sell = route.name === 'publish';
          const color = focused ? homeColors.forest : homeColors.tabIdle;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          if (sell) {
            return (
              <Pressable key={route.key} onPress={onPress} style={styles.sellSlot}>
                <View style={styles.sellButton}>
                  <AppIcon name="plus" size={20} color="#fff" />
                </View>
                <Text style={styles.sellLabel}>{label}</Text>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              {options.tabBarIcon?.({ focused, color, size: 24 })}
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dfe4db',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 58,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: homeColors.tabIdle,
  },
  labelActive: {
    color: homeColors.forest,
  },
  sellSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingBottom: 2,
  },
  sellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: homeColors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: homeColors.forest,
  },
});
