import { describe, it, expect } from 'vitest'
import { useTools } from '~/composables/useTools'

describe('useTools', () => {
  const {
    getAllTools,
    getToolById,
    getToolsByCategory,
    getCategories,
    searchTools,
  } = useTools()

  describe('getAllTools', () => {
    it('should return all tools', () => {
      const tools = getAllTools()
      expect(tools).toBeDefined()
      expect(Array.isArray(tools)).toBe(true)
      expect(tools.length).toBeGreaterThan(0)
    })

    it('should return tools with required properties', () => {
      const tools = getAllTools()
      tools.forEach(tool => {
        expect(tool).toHaveProperty('id')
        expect(tool).toHaveProperty('name')
        expect(tool).toHaveProperty('description')
        expect(tool).toHaveProperty('path')
        expect(tool).toHaveProperty('category')
        expect(tool).toHaveProperty('keywords')
        expect(Array.isArray(tool.keywords)).toBe(true)
      })
    })

    it('should have unique tool IDs', () => {
      const tools = getAllTools()
      const ids = tools.map(tool => tool.id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).toBe(uniqueIds.length)
    })
  })

  describe('getToolById', () => {
    it('should return tool by ID', () => {
      const tool = getToolById('character-counter')
      expect(tool).toBeDefined()
      expect(tool?.id).toBe('character-counter')
      expect(tool?.name).toBe('文字数カウンター')
    })

    it('should return undefined for non-existent ID', () => {
      const tool = getToolById('non-existent-tool')
      expect(tool).toBeUndefined()
    })

    it('should handle empty string ID', () => {
      const tool = getToolById('')
      expect(tool).toBeUndefined()
    })
  })

  describe('getToolsByCategory', () => {
    it('should return tools by category', () => {
      const textTools = getToolsByCategory('テキスト')
      expect(Array.isArray(textTools)).toBe(true)
      expect(textTools.length).toBeGreaterThan(0)
      textTools.forEach(tool => {
        expect(tool.category).toBe('テキスト')
      })
    })

    it('should return empty array for non-existent category', () => {
      const tools = getToolsByCategory('存在しないカテゴリ')
      expect(Array.isArray(tools)).toBe(true)
      expect(tools.length).toBe(0)
    })

    it('should handle empty string category', () => {
      const tools = getToolsByCategory('')
      expect(Array.isArray(tools)).toBe(true)
      expect(tools.length).toBe(0)
    })
  })

  describe('getCategories', () => {
    it('should return all unique categories', () => {
      const categories = getCategories()
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)

      // Check uniqueness
      const uniqueCategories = [...new Set(categories)]
      expect(categories.length).toBe(uniqueCategories.length)
    })

    it('should include expected categories', () => {
      const categories = getCategories()
      expect(categories).toContain('テキスト')
      expect(categories).toContain('数学')
      expect(categories).toContain('デザイン')
      expect(categories).toContain('ユーティリティ')
    })
  })

  describe('searchTools', () => {
    it('should search tools by name', () => {
      const results = searchTools('カラー')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(tool => tool.name.includes('カラー'))).toBe(true)
    })

    it('should search tools by description', () => {
      const results = searchTools('文字数')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(tool => tool.description.includes('文字数'))).toBe(
        true
      )
    })

    it('should search tools by keywords', () => {
      const results = searchTools('json')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should be case insensitive', () => {
      const lowerResults = searchTools('json')
      const upperResults = searchTools('JSON')
      expect(lowerResults.length).toBe(upperResults.length)
    })

    it('should return empty array for no matches', () => {
      const results = searchTools('存在しない検索語')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })

    it('should handle empty search query', () => {
      const results = searchTools('')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })

    it('should handle partial matches', () => {
      const results = searchTools('カウン')
      expect(Array.isArray(results)).toBe(true)
      expect(results.some(tool => tool.name.includes('カウンター'))).toBe(true)
    })
  })

  describe('tool data integrity', () => {
    it('should have valid paths for all tools', () => {
      const tools = getAllTools()
      tools.forEach(tool => {
        expect(tool.path).toMatch(/^\/tools\/[a-z0-9-]+$/)
      })
    })

    it('should have non-empty descriptions for all tools', () => {
      const tools = getAllTools()
      tools.forEach(tool => {
        expect(tool.description.length).toBeGreaterThan(0)
      })
    })

    it('should have at least one keyword for each tool', () => {
      const tools = getAllTools()
      tools.forEach(tool => {
        expect(tool.keywords.length).toBeGreaterThan(0)
      })
    })

    it('should have valid categories', () => {
      const tools = getAllTools()
      const validCategories = [
        'テキスト',
        '数学',
        'デザイン',
        'ユーティリティ',
        'エンコーディング',
        'セキュリティ',
        'データ変換',
        'データ分析',
        'Web開発',
        'ヘルス',
        'ネットワーク',
        'データベース',
      ]

      tools.forEach(tool => {
        expect(validCategories).toContain(tool.category)
      })
    })
  })
})
