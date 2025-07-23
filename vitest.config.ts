import { defineConfig } from 'vitest/config'
import path from 'path'
// import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: [
      '**/tests/e2e/**',
      '**/*.spec.ts',
      'node_modules/**',
      '**/node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['composables/**', 'utils/**', 'pages/**'],
      exclude: ['tests/**', '**/*.test.ts', '**/*.spec.ts'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
})
