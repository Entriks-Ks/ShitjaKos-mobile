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
          backgroundColor: '#fff',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shtëpia',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'house' : 'houseOutline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Kategoritë',
          tabBarIcon: ({ color }) => <AppIcon name="grid" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mesazhet',
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
