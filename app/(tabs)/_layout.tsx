import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'
import { House, Route, ListOrdered } from '@tamagui/lucide-icons'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.green10?.get() || '#10b981',
        tabBarStyle: {
          backgroundColor: theme.background?.get() || '#fff',
          borderTopColor: theme.borderColor?.get() || '#e5e7eb',
          paddingBottom: 10,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.background?.get() || '#fff',
          borderBottomColor: theme.borderColor?.get() || '#e5e7eb',
        },
        headerTintColor: theme.color?.get() || '#000',
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Entregas',
          tabBarIcon: ({ color }) => <ListOrdered color={color as any} />,
        }}
      />

      <Tabs.Screen
        name="rota"
        options={{
          title: 'Rota',
          tabBarIcon: ({ color }) => <Route color={color as any} />,
        }}
      />
    </Tabs>
  );
}
