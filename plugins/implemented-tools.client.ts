/**
 * 実装済みツールの動的検出プラグイン
 * ビルド時にpages/toolsディレクトリをスキャンして実装済みツールを自動検出
 *
 * 🤖 このファイルはビルドフック（build:before）で自動生成されます。手動編集しないでください。
 */

// ビルド時に検出された実装済みツールリスト（54個のツール）
const implementedToolsFromBuild = new Set<string>([
  'age-calculator',
  'base64',
  'binary-calculator',
  'bmi-calculator',
  'border-radius-generator',
  'box-shadow-generator',
  'calorie-calculator',
  'character-counter',
  'color-palette-generator',
  'color-picker',
  'compound-interest-calculator',
  'credit-card-validator',
  'css-minifier',
  'csv-to-json',
  'diff-checker',
  'duplicate-line-remover',
  'email-validator',
  'expense-splitter',
  'factorial-calculator',
  'fibonacci-generator',
  'gcd-lcm',
  'gradient-generator',
  'hash-generator',
  'html-encoder',
  'iban-validator',
  'image-omission',
  'image-resizer',
  'image-to-base64',
  'js-minifier',
  'json-diff',
  'json-formatter',
  'json-to-csv',
  'lorem-generator',
  'markdown-preview',
  'mortgage-calculator',
  'password-generator',
  'percentage-calculator',
  'prime-checker',
  'qr-batch-generator',
  'qr-generator',
  'qr-reader',
  'random-number-generator',
  'regex-tester',
  'sql-formatter',
  'stopwatch',
  'text-case-converter',
  'text-statistics',
  'timestamp-converter',
  'tip-calculator',
  'unit-converter',
  'url-encoder',
  'uuid-generator',
  'water-intake-calculator',
  'world-clock',
])

// グローバルに実装済みツールリストを提供
export default defineNuxtPlugin(() => {
  return {
    provide: {
      implementedTools: implementedToolsFromBuild,
    },
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
}
