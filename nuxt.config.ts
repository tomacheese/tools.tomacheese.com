// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: !process.env.CI },

  // Modules
  modules: ['@nuxtjs/sitemap'],

  // GitHub Pages対応
  ssr: false,
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  // GitHub Pages用設定

  // CSS Framework
  css: ['~/assets/css/main.css'],

  // SEO and Social Media
  app: {
    baseURL:
      process.env.DEPLOY_ENV === 'GH_PAGES' ? '/tools.tomacheese.com/' : '/',
    head: {
      htmlAttrs: {
        lang: 'ja',
      },
      title: 'Tools.tomacheese.com - 便利なWebツール集',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          key: 'description',
          name: 'description',
          content:
            'カラーピッカー、文字数カウンター、数学計算など、日常的に使える便利なWebツールを提供しています。無料で安全なブラウザ上で動作するオンラインツール集です。',
        },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'tomacheese' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Tools.tomacheese.com' },
        {
          property: 'og:title',
          content: 'Tools.tomacheese.com - 便利なWebツール集',
        },
        {
          property: 'og:description',
          content:
            'カラーピッカー、文字数カウンター、数学計算など、日常的に使える便利なWebツールを提供しています。無料で安全なブラウザ上で動作するオンラインツール集です。',
        },
        { property: 'og:locale', content: 'ja_JP' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary' },
        {
          name: 'twitter:title',
          content: 'Tools.tomacheese.com - 便利なWebツール集',
        },
        {
          name: 'twitter:description',
          content:
            'カラーピッカー、文字数カウンター、数学計算など、日常的に使える便利なWebツールを提供しています。',
        },
      ],
      link: [
        // Canonical URL will be set dynamically per page
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
      ],
    },
  },

  // Sitemap
  sitemap: {
    hostname:
      process.env.DEPLOY_ENV === 'GH_PAGES'
        ? 'https://tomacheese.github.io/tools.tomacheese.com/'
        : 'http://localhost:3000',
    gzip: true,
    routes: async () => {
      // Generate routes for all tools dynamically
      const routes = ['/']

      // Add all tool routes (based on existing tools)
      const toolRoutes = [
        '/tools/age-calculator',
        '/tools/base64',
        '/tools/border-radius-generator',
        '/tools/box-shadow-generator',
        '/tools/calorie-calculator',
        '/tools/color-picker',
        '/tools/compound-interest-calculator',
        '/tools/css-minifier',
        '/tools/csv-json-converter',
        '/tools/gcd-lcm',
        '/tools/gradient-generator',
        '/tools/hash-generator',
        '/tools/html-encoder',
        '/tools/image-resizer',
        '/tools/image-to-base64',
        '/tools/js-minifier',
        '/tools/json-to-csv',
        '/tools/mortgage-calculator',
        '/tools/number-base-converter',
        '/tools/password-generator',
        '/tools/percentage-calculator',
        '/tools/pomodoro-timer',
        '/tools/prime-checker',
        '/tools/qr-generator',
        '/tools/random-number-generator',
        '/tools/regex-tester',
        '/tools/stopwatch',
        '/tools/text-analyzer',
        '/tools/timestamp-converter',
        '/tools/unit-converter',
        '/tools/uuid-generator',
        '/tools/water-intake-calculator',
        '/tools/world-clock',
      ]

      routes.push(...toolRoutes)
      return routes
    },
  },
})
