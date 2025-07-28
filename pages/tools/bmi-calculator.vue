<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>BMI計算</h1>
      <p>身長と体重からBMI値を計算し、健康状態を判定します。</p>
    </div>

    <div class="form-group">
      <label class="form-label" for="height">身長 (m)</label>
      <input
        id="height"
        v-model.number="height"
        type="number"
        step="0.01"
        min="0.1"
        max="3"
        placeholder="例: 1.70"
        class="form-input"
      />
      <p class="form-help">
        メートル単位で入力してください（例：170cm → 1.70）
      </p>
    </div>

    <div class="form-group">
      <label class="form-label" for="weight">体重 (kg)</label>
      <input
        id="weight"
        v-model.number="weight"
        type="number"
        step="0.1"
        min="1"
        max="500"
        placeholder="例: 65"
        class="form-input"
      />
    </div>

    <div v-if="result" class="result-section">
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        "
      >
        <div class="result-box">
          <h3>BMI値</h3>
          <div class="result-value">{{ result.bmi }}</div>
        </div>

        <div class="result-box">
          <h3>判定</h3>
          <div
            class="result-value"
            :class="result.isHealthy ? 'healthy' : 'unhealthy'"
          >
            {{ result.category }}
          </div>
        </div>
      </div>

      <div class="result-description">
        <h4>アドバイス</h4>
        <p>{{ result.description }}</p>
      </div>

      <div class="bmi-chart">
        <h4>BMI分類表</h4>
        <div class="chart-grid">
          <div class="chart-item" :class="{ active: result.bmi < 18.5 }">
            <span class="range">18.5未満</span>
            <span class="category">痩せ</span>
          </div>
          <div
            class="chart-item"
            :class="{ active: result.bmi >= 18.5 && result.bmi < 25 }"
          >
            <span class="range">18.5-24.9</span>
            <span class="category">普通体重</span>
          </div>
          <div
            class="chart-item"
            :class="{ active: result.bmi >= 25 && result.bmi < 30 }"
          >
            <span class="range">25.0-29.9</span>
            <span class="category">肥満(1度)</span>
          </div>
          <div
            class="chart-item"
            :class="{ active: result.bmi >= 30 && result.bmi < 35 }"
          >
            <span class="range">30.0-34.9</span>
            <span class="category">肥満(2度)</span>
          </div>
          <div class="chart-item" :class="{ active: result.bmi >= 35 }">
            <span class="range">35.0以上</span>
            <span class="category">肥満(3度以上)</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4>使用方法</h4>
      <ul>
        <li>身長をメートル単位で入力してください（例：170cm → 1.70）</li>
        <li>体重をキログラム単位で入力してください</li>
        <li>BMI = 体重(kg) ÷ 身長(m)² で計算されます</li>
        <li>日本肥満学会の基準に基づいて判定を行います</li>
      </ul>

      <h4>注意事項</h4>
      <ul>
        <li>BMIは成人向けの指標です</li>
        <li>筋肉質の方や高齢者では判定が正確でない場合があります</li>
        <li>健康状態の詳細は医師にご相談ください</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { calculateBMI, type BMIResult } from "~/utils/health";

definePageMeta({
  layout: "tool",
});

const height = ref<number>();
const weight = ref<number>();
const error = ref("");

const result = computed((): BMIResult | null => {
  error.value = "";

  // ゼロ値チェック（入力があるがゼロの場合）
  if (height.value === 0 || weight.value === 0) {
    if (height.value === 0 || weight.value === 0) {
      error.value = "身長と体重は正の数である必要があります";
      return null;
    }
  }

  if (!height.value || !weight.value) {
    return null;
  }

  try {
    return calculateBMI(weight.value, height.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "計算エラーが発生しました";
    return null;
  }
});

useHead({
  title: "BMI計算 - tools.tomacheese.com",
  meta: [
    {
      name: "description",
      content:
        "身長と体重からBMI値を計算し、健康状態を判定します。日本肥満学会基準に基づく正確なBMI計算ツール。",
    },
    {
      name: "keywords",
      content: "BMI, 計算, 肥満度, 健康, 体重, 身長, ボディマス指数",
    },
  ],
});
</script>

<style scoped>
.result-section {
  margin-top: 1.5rem;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.result-value.healthy {
  color: #10b981;
}

.result-value.unhealthy {
  color: #ef4444;
}

.result-description {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-left: 4px solid #0ea5e9;
  border-radius: 0 6px 6px 0;
}

.bmi-chart {
  margin-top: 1.5rem;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.chart-item {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  transition: all 0.2s ease;
}

.chart-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.chart-item .range {
  display: block;
  font-weight: bold;
  color: #374151;
}

.chart-item .category {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
}

.form-help {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .result-value {
    font-size: 1.5rem;
  }
}
</style>
