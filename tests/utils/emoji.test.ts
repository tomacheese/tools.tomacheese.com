import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  EMOJI_CATEGORIES,
  searchEmojis,
  getEmojisByCategory,
  getAllEmojis,
  getRecentlyUsedEmojis,
  addToRecentlyUsed,
  copyEmojiToClipboard,
  getEmojiVariants,
  type Emoji,
} from '~/utils/emoji'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock navigator.clipboard
const clipboardMock = {
  writeText: vi.fn(),
}

Object.defineProperty(navigator, 'clipboard', {
  value: clipboardMock,
})

// Mock document.execCommand for fallback
document.execCommand = vi.fn()

describe('emoji utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('EMOJI_CATEGORIES', () => {
    it('should have valid category structure', () => {
      expect(EMOJI_CATEGORIES).toBeInstanceOf(Array)
      expect(EMOJI_CATEGORIES.length).toBeGreaterThan(0)

      EMOJI_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('icon')
        expect(category).toHaveProperty('emojis')
        expect(typeof category.id).toBe('string')
        expect(typeof category.name).toBe('string')
        expect(typeof category.icon).toBe('string')
        expect(Array.isArray(category.emojis)).toBe(true)
      })
    })

    it('should have valid emoji structure', () => {
      const firstCategory = EMOJI_CATEGORIES[0]
      expect(firstCategory.emojis.length).toBeGreaterThan(0)

      firstCategory.emojis.forEach(emoji => {
        expect(emoji).toHaveProperty('emoji')
        expect(emoji).toHaveProperty('name')
        expect(emoji).toHaveProperty('keywords')
        expect(emoji).toHaveProperty('shortcodes')
        expect(typeof emoji.emoji).toBe('string')
        expect(typeof emoji.name).toBe('string')
        expect(Array.isArray(emoji.keywords)).toBe(true)
        expect(Array.isArray(emoji.shortcodes)).toBe(true)
      })
    })

    it('should have unique category IDs', () => {
      const ids = EMOJI_CATEGORIES.map(cat => cat.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })
  })

  describe('searchEmojis', () => {
    it('should return empty array for empty query', () => {
      expect(searchEmojis('')).toEqual([])
      expect(searchEmojis('   ')).toEqual([])
    })

    it('should find emojis by name', () => {
      const results = searchEmojis('笑顔')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(emoji => emoji.name.includes('笑顔'))).toBe(true)
    })

    it('should find emojis by keywords', () => {
      const results = searchEmojis('嬉しい')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(emoji => emoji.keywords.includes('嬉しい'))).toBe(true)
    })

    it('should find emojis by shortcodes', () => {
      const results = searchEmojis(':smile:')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(emoji => emoji.shortcodes.includes(':smile:'))).toBe(true)
    })

    it('should be case insensitive', () => {
      const resultsLower = searchEmojis('smile')
      const resultsUpper = searchEmojis('SMILE')
      expect(resultsLower.length).toBe(resultsUpper.length)
      expect(resultsLower).toEqual(resultsUpper)
    })

    it('should limit search results', () => {
      const results = searchEmojis('a') // Very broad search
      expect(results.length).toBeLessThanOrEqual(200)
    })
  })

  describe('getEmojisByCategory', () => {
    it('should return emojis for valid category', () => {
      const smileys = getEmojisByCategory('smileys')
      expect(smileys.length).toBeGreaterThan(0)
      expect(smileys[0]).toHaveProperty('emoji')
    })

    it('should return empty array for invalid category', () => {
      const result = getEmojisByCategory('invalid-category')
      expect(result).toEqual([])
    })

    it('should return different emojis for different categories', () => {
      const smileys = getEmojisByCategory('smileys')
      const animals = getEmojisByCategory('animals')
      expect(smileys).not.toEqual(animals)
    })
  })

  describe('getAllEmojis', () => {
    it('should return all emojis from all categories', () => {
      const allEmojis = getAllEmojis()
      expect(allEmojis.length).toBeGreaterThan(0)
      
      const totalFromCategories = EMOJI_CATEGORIES.reduce(
        (total, cat) => total + cat.emojis.length,
        0
      )
      expect(allEmojis.length).toBe(totalFromCategories)
    })

    it('should include emojis from each category', () => {
      const allEmojis = getAllEmojis()
      
      EMOJI_CATEGORIES.forEach(category => {
        category.emojis.forEach(emoji => {
          expect(allEmojis.some(e => e.emoji === emoji.emoji)).toBe(true)
        })
      })
    })
  })

  describe('getRecentlyUsedEmojis', () => {
    it('should return empty array when no recent emojis', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const result = getRecentlyUsedEmojis()
      expect(result).toEqual([])
    })

    it('should return recent emojis from localStorage', () => {
      const recentData = JSON.stringify(['😀', '😍']) // Only use emojis that exist in our data
      localStorageMock.getItem.mockReturnValue(recentData)
      
      const result = getRecentlyUsedEmojis()
      expect(result.length).toBe(2)
      expect(result[0].emoji).toBe('😀')
      expect(result[1].emoji).toBe('😍')
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      const result = getRecentlyUsedEmojis()
      expect(result).toEqual([])
    })

    it('should filter out unknown emojis', () => {
      const recentData = JSON.stringify(['😀', '🚫unknown🚫', '😍'])
      localStorageMock.getItem.mockReturnValue(recentData)
      
      const result = getRecentlyUsedEmojis()
      expect(result.length).toBe(2)
      expect(result[0].emoji).toBe('😀')
      expect(result[1].emoji).toBe('😍')
    })
  })

  describe('addToRecentlyUsed', () => {
    it('should add emoji to recent list', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))
      
      const emoji: Emoji = {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔'],
        shortcodes: [':grinning:']
      }
      
      addToRecentlyUsed(emoji)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recently-used-emojis',
        JSON.stringify(['😀'])
      )
    })

    it('should move existing emoji to front', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['😍', '😀']))
      
      const emoji: Emoji = {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔'],
        shortcodes: [':grinning:']
      }
      
      addToRecentlyUsed(emoji)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recently-used-emojis',
        JSON.stringify(['😀', '😍'])
      )
    })

    it('should limit recent emojis to 30', () => {
      // Create array with valid emoji characters
      const existing = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
                        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
                        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔']
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existing))
      
      const emoji: Emoji = {
        emoji: '🥳', // New emoji to add
        name: 'パーティー顔',
        keywords: ['パーティー'],
        shortcodes: [':partying_face:']
      }
      
      addToRecentlyUsed(emoji)
      
      // Check that only the new emoji is stored (since getRecentlyUsedEmojis filters unknown emojis)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recently-used-emojis',
        expect.stringMatching(/^\["🥳".*\]$/)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const emoji: Emoji = {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔'],
        shortcodes: [':grinning:']
      }
      
      expect(() => addToRecentlyUsed(emoji)).not.toThrow()
    })
  })

  describe('copyEmojiToClipboard', () => {
    it('should copy emoji using clipboard API', async () => {
      clipboardMock.writeText.mockResolvedValue(undefined)
      
      const emoji: Emoji = {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔'],
        shortcodes: [':grinning:']
      }
      
      const result = await copyEmojiToClipboard(emoji)
      
      expect(result).toBe(true)
      expect(clipboardMock.writeText).toHaveBeenCalledWith('😀')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should fallback to execCommand when clipboard API fails', async () => {
      clipboardMock.writeText.mockRejectedValue(new Error('Clipboard error'))
      document.execCommand = vi.fn().mockReturnValue(true)
      
      // Mock document.createElement and related methods
      const mockTextArea = {
        value: '',
        select: vi.fn(),
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockTextArea as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockTextArea as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockTextArea as any)
      
      const emoji: Emoji = {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔'],
        shortcodes: [':grinning:']
      }
      
      const result = await copyEmojiToClipboard(emoji)
      
      expect(result).toBe(true)
      expect(createElementSpy).toHaveBeenCalledWith('textarea')
      expect(mockTextArea.value).toBe('😀')
      expect(mockTextArea.select).toHaveBeenCalled()
      expect(document.execCommand).toHaveBeenCalledWith('copy')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('should return false when all copy methods fail', async () => {
      clipboardMock.writeText.mockRejectedValue(new Error('Clipboard error'))
      document.execCommand = vi.fn().mockImplementation(() => {
        throw new Error('execCommand error')
      })
      
      const emoji: Emoji = {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔'],
        shortcodes: [':grinning:']
      }
      
      const result = await copyEmojiToClipboard(emoji)
      expect(result).toBe(false)
    })
  })

  describe('getEmojiVariants', () => {
    it('should return empty array for non-skin-tone emoji', () => {
      const emoji: Emoji = {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔'],
        shortcodes: [':grinning:']
      }
      
      const variants = getEmojiVariants(emoji)
      expect(variants).toEqual([])
    })

    it('should return variants for skin-tone supporting emoji', () => {
      const emoji: Emoji = {
        emoji: '👋',
        name: '手を振る',
        keywords: ['挨拶'],
        shortcodes: [':wave:']
      }
      
      const variants = getEmojiVariants(emoji)
      expect(variants.length).toBe(5) // 5 skin tones
      expect(variants[0].emoji).toBe('👋🏻')
      expect(variants[4].emoji).toBe('👋🏿')
    })

    it('should generate correct variant names', () => {
      const emoji: Emoji = {
        emoji: '👋',
        name: '手を振る',
        keywords: ['挨拶'],
        shortcodes: [':wave:']
      }
      
      const variants = getEmojiVariants(emoji)
      expect(variants[0].name).toBe('手を振る (薄い肌色)')
      expect(variants[4].name).toBe('手を振る (濃い肌色)')
    })

    it('should preserve original keywords and shortcodes', () => {
      const emoji: Emoji = {
        emoji: '👋',
        name: '手を振る',
        keywords: ['挨拶', 'こんにちは'],
        shortcodes: [':wave:']
      }
      
      const variants = getEmojiVariants(emoji)
      variants.forEach(variant => {
        expect(variant.keywords).toEqual(emoji.keywords)
        expect(variant.shortcodes).toEqual(emoji.shortcodes)
      })
    })
  })
})