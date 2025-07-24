/**
 * Service Worker management composable
 */
import { ref, onMounted } from 'vue'

export const useServiceWorker = () => {
  const isSupported = ref(false)
  const isRegistered = ref(false)
  const registration = ref<ServiceWorkerRegistration | null>(null)
  const error = ref<string | null>(null)

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      error.value = 'Service Worker not supported'
      return false
    }

    isSupported.value = true

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      registration.value = reg
      isRegistered.value = true

      // Handle service worker updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
                // Tell the new service worker to skip waiting
                newWorker.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        }
      })

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CACHE_UPDATED' && process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('Cache updated:', event.data.url)
        }
      })

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Service Worker registered successfully')
      }
      return true

    } catch (err) {
      error.value = `Service Worker registration failed: ${err}`
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Service Worker registration failed:', err)
      }
      return false
    }
  }

  const unregisterServiceWorker = async () => {
    if (!registration.value) {
      return false
    }

    try {
      const success = await registration.value.unregister()
      if (success) {
        registration.value = null
        isRegistered.value = false
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('Service Worker unregistered successfully')
        }
      }
      return success
    } catch (err) {
      error.value = `Service Worker unregistration failed: ${err}`
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Service Worker unregistration failed:', err)
      }
      return false
    }
  }

  const updateServiceWorker = async () => {
    if (!registration.value) {
      return false
    }

    try {
      await registration.value.update()
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Service Worker update check completed')
      }
      return true
    } catch (err) {
      error.value = `Service Worker update failed: ${err}`
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Service Worker update failed:', err)
      }
      return false
    }
  }

  // Get cache usage information
  const getCacheInfo = async (): Promise<{ name: string; size: number }[]> => {
    if (!('caches' in window)) {
      return []
    }

    try {
      const cacheNames = await caches.keys()
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          return {
            name,
            size: keys.length
          }
        })
      )
      return cacheInfo
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to get cache info:', err)
      }
      return []
    }
  }

  // Clear all caches
  const clearCaches = async (): Promise<boolean> => {
    if (!('caches' in window)) {
      return false
    }

    try {
      const cacheNames = await caches.keys()
      const deletePromises = cacheNames.map(name => caches.delete(name))
      await Promise.all(deletePromises)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('All caches cleared')
      }
      return true
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to clear caches:', err)
      }
      return false
    }
  }

  // Check if app is running in standalone mode (PWA)
  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  // Prefetch resources
  const prefetchResource = async (url: string): Promise<boolean> => {
    if (!('caches' in window)) {
      return false
    }

    try {
      const cache = await caches.open('prefetch-cache')
      const response = await fetch(url)
      if (response.ok) {
        await cache.put(url, response)
        return true
      }
      return false
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to prefetch resource:', url, err)
      }
      return false
    }
  }

  onMounted(() => {
    // Only register in production
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker()
    }
  })

  return {
    isSupported: readonly(isSupported),
    isRegistered: readonly(isRegistered),
    registration: readonly(registration),
    error: readonly(error),
    registerServiceWorker,
    unregisterServiceWorker,
    updateServiceWorker,
    getCacheInfo,
    clearCaches,
    isStandalone,
    prefetchResource
  }
}