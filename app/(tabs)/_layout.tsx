import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'
import { House, Route, ListOrdered } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.blue10?.get() || '#2563eb',
        tabBarInactiveTintColor: theme.gray9?.get() || '#6b7280',
        tabBarStyle: {
          backgroundColor: theme.background?.get() || '#fff',
          borderTopColor: theme.borderColor?.get() || '#e5e7eb',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: theme.background?.get() || '#fff',
          borderBottomColor: theme.borderColor?.get() || '#e5e7eb',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: theme.color?.get() || '#000',
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
        },
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Entregas',
          tabBarIcon: ({ color, focused }) => (
            <ListOrdered 
              color={color as any} 
              size={focused ? 28 : 24}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="rota"
        options={{
          title: 'Rota',
          tabBarIcon: ({ color, focused }) => (
            <Route 
              color={color as any} 
              size={focused ? 28 : 24}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
