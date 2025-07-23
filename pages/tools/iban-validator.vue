<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>IBAN検証</h1>
      <p>国際銀行口座番号（IBAN）の妥当性を検証します。</p>
    </div>

    <div class="input-section">
      <div class="form-group">
        <label class="form-label">IBAN番号</label>
        <input
          v-model="ibanNumber"
          type="text"
          class="form-input"
          placeholder="GB29 NWBK 6016 1331 9268 19"
          maxlength="34"
          style="text-transform: uppercase"
          @input="formatIbanInput"
        />
        <div
          v-if="ibanNumber"
          style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b"
        >
          フォーマット済み: {{ formatIBAN(ibanNumber) }}
        </div>
      </div>

      <button
        class="btn btn-primary"
        style="width: 100%"
        :disabled="!ibanNumber.trim()"
        @click="validateIban"
      >
        IBAN番号を検証
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
            {{ validationResult.isValid ? '有効なIBAN' : '無効なIBAN' }}
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
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">IBAN情報</h4>
            <div style="font-size: 0.9rem">
              <div>番号: {{ formatIBAN(ibanNumber) }}</div>
              <div>長さ: {{ ibanNumber.replace(/\s/g, '').length }}文字</div>
              <div v-if="validationResult.countryCode">
                国コード: {{ validationResult.countryCode }}
              </div>
              <div v-if="validationResult.countryName">
                国名: {{ validationResult.countryName }}
              </div>
            </div>
          </div>

          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">検証詳細</h4>
            <div style="font-size: 0.9rem">
              <div>
                長さチェック: {{ validationResult.lengthValid ? '✓' : '✗' }}
              </div>
              <div>
                形式チェック: {{ validationResult.formatValid ? '✓' : '✗' }}
              </div>
              <div>
                MOD-97チェック: {{ validationResult.mod97Valid ? '✓' : '✗' }}
              </div>
              <div>
                国コード: {{ validationResult.countryValid ? '✓' : '✗' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- サンプルIBAN番号 -->
    <div style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">テスト用サンプルIBAN</h3>
      <div class="result-box">
        <p style="margin-bottom: 1rem; color: #64748b; font-size: 0.875rem">
          以下は検証テスト用の有効なIBAN番号です（実際の口座番号ではありません）
        </p>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          "
        >
          <div v-for="sample in sampleIbans" :key="sample.iban">
            <div style="font-weight: 600; margin-bottom: 0.25rem">
              {{ sample.country }}
            </div>
            <div
              style="
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                color: #64748b;
                margin-bottom: 0.5rem;
              "
            >
              {{ formatIBAN(sample.iban) }}
            </div>
            <button
              class="btn btn-secondary"
              style="font-size: 0.75rem; padding: 0.25rem 0.5rem"
              @click="setSampleIban(sample.iban)"
            >
              使用
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- IBANについての説明 -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">IBANについて</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>
          IBAN（International Bank Account
          Number）は国際銀行口座番号の標準形式です
        </li>
        <li>国際送金において口座番号を一意に識別するために使用されます</li>
        <li>MOD-97アルゴリズムによってチェックサムが検証されます</li>
        <li>
          国コード（2文字）+ チェックデジット（2桁）+
          国内銀行口座識別子で構成されます
        </li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">
        セキュリティとプライバシー
      </h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>すべての処理はブラウザ内で行われ、サーバーに送信されません</li>
        <li>実際の銀行口座番号の入力は避けてください</li>
        <li>テスト・検証用途のみでご利用ください</li>
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
  validateIBAN,
  getIBANCountryCode,
  formatIBAN as formatIban,
} from '~/utils/security'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const ibanNumber = ref('')
const validationResult = ref(null)
const copyMessage = ref('')

// 国コードと国名のマッピング
const countryNames = {
  AD: 'アンドラ',
  AE: 'アラブ首長国連邦',
  AL: 'アルバニア',
  AT: 'オーストリア',
  AZ: 'アゼルバイジャン',
  BA: 'ボスニア・ヘルツェゴビナ',
  BE: 'ベルギー',
  BG: 'ブルガリア',
  BH: 'バーレーン',
  BR: 'ブラジル',
  BY: 'ベラルーシ',
  CH: 'スイス',
  CR: 'コスタリカ',
  CY: 'キプロス',
  CZ: 'チェコ',
  DE: 'ドイツ',
  DK: 'デンマーク',
  DO: 'ドミニカ共和国',
  EE: 'エストニア',
  EG: 'エジプト',
  ES: 'スペイン',
  FI: 'フィンランド',
  FO: 'フェロー諸島',
  FR: 'フランス',
  GB: 'イギリス',
  GE: 'ジョージア',
  GI: 'ジブラルタル',
  GL: 'グリーンランド',
  GR: 'ギリシャ',
  GT: 'グアテマラ',
  HR: 'クロアチア',
  HU: 'ハンガリー',
  IE: 'アイルランド',
  IL: 'イスラエル',
  IS: 'アイスランド',
  IT: 'イタリア',
  JO: 'ヨルダン',
  KW: 'クウェート',
  KZ: 'カザフスタン',
  LB: 'レバノン',
  LC: 'セントルシア',
  LI: 'リヒテンシュタイン',
  LT: 'リトアニア',
  LU: 'ルクセンブルク',
  LV: 'ラトビア',
  MC: 'モナコ',
  MD: 'モルドバ',
  ME: 'モンテネグロ',
  MK: '北マケドニア',
  MR: 'モーリタニア',
  MT: 'マルタ',
  MU: 'モーリシャス',
  NL: 'オランダ',
  NO: 'ノルウェー',
  PK: 'パキスタン',
  PL: 'ポーランド',
  PS: 'パレスチナ',
  PT: 'ポルトガル',
  QA: 'カタール',
  RO: 'ルーマニア',
  RS: 'セルビア',
  SA: 'サウジアラビア',
  SE: 'スウェーデン',
  SI: 'スロベニア',
  SK: 'スロバキア',
  SM: 'サンマリノ',
  TN: 'チュニジア',
  TR: 'トルコ',
  UA: 'ウクライナ',
  VG: 'イギリス領ヴァージン諸島',
  XK: 'コソボ',
}

// サンプルIBAN番号（テスト用）
const sampleIbans = [
  { country: 'ドイツ', iban: 'DE89370400440532013000' },
  { country: 'イギリス', iban: 'GB29NWBK60161331926819' },
  { country: 'フランス', iban: 'FR1420041010050500013M02606' },
  { country: 'イタリア', iban: 'IT60X0542811101000000123456' },
  { country: 'スペイン', iban: 'ES9121000418450200051332' },
  { country: 'オランダ', iban: 'NL91ABNA0417164300' },
  { country: 'ベルギー', iban: 'BE68539007547034' },
  { country: 'スイス', iban: 'CH9300762011623852957' },
]

// メソッド
const formatIbanInput = event => {
  // 大文字に変換し、不要な文字を除去
  let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  value = value.substring(0, 34) // 最大34文字
  ibanNumber.value = value
}

const formatIBAN = iban => {
  return formatIban(iban)
}

const validateIban = () => {
  if (!ibanNumber.value.trim()) return

  const cleanIban = ibanNumber.value.replace(/\s/g, '').toUpperCase()
  const isValid = validateIBAN(cleanIban)
  const countryCode = getIBANCountryCode(cleanIban)

  // 個別検証
  const lengthValid = cleanIban.length >= 15 && cleanIban.length <= 34
  const formatValid = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)
  const countryValid = countryCode && countryNames[countryCode] !== undefined

  // MOD-97検証（validateIBANの内部実装と同じロジック）
  let mod97Valid = false
  if (formatValid && lengthValid) {
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4)
    let numericString = ''
    for (const char of rearranged) {
      if (char >= 'A' && char <= 'Z') {
        numericString += (char.charCodeAt(0) - 55).toString()
      } else {
        numericString += char
      }
    }

    let remainder = 0
    for (const digit of numericString) {
      remainder = (remainder * 10 + parseInt(digit)) % 97
    }
    mod97Valid = remainder === 1
  }

  validationResult.value = {
    isValid,
    lengthValid,
    formatValid,
    mod97Valid,
    countryValid,
    countryCode,
    countryName: countryCode ? countryNames[countryCode] : null,
  }
}

const setSampleIban = iban => {
  ibanNumber.value = iban
  validateIban()

  copyMessage.value = 'サンプルIBANが設定されました'
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

// SEO
useHead({
  title: 'IBAN検証 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        '国際銀行口座番号（IBAN）の妥当性をMOD-97アルゴリズムで検証します。',
    },
    {
      name: 'keywords',
      content: 'IBAN検証, 国際銀行口座番号, MOD-97, 銀行口座検証',
    },
  ],
})
</script>
