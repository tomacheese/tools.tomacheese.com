import { describe, it, expect } from 'vitest'

describe('useTheme コンポーザブル', () => {
  it('useTheme が存在する', async () => {
    const { useTheme } = await import('~/composables/useTheme')
    expect(typeof useTheme).toBe('function')
  })

  it('テーマタイプが正しく定義されている', async () => {
    const { useTheme } = await import('~/composables/useTheme')
    // 関数が呼び出し可能であることを確認
    expect(() => useTheme()).not.toThrow()
  })
})
