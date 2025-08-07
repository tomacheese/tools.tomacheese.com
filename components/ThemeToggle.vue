<template>
  <button
    class="theme-toggle-button"
    :aria-label="isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'"
    :title="isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'"
    @click="toggleTheme"
  >
    <!-- ライトモード時は太陽アイコン -->
    <svg
      v-if="!isDark"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      class="theme-icon"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>

    <!-- ダークモード時は月アイコン -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      class="theme-icon"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
// テーマ管理コンポーザブルを使用
const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-button:hover {
  background-color: var(--color-border);
  color: var(--color-text-accent);
  transform: translateY(-1px);
}

.theme-toggle-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.theme-toggle-button:hover .theme-icon {
  transform: rotate(15deg);
}
</style>
