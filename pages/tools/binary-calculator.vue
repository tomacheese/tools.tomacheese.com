<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>進数変換</h1>
      <p>10進数、2進数、8進数、16進数を相互変換します。</p>
    </div>

    <div class="input-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <!-- 入力セクション -->
        <div>
          <div class="form-group">
            <label class="form-label">変換元の数値</label>
            <input
              v-model="inputValue"
              type="text"
              class="form-input"
              :placeholder="getPlaceholder()"
              @input="validateAndConvert"
            />
          </div>

          <div class="form-group">
            <label class="form-label">変換元の進数</label>
            <select v-model="fromBase" class="form-select" @change="validateAndConvert">
              <option value="2">2進数（Binary）</option>
              <option value="8">8進数（Octal）</option>
              <option value="10">10進数（Decimal）</option>
              <option value="16">16進数（Hexadecimal）</option>
            </select>
          </div>
        </div>

        <!-- プリセット -->
        <div>
          <h3 style="margin-bottom: 1rem; color: #1e293b;">プリセット例</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button
              v-for="preset in presets"
              :key="preset.value + preset.base"
              class="btn btn-secondary"
              style="text-align: left; justify-content: flex-start;"
              @click="applyPreset(preset)"
            >
              <div>
                <div style="font-weight: 600;">{{ preset.name }}</div>
                <div style="font-size: 0.875rem; opacity: 0.8; font-family: 'Courier New', monospace;">
                  {{ preset.value }} ({{ preset.base }}進数)
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 変換結果 -->
    <div v-if="isValidInput && conversions" style="margin-top: 2rem;">
      <h3 style="margin-bottom: 1rem; color: #1e293b;">変換結果</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
        <div
          v-for="conversion in conversions"
          :key="conversion.base"
          class="result-box"
          :style="{ borderLeft: conversion.base == fromBase ? '4px solid #10b981' : '4px solid #e2e8f0' }"
        >
          <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">
            <h4 style="color: #2563eb; margin: 0;">{{ conversion.name }}</h4>
            <span v-if="conversion.base == fromBase" style="font-size: 0.75rem; color: #10b981; font-weight: 600;">
              (入力)
            </span>
          </div>
          
          <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
            <div style="font-family: 'Courier New', monospace; font-size: 1.25rem; font-weight: 600; word-break: break-all;">
              {{ conversion.value }}
            </div>
            <div style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">
              {{ conversion.base }}進数
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button
              class="btn btn-secondary"
              style="font-size: 0.75rem; padding: 0.25rem 0.5rem;"
              @click="copyConversion(conversion)"
            >
              コピー
            </button>
            <button
              class="btn btn-secondary"
              style="font-size: 0.75rem; padding: 0.25rem 0.5rem;"
              @click="useAsInput(conversion)"
            >
              入力に使用
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細情報 -->
    <div v-if="isValidInput && decimalValue !== null" style="margin-top: 2rem;">
      <h3 style="margin-bottom: 1rem; color: #1e293b;">詳細情報</h3>
      
      <div class="result-box">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem;">数値情報</h4>
            <div style="font-size: 0.9rem;">
              <div>10進数値: {{ decimalValue.toLocaleString() }}</div>
              <div>桁数: {{ inputValue.length }}桁</div>
              <div>最大値 ({{ fromBase }}進数): {{ getMaxValue() }}</div>
              <div>範囲: 0 ～ {{ getMaxValue() }}</div>
            </div>
          </div>

          <div v-if="fromBase == 2">
            <h4 style="color: #2563eb; margin-bottom: 0.5rem;">2進数情報</h4>
            <div style="font-size: 0.9rem;">
              <div>ビット数: {{ inputValue.length }}bit</div>
              <div>1の個数: {{ (inputValue.match(/1/g) || []).length }}</div>
              <div>0の個数: {{ (inputValue.match(/0/g) || []).length }}</div>
              <div>値の範囲: 0 ～ {{ Math.pow(2, inputValue.length) - 1 }}</div>
            </div>
          </div>

          <div v-if="fromBase == 16">
            <h4 style="color: #2563eb; margin-bottom: 0.5rem;">16進数情報</h4>
            <div style="font-size: 0.9rem;">
              <div>バイト数: {{ Math.ceil(inputValue.length / 2) }}byte</div>
              <div>使用文字: {{ getUsedHexChars() }}</div>
              <div>文字種類: {{ getUniqueCharCount() }}種類</div>
              <div>最大4桁値: FFFF (65535)</div>
            </div>
          </div>

          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem;">変換式</h4>
            <div style="font-size: 0.9rem; font-family: 'Courier New', monospace;">
              {{ getConversionFormula() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 進数について -->
    <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 6px;">
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">進数について</h4>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
        <div>
          <h5 style="color: #2563eb; margin-bottom: 0.25rem;">2進数（Binary）</h5>
          <p style="color: #64748b; font-size: 0.875rem;">
            0と1のみを使用。コンピュータの基本。ビット演算に使用。
          </p>
        </div>
        
        <div>
          <h5 style="color: #2563eb; margin-bottom: 0.25rem;">8進数（Octal）</h5>
          <p style="color: #64748b; font-size: 0.875rem;">
            0-7を使用。Unixのファイル権限表記。3ビットずつグループ化。
          </p>
        </div>
        
        <div>
          <h5 style="color: #2563eb; margin-bottom: 0.25rem;">10進数（Decimal）</h5>
          <p style="color: #64748b; font-size: 0.875rem;">
            0-9を使用。日常で最も使用される。人間にとって直感的。
          </p>
        </div>
        
        <div>
          <h5 style="color: #2563eb; margin-bottom: 0.25rem;">16進数（Hexadecimal）</h5>
          <p style="color: #64748b; font-size: 0.875rem;">
            0-9,A-Fを使用。色コード、メモリアドレス、プログラミングで使用。
          </p>
        </div>
      </div>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">用途例</h4>
      <ul style="margin-left: 1.5rem; color: #64748b;">
        <li>プログラミングでの数値表現変換</li>
        <li>HTMLの色コード変換（#FF0000 → rgb(255,0,0)）</li>
        <li>ネットワークアドレスの計算</li>
        <li>デジタル回路設計</li>
        <li>メモリダンプの解析</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div
      v-if="copyMessage"
      style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 6px; z-index: 1000;"
    >
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { convertBase } from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool'
})

// リアクティブデータ
const inputValue = ref('')
const fromBase = ref(10)
const copyMessage = ref('')

// プリセット例
const presets = [
  { name: '8ビット最大値', value: '11111111', base: 2 },
  { name: '16進色コード', value: 'FF0000', base: 16 },
  { name: 'ファイル権限', value: '755', base: 8 },
  { name: '年号', value: '2024', base: 10 },
  { name: 'IPv4アドレス', value: 'C0A80001', base: 16 },
  { name: '1024', value: '1024', base: 10 }
]

// 計算プロパティ
const isValidInput = computed(() => {
  if (!inputValue.value) return false
  
  try {
    const cleanValue = inputValue.value.trim().toUpperCase()
    parseInt(cleanValue, fromBase.value)
    return true
  } catch {
    return false
  }
})

const decimalValue = computed(() => {
  if (!isValidInput.value) return null
  
  try {
    const cleanValue = inputValue.value.trim().toUpperCase()
    return parseInt(cleanValue, fromBase.value)
  } catch {
    return null
  }
})

const conversions = computed(() => {
  if (!isValidInput.value || decimalValue.value === null) return null
  
  const bases = [
    { base: 2, name: '2進数（Binary）' },
    { base: 8, name: '8進数（Octal）' },
    { base: 10, name: '10進数（Decimal）' },
    { base: 16, name: '16進数（Hexadecimal）' }
  ]
  
  return bases.map(baseInfo => ({
    ...baseInfo,
    value: decimalValue.value.toString(baseInfo.base).toUpperCase()
  }))
})

// メソッド
const getPlaceholder = () => {
  const placeholders = {
    2: '1010101',
    8: '377',
    10: '255',
    16: 'FF'
  }
  return placeholders[fromBase.value] || '数値を入力'
}

const validateAndConvert = () => {
  // リアクティブに変換が実行される
}

const getMaxValue = () => {
  const length = inputValue.value.length || 1
  return (Math.pow(fromBase.value, length) - 1).toString(fromBase.value).toUpperCase()
}

const getUsedHexChars = () => {
  if (fromBase.value !== 16) return ''
  
  const uniqueChars = [...new Set(inputValue.value.toUpperCase())].sort()
  return uniqueChars.join(', ')
}

const getUniqueCharCount = () => {
  return new Set(inputValue.value.toUpperCase()).size
}

const getConversionFormula = () => {
  if (!inputValue.value || decimalValue.value === null) return ''
  
  const cleanValue = inputValue.value.trim().toUpperCase()
  const base = parseInt(fromBase.value)
  
  if (cleanValue.length <= 4) {
    const digits = cleanValue.split('').reverse()
    const terms = digits.map((digit, index) => {
      const coefficient = parseInt(digit, base)
      if (index === 0) {
        return `${coefficient}`
      } else {
        return `${coefficient}×${base}^${index}`
      }
    }).reverse()
    
    return `${terms.join(' + ')} = ${decimalValue.value}`
  } else {
    return `${cleanValue}(${base}) = ${decimalValue.value}(10)`
  }
}

const applyPreset = (preset) => {
  inputValue.value = preset.value
  fromBase.value = preset.base
  
  copyMessage.value = `プリセット「${preset.name}」を適用しました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

const copyConversion = async (conversion) => {
  try {
    await navigator.clipboard.writeText(conversion.value)
    copyMessage.value = `${conversion.name} ${conversion.value} をコピーしました`
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('コピーに失敗しました:', err)
  }
}

const useAsInput = (conversion) => {
  inputValue.value = conversion.value
  fromBase.value = conversion.base
  
  copyMessage.value = `${conversion.name} を入力として設定しました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

// SEO
useHead({
  title: '進数変換 - Tools.tomacheese.com',
  meta: [
    { name: 'description', content: '10進数、2進数、8進数、16進数を相互変換します。プログラミングや数学の学習に便利。' },
    { name: 'keywords', content: '進数変換, 2進数, 16進数, 8進数, プログラミング, 数値変換' }
  ]
})
</script>