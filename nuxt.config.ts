// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: !process.env.CI },

  // GitHub Pages対応
  ssr: false,
  nitro: {
    prerender: {
      routes: ['/'],
    },
    // Compression and minification
    minify: true,
    compressPublicAssets: true,
  },

  // パフォーマンス最適化
  experimental: {
    // Enable newer features for better performance
    payloadExtraction: false,
  },

  // Build optimization
  build: {
    // Bundle analyzer (enable with ANALYZE=true)
    analyze: process.env.ANALYZE === 'true',
  },

  // CSS Framework with optimization
  css: ['~/assets/css/main.css'],

  // Vite configuration for optimization
  vite: {
    build: {
      // Code splitting configuration
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router'],
            'vendor-utils': ['diff', 'marked'],
            'vendor-highlight': ['highlight.js'],
          },
        },
      },
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 1000,
      // Minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['vue', 'vue-router', 'diff', 'marked', 'highlight.js'],
    },
  },

  // SEO with performance optimizations
  app: {
    baseURL:
      process.env.DEPLOY_ENV === 'GH_PAGES' ? '/tools.tomacheese.com/' : '/',
    head: {
      title: 'Tools.tomacheese.com - 便利なWebツール集',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          key: 'description',
          name: 'description',
          content:
            'カラーピッカー、文字数カウンター、数学計算など、日常的に使える便利なWebツールを提供しています。',
        },
        // Performance hints
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { name: 'theme-color', content: '#ffffff' },
      ],
      link: [
        // DNS prefetch for external resources
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        // Preconnect for critical resources
        { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: '' },
      ],
    },
  },

  // Router optimization
  router: {
    options: {
      // Enable router prefetching for better navigation
      linkActiveClass: 'router-link-active',
      linkExactActiveClass: 'router-link-exact-active',
    },
  },

  // TypeScript optimization
  typescript: {
    typeCheck: process.env.NODE_ENV === 'development',
  },
})
