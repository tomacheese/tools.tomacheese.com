<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>クレジットカード番号検証</h1>
      <p>クレジットカード番号の妥当性をLuhnアルゴリズムで検証します。</p>
    </div>

    <div class="input-section">
      <div class="form-group">
        <label class="form-label">クレジットカード番号</label>
        <input
          v-model="cardNumber"
          type="text"
          class="form-input"
          placeholder="4111 1111 1111 1111"
          maxlength="19"
          @input="formatCardInput"
        />
        <div
          v-if="cardNumber"
          style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b"
        >
          {{ formatCardNumber(cardNumber) }}
        </div>
      </div>

      <button
        class="btn btn-primary"
        style="width: 100%"
        :disabled="!cardNumber.trim()"
        @click="validateCard"
      >
        カード番号を検証
      </button>
    </div>

    <!-- 検証結果 -->
    <div v-if="validationResult" class="result-section">
      <h3 style="margin-bottom: 1rem; color: #1e293b">検証結果</h3>

      <div class="result-box">
        <div
          style="
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
          "
        >
          <div
            :style="{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: validationResult.isValid ? '#10b981' : '#ef4444',
            }"
          ></div>
          <span style="font-size: 1.125rem; font-weight: 600">
            {{ validationResult.isValid ? '有効' : '無効' }}
          </span>
        </div>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          "
        >
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">カード情報</h4>
            <div style="font-size: 0.9rem">
              <div>番号: {{ formatCardNumber(cardNumber) }}</div>
              <div>桁数: {{ cardNumber.replace(/\D/g, '').length }}桁</div>
              <div v-if="validationResult.cardType">
                発行会社: {{ validationResult.cardType.name }}
              </div>
              <div v-else>発行会社: 不明</div>
            </div>
          </div>

          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">検証詳細</h4>
            <div style="font-size: 0.9rem">
              <div>
                Luhnチェック: {{ validationResult.luhnValid ? '✓' : '✗' }}
              </div>
              <div>
                長さチェック: {{ validationResult.lengthValid ? '✓' : '✗' }}
              </div>
              <div>
                形式チェック: {{ validationResult.formatValid ? '✓' : '✗' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- サンプルカード番号 -->
    <div style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">テスト用サンプル番号</h3>
      <div class="result-box">
        <p style="margin-bottom: 1rem; color: #64748b; font-size: 0.875rem">
          以下は検証テスト用の有効なカード番号です（実際の決済には使用できません）
        </p>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          "
        >
          <div v-for="sample in sampleCards" :key="sample.number">
            <div style="font-weight: 600; margin-bottom: 0.25rem">
              {{ sample.type }}
            </div>
            <div
              style="
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                color: #64748b;
                margin-bottom: 0.5rem;
              "
            >
              {{ formatCardNumber(sample.number) }}
            </div>
            <button
              class="btn btn-secondary"
              style="font-size: 0.75rem; padding: 0.25rem 0.5rem"
              @click="setSampleCard(sample.number)"
            >
              使用
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用方法・注意事項 -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">
        Luhnアルゴリズムについて
      </h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>クレジットカード番号の基本的な妥当性を数学的に検証します</li>
        <li>タイピングミスや無効な番号を検出できます</li>
        <li>発行会社の識別も行います（Visa、Mastercard等）</li>
        <li>実際の有効性や残高の確認はできません</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">
        セキュリティとプライバシー
      </h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>すべての処理はブラウザ内で行われ、サーバーに送信されません</li>
        <li>実際のクレジットカード番号の入力は避けてください</li>
        <li>テスト用途のみでご利用ください</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div
      v-if="copyMessage"
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 6px;
        z-index: 1000;
      "
    >
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  validateCardNumber,
  getCardType,
  formatCardNumber as formatCard,
} from '~/utils/security'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const cardNumber = ref('')
const validationResult = ref(null)
const copyMessage = ref('')

// サンプルカード番号（テスト用）
const sampleCards = [
  { type: 'Visa', number: '4111111111111111' },
  { type: 'Visa', number: '4012888888881881' },
  { type: 'Mastercard', number: '5555555555554444' },
  { type: 'Mastercard', number: '5105105105105100' },
  { type: 'American Express', number: '378282246310005' },
  { type: 'American Express', number: '371449635398431' },
  { type: 'Discover', number: '6011111111111117' },
  { type: 'JCB', number: '3530111333300000' },
]

// メソッド
const formatCardInput = event => {
  // 数字以外を除去し、4桁区切りで表示
  let value = event.target.value.replace(/\D/g, '')
  value = value.substring(0, 19) // 最大19桁
  cardNumber.value = value
}

const formatCardNumber = number => {
  return formatCard(number)
}

const validateCard = () => {
  if (!cardNumber.value.trim()) return

  const cleanNumber = cardNumber.value.replace(/\D/g, '')
  const luhnValid = validateCardNumber(cleanNumber)
  const cardType = getCardType(cleanNumber)

  // 長さ検証
  let lengthValid = false
  if (cardType) {
    lengthValid = cardType.length.includes(cleanNumber.length)
  } else {
    lengthValid = cleanNumber.length >= 13 && cleanNumber.length <= 19
  }

  // 形式検証（基本的な数字チェック）
  const formatValid = /^\d+$/.test(cleanNumber) && cleanNumber.length >= 13

  validationResult.value = {
    isValid: luhnValid && lengthValid && formatValid,
    luhnValid,
    lengthValid,
    formatValid,
    cardType,
  }
}

const setSampleCard = number => {
  cardNumber.value = number
  validateCard()

  copyMessage.value = 'サンプル番号が設定されました'
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

// SEO
useHead({
  title: 'クレジットカード番号検証 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'クレジットカード番号の妥当性をLuhnアルゴリズムで検証します。発行会社の識別も行います。',
    },
    {
      name: 'keywords',
      content:
        'クレジットカード検証, Luhnアルゴリズム, カード番号チェック, セキュリティ',
    },
  ],
})
</script>
