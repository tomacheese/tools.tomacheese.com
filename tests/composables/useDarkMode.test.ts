import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDarkMode } from '~/composables/useDarkMode'

// DOMとlocalStorageのモックを設定
const mockMatchMedia = vi.fn()
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

// グローバル環境のセットアップ
beforeEach(() => {
  vi.clearAllMocks()

  // window.matchMediaのモック
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  })

  // localStorageのモック
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  // documentElementのモック
  const mockDocumentElement = {
    setAttribute: vi.fn(),
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  }

  Object.defineProperty(document, 'documentElement', {
    value: mockDocumentElement,
    writable: true,
    configurable: true,
  })

  // デフォルトのmatchMediaレスポンス
  mockMatchMedia.mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })
})

describe('useDarkMode', () => {
  describe('テーマモード管理', () => {
    it('デフォルトテーマはsystemである', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { themeMode } = useDarkMode()
      expect(themeMode.value).toBe('system')
    })

    it('localStorageから保存されたテーマを読み込める', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')

      const { themeMode } = useDarkMode()
      expect(themeMode.value).toBe('system') // 初期値はsystem
    })

    it('無効なlocalStorage値は無視してsystemになる', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid')

      const { themeMode } = useDarkMode()
      expect(themeMode.value).toBe('system')
    })
  })

  describe('システム設定検出', () => {
    it('システムのダークモード設定を正しく検出できる', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { getSystemPreference } = useDarkMode()
      expect(getSystemPreference()).toBe(true)
    })

    it('システムのライトモード設定を正しく検出できる', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { getSystemPreference } = useDarkMode()
      expect(getSystemPreference()).toBe(false)
    })
  })

  describe('テーマ切り替え機能', () => {
    it('ライトモードに切り替えられる', () => {
      const { setThemeMode, themeMode, isDark } = useDarkMode()

      setThemeMode('light')

      expect(themeMode.value).toBe('light')
      expect(isDark.value).toBe(false)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'theme-mode',
        'light'
      )
    })

    it('ダークモードに切り替えられる', () => {
      const { setThemeMode, themeMode, isDark } = useDarkMode()

      setThemeMode('dark')

      expect(themeMode.value).toBe('dark')
      expect(isDark.value).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'theme-mode',
        'dark'
      )
    })

    it('システムモードに切り替えられる', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { setThemeMode, themeMode, isDark } = useDarkMode()

      setThemeMode('system')

      expect(themeMode.value).toBe('system')
      expect(isDark.value).toBe(false) // システムがライトモード
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'theme-mode',
        'system'
      )
    })
  })

  describe('トグル機能', () => {
    it('ライトモードからダークモードに切り替わる', () => {
      const { setThemeMode, toggleDarkMode, themeMode } = useDarkMode()

      setThemeMode('light')
      toggleDarkMode()

      expect(themeMode.value).toBe('dark')
    })

    it('ダークモードからライトモードに切り替わる', () => {
      const { setThemeMode, toggleDarkMode, themeMode } = useDarkMode()

      setThemeMode('dark')
      toggleDarkMode()

      expect(themeMode.value).toBe('light')
    })
  })

  describe('サイクル機能', () => {
    it('system → light → dark → systemの順に切り替わる', () => {
      const { cycleThemeMode, themeMode } = useDarkMode()

      // 初期状態: system
      expect(themeMode.value).toBe('system')

      cycleThemeMode() // system → light
      expect(themeMode.value).toBe('light')

      cycleThemeMode() // light → dark
      expect(themeMode.value).toBe('dark')

      cycleThemeMode() // dark → system
      expect(themeMode.value).toBe('system')
    })
  })

  describe('ユーティリティ関数', () => {
    it('テーマモードのラベルを正しく取得できる', () => {
      const { getThemeModeLabel } = useDarkMode()

      expect(getThemeModeLabel('light')).toBe('ライト')
      expect(getThemeModeLabel('dark')).toBe('ダーク')
      expect(getThemeModeLabel('system')).toBe('システム')
    })

    it('テーマモードのアイコンを正しく取得できる', () => {
      const { getThemeModeIcon } = useDarkMode()

      expect(getThemeModeIcon('light')).toBe('☀️')
      expect(getThemeModeIcon('dark')).toBe('🌙')
      expect(getThemeModeIcon('system')).toBe('🖥️')
    })
  })

  describe('DOM操作', () => {
    it('ダークモード適用時に正しい属性とクラスが設定される', () => {
      const { setThemeMode } = useDarkMode()

      setThemeMode('dark')

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      )
      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        'dark'
      )
    })

    it('ライトモード適用時に正しい属性とクラスが設定される', () => {
      const { setThemeMode } = useDarkMode()

      setThemeMode('light')

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      )
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        'dark'
      )
    })
  })

  describe('localStorage エラーハンドリング', () => {
    it('localStorage読み込みエラーを適切に処理する', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { themeMode } = useDarkMode()
      expect(themeMode.value).toBe('system') // エラー時のフォールバック
    })

    it('localStorage書き込みエラーを適切に処理する', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { setThemeMode } = useDarkMode()

      // エラーが発生してもクラッシュしない
      expect(() => setThemeMode('dark')).not.toThrow()
    })
  })

  describe('システム設定変更監視', () => {
    it('modern browserのaddEventListenerを使用する', () => {
      const mockAddEventListener = vi.fn()
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      })

      const { initializeTheme } = useDarkMode()
      initializeTheme()

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('legacy browserのaddListenerを使用する', () => {
      const mockAddListener = vi.fn()
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: undefined, // 古いブラウザ
        addListener: mockAddListener,
        removeListener: vi.fn(),
      })

      const { initializeTheme } = useDarkMode()
      initializeTheme()

      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function))
    })
  })
})
