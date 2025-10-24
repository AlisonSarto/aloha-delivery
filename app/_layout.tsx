import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { useTheme } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'
import { Platform } from 'react-native'

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
  const theme = useTheme()
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerTintColor: theme.color.val,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
        },
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.background.val,
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          title: 'Aloha Delivery',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="em-rota"
        options={{
          title: 'Em rota',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="entrega/[id]"
        options={{
          title: 'Detalhes da Entrega',
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerStyle: {
            backgroundColor: theme.background.val,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
          },
        }}
      />
    </Stack>
  )
}
