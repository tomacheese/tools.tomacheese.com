// import { defineConfig } from 'vitest/config'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['composables/**', 'utils/**', 'pages/**'],
      exclude: ['tests/**', '**/*.test.ts', '**/*.spec.ts'],
      reporter: ['text', 'html', 'lcov']
    }
  }
})