export type ThemeMode = 'light' | 'dark' | 'system'

export interface DarkModeState {
  mode: ThemeMode
  isDark: boolean
  isSystem: boolean
}

/**
 * ダークモード管理用のcomposable
 * プライバシー重視のため、完全にクライアントサイドで動作
 */
export const useDarkMode = () => {
  // リアクティブな状態管理
  const mode = ref<ThemeMode>('system')
  const isDark = ref(false)

  // システム設定の検出
  const systemPrefersDark = ref(false)

  /**
   * システムのダークモード設定を検出
   */
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined') {
      systemPrefersDark.value = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
    }
  }

  /**
   * 現在のダークモード状態を計算
   */
  const computeIsDark = () => {
    switch (mode.value) {
      case 'dark':
        return true
      case 'light':
        return false
      case 'system':
        return systemPrefersDark.value
      default:
        return false
    }
  }

  /**
   * HTML要素にダークモードクラスを適用
   */
  const applyTheme = (dark: boolean) => {
    if (typeof document !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  /**
   * テーマを更新
   */
  const updateTheme = () => {
    const dark = computeIsDark()
    isDark.value = dark
    applyTheme(dark)
  }

  /**
   * テーマモードを設定
   */
  const setThemeMode = (newMode: ThemeMode) => {
    mode.value = newMode
    
    // localStorageに保存（プライバシー重視のため、設定のみ保存）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme-mode', newMode)
    }
    
    updateTheme()
  }

  /**
   * 次のテーマモードに循環切り替え
   * light → dark → system → light
   */
  const toggleThemeMode = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(mode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeMode(modes[nextIndex])
  }

  /**
   * 初期化処理
   */
  const initialize = () => {
    // システム設定を検出
    detectSystemTheme()
    
    // localStorageから設定を読み込み
    if (typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        mode.value = savedMode
      }
    }
    
    // 初回テーマ適用
    updateTheme()
    
    // システム設定変更の監視
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        systemPrefersDark.value = mediaQuery.matches
        if (mode.value === 'system') {
          updateTheme()
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // クリーンアップのためのハンドラ返却
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
    
    return () => {}
  }

  // 計算プロパティ
  const isSystem = computed(() => mode.value === 'system')
  
  // 状態オブジェクト
  const state = computed<DarkModeState>(() => ({
    mode: mode.value,
    isDark: isDark.value,
    isSystem: isSystem.value,
  }))

  /**
   * テーマ表示用の名前を取得
   */
  const getThemeName = (themeMode?: ThemeMode) => {
    const targetMode = themeMode ?? mode.value
    switch (targetMode) {
      case 'light':
        return 'ライトモード'
      case 'dark':
        return 'ダークモード'
      case 'system':
        return 'システム設定'
      default:
        return 'システム設定'
    }
  }

  /**
   * テーマアイコンを取得
   */
  const getThemeIcon = (themeMode?: ThemeMode) => {
    const targetMode = themeMode ?? mode.value
    switch (targetMode) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'system':
        return '💻'
      default:
        return '💻'
    }
  }

  return {
    // 状態
    mode: readonly(mode),
    isDark: readonly(isDark),
    isSystem,
    systemPrefersDark: readonly(systemPrefersDark),
    state,
    
    // メソッド
    setThemeMode,
    toggleThemeMode,
    initialize,
    getThemeName,
    getThemeIcon,
  }
}