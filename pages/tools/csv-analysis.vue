<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- ヘッダー -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">CSV分析ツール</h1>
      <p class="text-lg text-gray-600">
        CSVファイルをアップロードしてデータの基本統計情報を分析します。すべての処理はブラウザ内で完結し、データが外部に送信されることはありません。
      </p>
    </div>

    <!-- ファイルアップロード -->
    <div class="mb-8">
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors"
        :class="{
          'border-blue-400 bg-blue-50': isDragOver,
          'border-gray-300': !isDragOver,
        }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleFileDrop"
      >
        <div class="space-y-4">
          <div class="text-gray-600">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <p class="text-lg font-medium text-gray-900">
              CSVファイルをドラッグ&ドロップ
            </p>
            <p class="text-sm text-gray-500">または</p>
            <label
              for="file-upload"
              class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              ファイルを選択
            </label>
            <input
              id="file-upload"
              ref="fileInput"
              type="file"
              accept=".csv,.tsv,.txt"
              class="hidden"
              @change="handleFileSelect"
            />
          </div>
          <p class="text-xs text-gray-500">
            対応形式: CSV, TSV | 最大ファイルサイズ: 50MB
          </p>
        </div>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">エラー</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- 分析中ローディング -->
    <div
      v-if="isAnalyzing"
      class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div class="flex items-center">
        <div
          class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"
        ></div>
        <div class="ml-3 text-sm text-blue-700">ファイルを分析中...</div>
      </div>
    </div>

    <!-- 分析結果 -->
    <div v-if="analysisResult" class="space-y-6" data-testid="analysis-result">
      <!-- ファイル情報 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">ファイル情報</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600">ファイル名</div>
            <div class="text-lg font-medium text-gray-900">
              {{ analysisResult.fileName }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600">ファイルサイズ</div>
            <div class="text-lg font-medium text-gray-900">
              {{ formatCSVFileSize(analysisResult.fileSize) }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600">行数</div>
            <div class="text-lg font-medium text-gray-900">
              {{ analysisResult.rowCount.toLocaleString() }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600">列数</div>
            <div class="text-lg font-medium text-gray-900">
              {{ analysisResult.columnCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- データサマリー -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">データサマリー</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-sm text-blue-600">総セル数</div>
            <div class="text-lg font-medium text-blue-900">
              {{ analysisResult.summary.totalCells.toLocaleString() }}
            </div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-600">データあり</div>
            <div class="text-lg font-medium text-green-900">
              {{ analysisResult.summary.filledCells.toLocaleString() }}
            </div>
            <div class="text-xs text-green-700">
              {{
                (
                  (analysisResult.summary.filledCells /
                    analysisResult.summary.totalCells) *
                  100
                ).toFixed(1)
              }}%
            </div>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <div class="text-sm text-yellow-600">空セル</div>
            <div class="text-lg font-medium text-yellow-900">
              {{ analysisResult.summary.emptyCells.toLocaleString() }}
            </div>
            <div class="text-xs text-yellow-700">
              {{
                (
                  (analysisResult.summary.emptyCells /
                    analysisResult.summary.totalCells) *
                  100
                ).toFixed(1)
              }}%
            </div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <div class="text-sm text-red-600">空行</div>
            <div class="text-lg font-medium text-red-900">
              {{ analysisResult.summary.emptyRowCount.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 列別統計 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">列別統計情報</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  列名
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  データ型
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  データ数
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  空値数
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ユニーク数
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  統計情報
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="column in analysisResult.columns"
                :key="column.index"
                class="hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {{ column.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="{
                      'bg-blue-100 text-blue-800': column.type === 'number',
                      'bg-green-100 text-green-800': column.type === 'date',
                      'bg-gray-100 text-gray-800': column.type === 'string',
                    }"
                  >
                    {{ getTypeLabel(column.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ (column.statistics?.count || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ (column.statistics?.emptyCount || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ (column.statistics?.uniqueCount || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div class="space-y-1">
                    <template v-if="column.type === 'number'">
                      <div v-if="column.statistics?.mean !== undefined">
                        平均: {{ column.statistics.mean.toFixed(2) }}
                      </div>
                      <div v-if="column.statistics?.median !== undefined">
                        中央値: {{ column.statistics.median.toFixed(2) }}
                      </div>
                      <div
                        v-if="
                          column.statistics?.min !== undefined &&
                          column.statistics?.max !== undefined
                        "
                      >
                        範囲: {{ column.statistics.min }} -
                        {{ column.statistics.max }}
                      </div>
                    </template>
                    <template v-else-if="column.type === 'string'">
                      <div
                        v-if="column.statistics?.averageLength !== undefined"
                      >
                        平均文字数:
                        {{ column.statistics.averageLength.toFixed(1) }}
                      </div>
                      <div v-if="column.statistics?.mode">
                        最頻値: {{ column.statistics.mode }}
                      </div>
                    </template>
                    <template v-else-if="column.type === 'date'">
                      <div
                        v-if="
                          column.statistics?.dateRange?.earliest &&
                          column.statistics?.dateRange?.latest
                        "
                      >
                        期間:
                        {{ formatDate(column.statistics.dateRange.earliest) }} -
                        {{ formatDate(column.statistics.dateRange.latest) }}
                      </div>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 詳細統計（選択した列） -->
      <div
        v-if="selectedColumn"
        class="bg-white border border-gray-200 rounded-lg p-6"
      >
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          詳細統計: {{ selectedColumn.name }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <template v-if="selectedColumn.type === 'number'">
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">最小値</div>
              <div class="text-lg font-medium text-gray-900">
                {{ selectedColumn.statistics?.min }}
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">最大値</div>
              <div class="text-lg font-medium text-gray-900">
                {{ selectedColumn.statistics?.max }}
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">平均値</div>
              <div class="text-lg font-medium text-gray-900">
                {{ selectedColumn.statistics?.mean?.toFixed(4) }}
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">中央値</div>
              <div class="text-lg font-medium text-gray-900">
                {{ selectedColumn.statistics?.median?.toFixed(4) }}
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">標準偏差</div>
              <div class="text-lg font-medium text-gray-900">
                {{ selectedColumn.statistics?.standardDeviation?.toFixed(4) }}
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">第1四分位数</div>
              <div class="text-lg font-medium text-gray-900">
                {{ selectedColumn.statistics?.q1 }}
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">第3四分位数</div>
              <div class="text-lg font-medium text-gray-900">
                {{ selectedColumn.statistics?.q3 }}
              </div>
            </div>
          </template>
        </div>
        <button
          @click="selectedColumn = null"
          class="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          閉じる
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { parseCSV, detectDelimiter } from '~/utils/csv-json'
import {
  analyzeCSVData,
  validateFileSize,
  type CSVAnalysisResult,
  type CSVColumn,
} from '~/utils/csv-analysis'
import { formatFileSize as formatCSVFileSize } from '~/utils/imageResizer'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// SEO設定
useSeoMeta({
  title: 'CSV分析ツール',
  description:
    'CSVファイルの基本統計情報を分析・表示します。データ型の自動検出、統計計算、可視化機能を提供。',
  ogTitle: 'CSV分析ツール',
  ogDescription:
    'CSVファイルの基本統計情報を分析・表示します。データ型の自動検出、統計計算、可視化機能を提供。',
})

// リアクティブデータ
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const isAnalyzing = ref(false)
const error = ref('')
const analysisResult = ref<CSVAnalysisResult | null>(null)
const selectedColumn = ref<CSVColumn | null>(null)

/**
 * ファイル選択時の処理
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

/**
 * ファイルドロップ時の処理
 */
const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

/**
 * ファイルを処理する
 */
const processFile = async (file: File) => {
  error.value = ''
  analysisResult.value = null
  selectedColumn.value = null

  // ファイルサイズチェック
  if (!validateFileSize(file)) {
    error.value = `ファイルサイズが制限を超えています。50MB以下のファイルを選択してください。（現在: ${formatCSVFileSize(file.size)}）`
    return
  }

  // ファイル形式チェック
  const allowedTypes = ['.csv', '.tsv', '.txt']
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
  if (!allowedTypes.includes(fileExtension)) {
    error.value =
      'サポートされていないファイル形式です。CSV、TSV、TXTファイルを選択してください。'
    return
  }

  isAnalyzing.value = true

  try {
    // ファイル読み込み
    const text = await readFileAsText(file)

    // 区切り文字の自動検出
    const delimiter = detectDelimiter(text)

    // CSV解析
    const csvData = parseCSV(text, {
      delimiter,
      headers: true,
      skipEmptyRows: false,
      trimValues: true,
    })

    // データ分析
    analysisResult.value = analyzeCSVData(csvData, file.name, file.size)
  } catch (err) {
    // CSV分析中にエラーが発生しました
    // eslint-disable-next-line no-console
    console.error('CSV analysis error:', err)
    error.value =
      'ファイルの分析中にエラーが発生しました。ファイル形式を確認してください。'
  } finally {
    isAnalyzing.value = false
  }
}

/**
 * ファイルをテキストとして読み込む
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('ファイル読み込みエラー'))
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * データ型のラベルを取得
 */
const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'number':
      return '数値'
    case 'date':
      return '日付'
    case 'string':
      return '文字列'
    default:
      return '不明'
  }
}

/**
 * 日付をフォーマット
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>

<style scoped>
/* 追加のスタイリングが必要な場合はここに記述 */
</style>
