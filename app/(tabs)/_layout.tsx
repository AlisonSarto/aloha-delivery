import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'
import { House, Route, ListOrdered } from '@tamagui/lucide-icons'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.green10.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
          paddingBottom: 10,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomColor: theme.borderColor.val,
        },
        headerTintColor: theme.color.val,
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
