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
      thresholds: {
        // Issue #79: 設定目標 - utils、composables、pages のカバレッジ 80% 以上
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'utils/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'composables/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
