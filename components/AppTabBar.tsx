import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { homeColors } from '@/constants/home';
import { useInbox } from '@/lib/inbox';

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
  const { unreadCount } = useInbox();

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
                  <AppIcon name="plus" size={26} color="#fff" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <View>
                {options.tabBarIcon?.({ focused, color, size: 24 })}
                {route.name === 'messages' && unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                ) : null}
              </View>
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#c45b4b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  sellSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -28,
    backgroundColor: '#24543d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173f35',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
