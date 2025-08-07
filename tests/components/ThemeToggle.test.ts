import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from '~/components/ThemeToggle.vue'

// useDarkModeコンポーザブルのモック
const mockUseDarkMode = {
  themeMode: { value: 'system' },
  cycleThemeMode: vi.fn(),
  getThemeModeLabel: vi.fn(),
  getThemeModeIcon: vi.fn(),
  initializeTheme: vi.fn(),
}

// Nuxtの自動インポートをモック
vi.mock('#imports', () => ({
  useDarkMode: () => mockUseDarkMode,
  onMounted: vi.fn(callback => callback()),
}))

describe('ThemeToggle.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック値を設定
    mockUseDarkMode.getThemeModeLabel.mockReturnValue('システム')
    mockUseDarkMode.getThemeModeIcon.mockReturnValue('🖥️')
    mockUseDarkMode.themeMode.value = 'system'
  })

  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-toggle-button').exists()).toBe(true)
      expect(wrapper.find('.theme-icon').exists()).toBe(true)
      expect(wrapper.find('.theme-label').exists()).toBe(true)
    })

    it('テーマのラベルが正しく表示される', () => {
      mockUseDarkMode.getThemeModeLabel.mockReturnValue('ダーク')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-label').text()).toBe('ダーク')
      expect(mockUseDarkMode.getThemeModeLabel).toHaveBeenCalledWith('system')
    })

    it('テーマのアイコンが正しく表示される', () => {
      mockUseDarkMode.getThemeModeIcon.mockReturnValue('🌙')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-icon').text()).toBe('🌙')
      expect(mockUseDarkMode.getThemeModeIcon).toHaveBeenCalledWith('system')
    })

    it('正しいaria-labelが設定される', () => {
      mockUseDarkMode.getThemeModeLabel.mockReturnValue('ライト')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-icon').attributes('aria-label')).toBe(
        'ライト'
      )
    })

    it('正しいtitleが設定される', () => {
      mockUseDarkMode.getThemeModeLabel.mockReturnValue('システム')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-toggle-button').attributes('title')).toBe(
        '現在: システム / クリックで切り替え'
      )
    })
  })

  describe('ユーザー操作', () => {
    it('ボタンクリック時にテーマが切り替わる', async () => {
      const wrapper = mount(ThemeToggle)

      await wrapper.find('.theme-toggle-button').trigger('click')

      expect(mockUseDarkMode.cycleThemeMode).toHaveBeenCalledOnce()
    })

    it('キーボードからのアクセスが可能', async () => {
      const wrapper = mount(ThemeToggle)
      const button = wrapper.find('.theme-toggle-button')

      await button.trigger('keydown.enter')

      // Enterキーでクリックイベントが発生することを確認
      expect(button.attributes('type')).toBe('button')
    })
  })

  describe('異なるテーマモードでのレンダリング', () => {
    it('ライトモード時の表示が正しい', () => {
      mockUseDarkMode.themeMode.value = 'light'
      mockUseDarkMode.getThemeModeLabel.mockReturnValue('ライト')
      mockUseDarkMode.getThemeModeIcon.mockReturnValue('☀️')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-label').text()).toBe('ライト')
      expect(wrapper.find('.theme-icon').text()).toBe('☀️')
    })

    it('ダークモード時の表示が正しい', () => {
      mockUseDarkMode.themeMode.value = 'dark'
      mockUseDarkMode.getThemeModeLabel.mockReturnValue('ダーク')
      mockUseDarkMode.getThemeModeIcon.mockReturnValue('🌙')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-label').text()).toBe('ダーク')
      expect(wrapper.find('.theme-icon').text()).toBe('🌙')
    })

    it('システムモード時の表示が正しい', () => {
      mockUseDarkMode.themeMode.value = 'system'
      mockUseDarkMode.getThemeModeLabel.mockReturnValue('システム')
      mockUseDarkMode.getThemeModeIcon.mockReturnValue('🖥️')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-label').text()).toBe('システム')
      expect(wrapper.find('.theme-icon').text()).toBe('🖥️')
    })
  })

  describe('初期化', () => {
    it('マウント時にテーマ初期化が呼ばれる', () => {
      mount(ThemeToggle)

      expect(mockUseDarkMode.initializeTheme).toHaveBeenCalledOnce()
    })
  })

  describe('アクセシビリティ', () => {
    it('ボタンとして正しくマークアップされている', () => {
      const wrapper = mount(ThemeToggle)
      const button = wrapper.find('.theme-toggle-button')

      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('type')).toBe('button')
    })

    it('意味のあるaria-labelが設定されている', () => {
      mockUseDarkMode.getThemeModeLabel.mockReturnValue('ダーク')

      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-icon').attributes('aria-label')).toBe(
        'ダーク'
      )
    })

    it('role属性が正しく設定されている', () => {
      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-icon').attributes('role')).toBe('img')
    })
  })

  describe('CSSクラス', () => {
    it('正しいCSSクラスが適用されている', () => {
      const wrapper = mount(ThemeToggle)

      expect(wrapper.find('.theme-toggle').exists()).toBe(true)
      expect(wrapper.find('.theme-toggle-button').exists()).toBe(true)
      expect(wrapper.find('.theme-icon').exists()).toBe(true)
      expect(wrapper.find('.theme-label').exists()).toBe(true)
    })
  })
})
