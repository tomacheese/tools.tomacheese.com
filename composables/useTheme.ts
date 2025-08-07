/**
 * テーマ管理コンポーザブル
 * ダークモード・ライトモードの切り替えと永続化を担当
 */

export type Theme = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  theme: Ref<Theme>
  isDark: ComputedRef<boolean>
  setTheme: (newTheme: Theme) => void
  toggleTheme: () => void
}

/**
 * テーマ管理フック
 * システム設定の検出、ローカルストレージでの永続化、テーマ切り替えを提供
 */
export const useTheme = (): UseThemeReturn => {
  // システムのダークモード設定を検出
  const getSystemTheme = (): boolean => {
    if (process.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }

  // ローカルストレージからテーマ設定を読み込み
  const getStoredTheme = (): Theme => {
    if (process.client) {
      const stored = localStorage.getItem('theme') as Theme
      return stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'system'
    }
    return 'system'
  }

  // テーマ設定をリアクティブに管理
  const theme = ref<Theme>(getStoredTheme())

  // 実際のダークモード状態を計算
  const isDark = computed(() => {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    return getSystemTheme()
  })

  // テーマをローカルストレージに保存
  const saveTheme = (newTheme: Theme) => {
    if (process.client) {
      localStorage.setItem('theme', newTheme)
    }
  }

  // HTML要素にテーマ属性を設定
  const applyTheme = (isDarkMode: boolean) => {
    if (process.client) {
      document.documentElement.setAttribute(
        'data-theme',
        isDarkMode ? 'dark' : 'light'
      )
    }
  }

  // テーマ設定を変更
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    saveTheme(newTheme)

    const darkMode =
      newTheme === 'dark' || (newTheme === 'system' && getSystemTheme())
    applyTheme(darkMode)
  }

  // ライト/ダークテーマを切り替え
  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  // システムのテーマ設定変更を監視
  if (process.client) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme(mediaQuery.matches)
      }
    })
  }

  // 初回テーマ適用
  watchEffect(() => {
    applyTheme(isDark.value)
  })

  return {
    theme: readonly(theme),
    isDark,
    setTheme,
    toggleTheme,
  }
}
