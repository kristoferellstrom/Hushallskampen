import { registerSW } from 'virtual:pwa-register'

registerSW({
  immediate: true,
  onRegisteredSW(swUrl: string) {
    if (import.meta.env.DEV) {
      console.info('PWA service worker registered:', swUrl)
    }
  },
})
