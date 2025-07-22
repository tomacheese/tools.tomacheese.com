#!/usr/bin/env node

/**
 * Git差分に基づいてE2Eテスト対象を決定するスクリプト
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Git差分を取得（PRの場合はベースブランチとの差分）
function getChangedFiles() {
  try {
    // PRの場合は origin/master との差分、通常はHEADとの差分
    const baseRef = process.env.GITHUB_BASE_REF
      ? `origin/${process.env.GITHUB_BASE_REF}`
      : 'HEAD~1'

    const command = `git diff --name-only ${baseRef}...HEAD`
    const output = execSync(command, { encoding: 'utf-8' })
    return output
      .trim()
      .split('\n')
      .filter(file => file)
  } catch (error) {
    console.error('Error getting changed files:', error.message)
    // エラーの場合は全テスト実行
    return ['**/*']
  }
}

// ファイルパスからテスト対象を決定
function determineTestTargets(changedFiles) {
  const testTargets = new Set()

  for (const file of changedFiles) {
    console.log(`Changed file: ${file}`)

    // 全般的な変更の場合は全テスト実行
    if (
      file.includes('package.json') ||
      file.includes('playwright') ||
      file.includes('nuxt.config') ||
      file.includes('app.vue') ||
      file.includes('layouts/') ||
      file.includes('assets/css/') ||
      file.includes('composables/') ||
      (file.includes('utils/') && file.endsWith('.ts')) // utilsの変更は関連するすべてのツールに影響
    ) {
      console.log(`Global change detected in ${file}, running all tests`)
      return ['**/*.spec.ts']
    }

    // pages/tools/ の特定ツールファイルの変更
    const toolMatch = file.match(/pages\/tools\/([^/]+)\.vue$/)
    if (toolMatch) {
      const toolName = toolMatch[1]
      const testFile = `**/${toolName}.spec.ts`
      console.log(`Tool change detected: ${toolName} -> ${testFile}`)
      testTargets.add(testFile)
    }

    // E2Eテストファイル自体の変更
    if (file.includes('tests/e2e/') && file.endsWith('.spec.ts')) {
      console.log(`Test file change detected: ${file}`)
      testTargets.add(file)
    }

    // CIワークフローの変更
    if (file.includes('.github/workflows/')) {
      console.log(`CI workflow change detected, running all tests`)
      return ['**/*.spec.ts']
    }
  }

  // 変更がなかった場合やマッチしなかった場合は重要なテストのみ
  if (testTargets.size === 0) {
    console.log('No specific changes detected, running core tests')
    return [
      '**/homepage.spec.ts',
      '**/character-counter.spec.ts',
      '**/color-picker.spec.ts',
      '**/age-calculator.spec.ts',
    ]
  }

  return Array.from(testTargets)
}

// Playwright設定を動的に生成
function generatePlaywrightConfig(testPatterns) {
  const isFullTest = testPatterns.includes('**/*.spec.ts')

  const config = {
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? (isFullTest ? 2 : 4) : undefined,
    timeout: isFullTest ? 600000 : 300000,
    expect: {
      timeout: process.env.CI ? 15000 : 5000,
    },
    reporter: process.env.CI ? 'list' : [['html', { open: 'never' }]],
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      actionTimeout: process.env.CI ? 15000 : 10000,
      navigationTimeout: process.env.CI ? 45000 : 30000,
    },
    projects: [
      {
        name: 'chromium',
        use: { ...require('@playwright/test').devices['Desktop Chrome'] },
        testMatch: testPatterns,
      },
    ],
    webServer: {
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: process.env.CI ? 600 * 1000 : 180 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
      ignoreHTTPSErrors: true,
    },
  }

  return config
}

// メイン処理
function main() {
  const changedFiles = getChangedFiles()
  console.log(`Total changed files: ${changedFiles.length}`)

  const testTargets = determineTestTargets(changedFiles)
  console.log(`Test targets: ${testTargets.join(', ')}`)

  const config = generatePlaywrightConfig(testTargets)

  // 設定ファイルを出力
  const configPath = path.join(__dirname, '../playwright.dynamic.config.cjs')
  const configContent = `// Auto-generated Playwright config based on Git diff
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig(${JSON.stringify(config, null, 2).replace(/"devices\['Desktop Chrome'\]"/g, "devices['Desktop Chrome']")})`

  fs.writeFileSync(configPath, configContent)
  console.log(`Generated config: ${configPath}`)
  console.log(
    `Running ${testTargets.length === 1 && testTargets[0] === '**/*.spec.ts' ? 'ALL' : testTargets.length} test(s)`
  )
}

if (require.main === module) {
  main()
}

module.exports = {
  getChangedFiles,
  determineTestTargets,
  generatePlaywrightConfig,
}
