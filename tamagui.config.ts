import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
  }
})

export type Conf = typeof appConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default appConfig