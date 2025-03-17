import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { useTheme } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'

export {
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ThemeProvider value={DefaultTheme}>
        <AppContent />
      </ThemeProvider>
    </TamaguiProvider>
  )
}

function AppContent() {
  const theme = useTheme() // Now inside TamaguiProvider context
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          title: 'Aloha Delivery',
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background.val,
          },
        }}
      />
      <Stack.Screen
        name="em-rota"
        options={{
          title: 'Em rota',
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background.val,
          },
        }}
      />
      <Stack.Screen
        name="entrega/[id]"
        options={{
          title: 'Detalhes do pedido',
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: theme.background.val,
          },
        }}
      />
    </Stack>
  )
}
