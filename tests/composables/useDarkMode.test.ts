import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, computed, readonly } from 'vue'

// Vue reactivity APIのモック
vi.mock('vue', () => ({
  ref: vi.fn((value) => ({
    value,
  })),
  computed: vi.fn((getter) => ({
    value: getter(),
  })),
  readonly: vi.fn((value) => value),
  onMounted: vi.fn(),
  onBeforeUnmount: vi.fn(),
}))

import { useDarkMode } from '~/composables/useDarkMode'

// モックの設定
const mockLocalStorage = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store.set(key, value)
  }),
  clear: vi.fn(() => mockLocalStorage.store.clear()),
}

// MediaQueryList のモック
class MockMediaQueryList {
  matches: boolean
  media: string
  private listeners: Array<(event: MediaQueryListEvent) => void> = []

  constructor(query: string, matches = false) {
    this.media = query
    this.matches = matches
  }

  addEventListener(
    type: string,
    listener: (event: MediaQueryListEvent) => void
  ) {
    if (type === 'change') {
      this.listeners.push(listener)
    }
  }

  removeEventListener(
    type: string,
    listener: (event: MediaQueryListEvent) => void
  ) {
    if (type === 'change') {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  dispatchEvent(event: MediaQueryListEvent) {
    this.listeners.forEach(listener => listener(event))
    return true
  }

  // テスト用のヘルパーメソッド
  simulateChange(matches: boolean) {
    this.matches = matches
    const event = new Event('change') as MediaQueryListEvent
    Object.defineProperty(event, 'matches', { value: matches })
    Object.defineProperty(event, 'media', { value: this.media })
    this.dispatchEvent(event)
  }
}

describe('useDarkMode', () => {
  let mockMatchMedia: MockMediaQueryList

  beforeEach(() => {
    // localStorage のモック
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    // matchMedia のモック
    mockMatchMedia = new MockMediaQueryList('(prefers-color-scheme: dark)')
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => mockMatchMedia),
      writable: true,
    })

    // document のモック
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
      writable: true,
    })

    // ストアをクリア
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('デフォルトでsystemモードに設定される', () => {
    const darkMode = useDarkMode()

    expect(darkMode.mode.value).toBe('system')
    expect(darkMode.isSystem.value).toBe(true)
  })

  it('lightモードの設定と表示名', () => {
    const darkMode = useDarkMode()

    darkMode.setThemeMode('light')
    expect(darkMode.mode.value).toBe('light')
    expect(darkMode.getThemeName()).toBe('ライトモード')
    expect(darkMode.getThemeIcon()).toBe('☀️')
  })

  it('darkモードの設定と表示名', () => {
    const darkMode = useDarkMode()

    darkMode.setThemeMode('dark')
    expect(darkMode.mode.value).toBe('dark')
    expect(darkMode.getThemeName()).toBe('ダークモード')
    expect(darkMode.getThemeIcon()).toBe('🌙')
  })

  it('systemモードの設定と表示名', () => {
    const darkMode = useDarkMode()

    darkMode.setThemeMode('system')
    expect(darkMode.mode.value).toBe('system')
    expect(darkMode.getThemeName()).toBe('システム設定')
    expect(darkMode.getThemeIcon()).toBe('💻')
  })

  it('テーマモードの循環切り替え', () => {
    const darkMode = useDarkMode()

    // light → dark → system → light
    darkMode.setThemeMode('light')
    expect(darkMode.mode.value).toBe('light')

    darkMode.toggleThemeMode()
    expect(darkMode.mode.value).toBe('dark')

    darkMode.toggleThemeMode()
    expect(darkMode.mode.value).toBe('system')

    darkMode.toggleThemeMode()
    expect(darkMode.mode.value).toBe('light')
  })

  it('localStorageに設定を保存', () => {
    const darkMode = useDarkMode()

    darkMode.setThemeMode('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme-mode', 'dark')
  })

  it('localStorageから設定を復元', () => {
    mockLocalStorage.setItem('theme-mode', 'dark')

    const darkMode = useDarkMode()
    
    darkMode.initialize()
    expect(darkMode.mode.value).toBe('dark')
  })

  it('不正なlocalStorage値を無視', () => {
    mockLocalStorage.setItem('theme-mode', 'invalid')

    const darkMode = useDarkMode()
    
    darkMode.initialize()
    expect(darkMode.mode.value).toBe('system')
  })

  it('systemモードでシステム設定に従う', () => {
    const darkMode = useDarkMode()

    // システムがダークモード
    mockMatchMedia.matches = true
    darkMode.initialize()
    darkMode.setThemeMode('system')
    expect(darkMode.isDark.value).toBe(true)

    // システムがライトモード
    mockMatchMedia.matches = false
    darkMode.initialize()
    darkMode.setThemeMode('system')
    expect(darkMode.isDark.value).toBe(false)
  })

  it('lightモードで強制的にライト', () => {
    const darkMode = useDarkMode()

    mockMatchMedia.matches = true // システムはダーク
    darkMode.initialize()
    darkMode.setThemeMode('light')
    expect(darkMode.isDark.value).toBe(false)
  })

  it('darkモードで強制的にダーク', () => {
    const darkMode = useDarkMode()

    mockMatchMedia.matches = false // システムはライト
    darkMode.initialize()
    darkMode.setThemeMode('dark')
    expect(darkMode.isDark.value).toBe(true)
  })

  it('システム設定変更を監視', () => {
    const darkMode = useDarkMode()

    darkMode.initialize()
    darkMode.setThemeMode('system')

    // システム設定変更をシミュレート
    mockMatchMedia.simulateChange(true)
    expect(darkMode.isDark.value).toBe(true)

    mockMatchMedia.simulateChange(false)
    expect(darkMode.isDark.value).toBe(false)
  })

  it('HTMLクラスの適用', () => {
    const darkMode = useDarkMode()

    darkMode.initialize()
    
    // ダークモード適用
    darkMode.setThemeMode('dark')
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')

    // ライトモード適用
    darkMode.setThemeMode('light')
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
  })

  it('state計算プロパティの値', () => {
    const darkMode = useDarkMode()

    darkMode.setThemeMode('dark')
    const state = darkMode.state.value
    
    expect(state.mode).toBe('dark')
    expect(state.isDark).toBe(true)
    expect(state.isSystem).toBe(false)
  })

  it('異なるテーマモードの表示名を取得', () => {
    const darkMode = useDarkMode()

    expect(darkMode.getThemeName('light')).toBe('ライトモード')
    expect(darkMode.getThemeName('dark')).toBe('ダークモード')
    expect(darkMode.getThemeName('system')).toBe('システム設定')
  })

  it('異なるテーマモードのアイコンを取得', () => {
    const darkMode = useDarkMode()

    expect(darkMode.getThemeIcon('light')).toBe('☀️')
    expect(darkMode.getThemeIcon('dark')).toBe('🌙')
    expect(darkMode.getThemeIcon('system')).toBe('💻')
  })

  it('クリーンアップ関数が正常に動作', () => {
    const darkMode = useDarkMode()

    const cleanup = darkMode.initialize()
    expect(typeof cleanup).toBe('function')

    // クリーンアップを実行しても例外が発生しない
    expect(() => cleanup()).not.toThrow()
  })
})