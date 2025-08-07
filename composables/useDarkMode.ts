/**
 * ダークモード管理用コンポーザブル
 * プライバシー重視：すべてクライアントサイドで処理
 */
import { ref, readonly } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useDarkMode = () => {
  const STORAGE_KEY = 'theme-mode'

  // リアクティブな状態管理
  const themeMode = ref<ThemeMode>('system')
  const isDark = ref(false)

  /**
   * システムのダークモード設定を取得
   */
  const getSystemPreference = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * 実際のダークモード状態を計算
   */
  const computeIsDark = (mode: ThemeMode): boolean => {
    switch (mode) {
      case 'light':
        return false
      case 'dark':
        return true
      case 'system':
        return getSystemPreference()
      default:
        return false
    }
  }

  /**
   * テーマを適用
   */
  const applyTheme = (dark: boolean) => {
    if (typeof document === 'undefined') return

    const documentElement = document.documentElement

    if (dark) {
      documentElement.setAttribute('data-theme', 'dark')
      documentElement.classList.add('dark')
    } else {
      documentElement.setAttribute('data-theme', 'light')
      documentElement.classList.remove('dark')
    }

    isDark.value = dark
  }

  /**
   * ローカルストレージから設定を読み込み
   */
  const loadThemeFromStorage = (): ThemeMode => {
    if (typeof localStorage === 'undefined') return 'system'

    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode
      return stored && ['light', 'dark', 'system'].includes(stored)
        ? stored
        : 'system'
    } catch {
      return 'system'
    }
  }

  /**
   * ローカルストレージに設定を保存
   */
  const saveThemeToStorage = (mode: ThemeMode) => {
    if (typeof localStorage === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ローカルストレージが利用できない場合は無視
    }
  }

  /**
   * テーマモードを設定
   */
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    const dark = computeIsDark(mode)
    applyTheme(dark)
    saveThemeToStorage(mode)
  }

  /**
   * ダークモードを切り替え（light ⇔ dark のトグル）
   */
  const toggleDarkMode = () => {
    const newMode = isDark.value ? 'light' : 'dark'
    setThemeMode(newMode)
  }

  /**
   * 次のテーマモードに切り替え（system → light → dark → system）
   */
  const cycleThemeMode = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark']
    const currentIndex = modes.indexOf(themeMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeMode(modes[nextIndex])
  }

  /**
   * システム設定変更の監視
   */
  const watchSystemPreference = () => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (themeMode.value === 'system') {
        const dark = computeIsDark('system')
        applyTheme(dark)
      }
    }

    // 現代的なブラウザでは addEventListener が推奨
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // 古いブラウザ対応
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }

  /**
   * テーマモードの表示用ラベル
   */
  const getThemeModeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'light':
        return 'ライト'
      case 'dark':
        return 'ダーク'
      case 'system':
        return 'システム'
      default:
        return 'システム'
    }
  }

  /**
   * 現在のテーマモードのアイコン
   */
  const getThemeModeIcon = (mode: ThemeMode): string => {
    switch (mode) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'system':
        return '🖥️'
      default:
        return '🖥️'
    }
  }

  /**
   * 初期化
   */
  const initializeTheme = () => {
    if (typeof window === 'undefined') return

    // ローカルストレージから設定を読み込み
    const savedMode = loadThemeFromStorage()
    themeMode.value = savedMode

    // 初期テーマを適用
    const dark = computeIsDark(savedMode)
    applyTheme(dark)

    // システム設定の変更を監視
    const cleanup = watchSystemPreference()

    // クリーンアップ関数を返す
    return cleanup
  }

  return {
    // 状態
    themeMode: readonly(themeMode),
    isDark: readonly(isDark),

    // アクション
    setThemeMode,
    toggleDarkMode,
    cycleThemeMode,
    initializeTheme,

    // ユーティリティ
    getThemeModeLabel,
    getThemeModeIcon,
    getSystemPreference,
  }
}
