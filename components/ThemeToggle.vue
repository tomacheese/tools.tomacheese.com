<template>
  <div class="theme-toggle">
    <button
      @click="cycleThemeMode"
      class="theme-toggle-button"
      :title="`現在: ${getThemeModeLabel(themeMode)} / クリックで切り替え`"
      type="button"
    >
      <span
        class="theme-icon"
        role="img"
        :aria-label="getThemeModeLabel(themeMode)"
      >
        {{ getThemeModeIcon(themeMode) }}
      </span>
      <span class="theme-label">
        {{ getThemeModeLabel(themeMode) }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
// ダークモードコンポーザブル
const {
  themeMode,
  cycleThemeMode,
  getThemeModeLabel,
  getThemeModeIcon,
  initializeTheme,
} = useDarkMode()

// コンポーネントマウント時にテーマ初期化
onMounted(() => {
  initializeTheme()
})
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-toggle-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.theme-toggle-button:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-secondary);
  transform: translateY(-1px);
}

.theme-toggle-button:active {
  transform: translateY(0);
}

.theme-icon {
  font-size: 1rem;
  line-height: 1;
  transition: transform 0.2s ease;
}

.theme-toggle-button:hover .theme-icon {
  transform: scale(1.1);
}

.theme-label {
  font-size: 0.875rem;
  white-space: nowrap;
}

/* モバイルではラベルを非表示にしてアイコンのみ表示 */
@media (max-width: 640px) {
  .theme-toggle-button {
    min-width: auto;
    padding: 0.5rem;
  }

  .theme-label {
    display: none;
  }

  .theme-icon {
    font-size: 1.125rem;
  }
}

/* フォーカス表示 */
.theme-toggle-button:focus {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  .theme-toggle-button {
    border-width: 2px;
    font-weight: 600;
  }
}

/* アニメーション削減設定対応 */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle-button,
  .theme-icon {
    transition: none;
  }

  .theme-toggle-button:hover .theme-icon {
    transform: none;
  }

  .theme-toggle-button:hover {
    transform: none;
  }
}
</style>
