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
  },

  // GitHub Pages用設定

  // CSS Framework
  css: ['~/assets/css/main.css'],

  // Vite Configuration
  vite: {
    optimizeDeps: {
      include: ['qrcode', 'jsqr'],
    },
  },

  // SEO
  app: {
    baseURL:
      process.env.DEPLOY_ENV === 'GH_PAGES' ? '/tools.tomacheese.com/' : '/',
    head: {
      title: 'tools.tomacheese.com - 便利なWebツール集',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          key: 'description',
          name: 'description',
          content:
            'カラーピッカー、文字数カウンター、数学計算など、日常的に使える便利なWebツールを提供しています。',
        },
      ],
    },
  },

  // ビルドフックで実装済みツールを自動検出
  hooks: {
    'build:before': async () => {
      // eslint-disable-next-line no-console
      console.info('🔍 実装済みツールを検出中...')

      try {
        const { promises: fs } = await import('node:fs')
        const { join } = await import('node:path')

        const toolsDir = join(process.cwd(), 'pages/tools')
        const files = await fs.readdir(toolsDir)
        const vueFiles = files.filter(file => file.endsWith('.vue'))
        const toolIds = vueFiles.map(file => file.replace('.vue', '')).sort()

        // eslint-disable-next-line no-console
        console.info(`✓ ${toolIds.length}個の実装済みツールを検出しました`)

        // プラグインファイルを動的に生成
        const pluginContent = generatePluginContent(toolIds)
        const pluginPath = join(
          process.cwd(),
          'plugins/implemented-tools.client.ts'
        )

        await fs.writeFile(pluginPath, pluginContent, 'utf-8')
        // eslint-disable-next-line no-console
        console.info('✓ 実装済みツールプラグインを更新しました')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ ツール検出エラー:', error)
      }
    },
  },
})

/**
 * プラグインファイルの内容を生成
 */
function generatePluginContent(toolIds: string[]): string {
  const toolList = toolIds.map(id => `  '${id}',`).join('\n')

  return `/**
 * 実装済みツールの動的検出プラグイン
 * ビルド時にpages/toolsディレクトリをスキャンして実装済みツールを自動検出
 * 
 * 🤖 このファイルはビルド時に自動生成されます。手動編集しないでください。
 */

// ビルド時に検出された実装済みツールリスト（${toolIds.length}個のツール）
const implementedToolsFromBuild = new Set<string>([
${toolList}
])

// グローバルに実装済みツールリストを提供
export default defineNuxtPlugin(() => {
  return {
    provide: {
      implementedTools: implementedToolsFromBuild
    }
  }
})

// 型定義をエクスポート
declare module '#app' {
  interface NuxtApp {
    $implementedTools: Set<string>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $implementedTools: Set<string>
  }
}`
}
