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
      exclude: [
        'tests/**', 
        '**/*.test.ts', 
        '**/*.spec.ts',
        '**/*.d.ts',
        'node_modules/**',
        '.nuxt/**',
        'dist/**'
      ],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      },
      watermarks: {
        statements: [80, 95],
        functions: [80, 95], 
        branches: [80, 95],
        lines: [80, 95]
      }
    },
  },
})
