import { Tabs } from 'expo-router';

import { AppIcon } from '@/components/AppIcon';
import { AppTabBar } from '@/components/AppTabBar';
import { homeColors } from '@/constants/home';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: homeColors.forest,
        tabBarInactiveTintColor: homeColors.tabIdle,
        sceneStyle: {
          backgroundColor: homeColors.cream,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'house' : 'houseOutline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Kërko',
          tabBarIcon: ({ color }) => <AppIcon name="search" size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: 'Shitet',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'bubble' : 'bubbleOutline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profili',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'person' : 'personOutline'} size={23} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
