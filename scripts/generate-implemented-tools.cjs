#!/usr/bin/env node
/**
 * 実装済みツールのリストを動的に生成するスクリプト
 * pages/toolsディレクトリのVueファイルをスキャンして実装済みツールを特定する
 */

const fs = require('fs')
const path = require('path')

function generateImplementedTools() {
  const toolsDir = path.join(process.cwd(), 'pages/tools')
  
  if (!fs.existsSync(toolsDir)) {
    console.error('pages/toolsディレクトリが見つかりません')
    process.exit(1)
  }
  
  try {
    const files = fs.readdirSync(toolsDir)
    const vueFiles = files.filter(file => file.endsWith('.vue'))
    const toolIds = vueFiles.map(file => file.replace('.vue', '')).sort()
    
    console.log(`// 実装済みツールのリスト（${toolIds.length}個のツールが見つかりました）`)
    console.log('// このリストはpages/toolsディレクトリ内のVueファイルから自動生成されます')
    console.log('const implementedTools = new Set([')
    toolIds.forEach(id => {
      console.log(`  '${id}',`)
    })
    console.log('])')
    
    // 統計情報を stderr に出力（main output には影響しない）
    console.error(`✓ ${toolIds.length}個の実装済みツールが見つかりました`)
    
  } catch (error) {
    console.error('ツールファイルの読み取りエラー:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  generateImplementedTools()
}

module.exports = { generateImplementedTools }