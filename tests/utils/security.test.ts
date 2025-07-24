import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  sanitizeInput,
  validateInput,
  safeSetTextContent,
  safeCreateElement,
  secureStorage,
  validateURL,
  generateCSRFToken,
  generateSecureRandomString
} from '~/utils/security'

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  })
}

// Mock crypto
const mockCrypto = {
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  })
}

// Global mocks
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
})

describe('security utilities', () => {
  beforeEach(() => {
    mockLocalStorage.store = {}
    vi.clearAllMocks()
  })

  describe('sanitizeInput', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>'
      const result = sanitizeInput(input)
      
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
    })

    it('should escape all dangerous characters', () => {
      const input = `<>&"'/`
      const result = sanitizeInput(input)
      
      expect(result).toBe('&lt;&gt;&amp;&quot;&#x27;&#x2F;')
    })

    it('should handle empty string', () => {
      const result = sanitizeInput('')
      expect(result).toBe('')
    })

    it('should handle normal text without changes', () => {
      const input = 'Hello World 123'
      const result = sanitizeInput(input)
      
      expect(result).toBe(input)
    })

    it('should throw error for non-string input', () => {
      expect(() => sanitizeInput(123 as any)).toThrow('Input must be a string')
      expect(() => sanitizeInput(null as any)).toThrow('Input must be a string')
      expect(() => sanitizeInput(undefined as any)).toThrow('Input must be a string')
    })
  })

  describe('validateInput', () => {
    it('should return true for safe input', () => {
      const safeInputs = [
        'Hello World',
        'Some normal text with numbers 123',
        'Email: test@example.com',
        'URL: https://example.com'
      ]
      
      safeInputs.forEach(input => {
        expect(validateInput(input)).toBe(true)
      })
    })

    it('should return false for dangerous script tags', () => {
      const dangerousInputs = [
        '<script>alert("XSS")</script>',
        '<SCRIPT>alert("XSS")</SCRIPT>',
        'Some text <script src="evil.js"></script>',
        '<img src="x" onerror="alert(1)">'
      ]
      
      dangerousInputs.forEach(input => {
        expect(validateInput(input)).toBe(false)
      })
    })

    it('should return false for javascript: URLs', () => {
      const dangerousInputs = [
        'javascript:alert("XSS")',
        'JAVASCRIPT:alert("XSS")',
        'Click <a href="javascript:void(0)">here</a>'
      ]
      
      dangerousInputs.forEach(input => {
        expect(validateInput(input)).toBe(false)
      })
    })

    it('should return false for event handlers', () => {
      const dangerousInputs = [
        '<div onclick="alert(1)">Click me</div>',
        '<img onload="evil()" src="x">',
        'onmouseover="alert(1)"',
        '<button onkeydown="hack()">Button</button>'
      ]
      
      dangerousInputs.forEach(input => {
        expect(validateInput(input)).toBe(false)
      })
    })

    it('should return false for data: HTML URLs', () => {
      const dangerousInputs = [
        'data:text/html,<script>alert(1)</script>',
        'DATA:TEXT/HTML,<script>alert(1)</script>'
      ]
      
      dangerousInputs.forEach(input => {
        expect(validateInput(input)).toBe(false)
      })
    })

    it('should respect maxLength parameter', () => {
      const longInput = 'A'.repeat(1001)
      
      expect(validateInput(longInput, 1000)).toBe(false)
      expect(validateInput(longInput, 1001)).toBe(true)
    })

    it('should return false for non-string input', () => {
      expect(validateInput(123 as any)).toBe(false)
      expect(validateInput(null as any)).toBe(false)
      expect(validateInput(undefined as any)).toBe(false)
    })
  })

  describe('safeSetTextContent', () => {
    it('should set sanitized text content', () => {
      const mockElement = {
        textContent: ''
      } as HTMLElement

      const dangerousContent = '<script>alert("XSS")</script>Hello'
      safeSetTextContent(mockElement, dangerousContent)
      
      expect(mockElement.textContent).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;Hello')
    })

    it('should throw error for invalid element', () => {
      expect(() => safeSetTextContent(null as any, 'test')).toThrow('Invalid element or content')
    })

    it('should throw error for non-string content', () => {
      const mockElement = {} as HTMLElement
      expect(() => safeSetTextContent(mockElement, 123 as any)).toThrow('Invalid element or content')
    })
  })

  describe('safeCreateElement', () => {
    // Mock document.createElement
    const mockCreateElement = vi.fn()
    Object.defineProperty(global, 'document', {
      value: {
        createElement: mockCreateElement
      },
      writable: true
    })

    beforeEach(() => {
      mockCreateElement.mockClear()
      mockCreateElement.mockReturnValue({
        textContent: ''
      })
    })

    it('should create allowed elements', () => {
      const allowedTags = ['div', 'span', 'p', 'h1', 'button']
      
      allowedTags.forEach(tag => {
        safeCreateElement(tag)
        expect(mockCreateElement).toHaveBeenCalledWith(tag)
      })
    })

    it('should throw error for disallowed elements', () => {
      const disallowedTags = ['script', 'iframe', 'object', 'embed', 'link']
      
      disallowedTags.forEach(tag => {
        expect(() => safeCreateElement(tag)).toThrow(`Tag ${tag} is not allowed`)
      })
    })

    it('should set sanitized content when provided', () => {
      const mockElement = { textContent: '' }
      mockCreateElement.mockReturnValue(mockElement)
      
      const element = safeCreateElement('div', '<script>alert("XSS")</script>Test')
      
      expect(element.textContent).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;Test')
    })
  })

  describe('secureStorage', () => {
    describe('setItem', () => {
      it('should store item with secure prefix', () => {
        secureStorage.setItem('testKey', { data: 'testValue' })
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'secure_testKey',
          JSON.stringify({ data: 'testValue' })
        )
      })

      it('should sanitize key before storage', () => {
        secureStorage.setItem('<script>evil</script>', 'value')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'secure_&lt;script&gt;evil&lt;&#x2F;script&gt;',
          JSON.stringify('value')
        )
      })

      it('should handle storage errors gracefully', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          throw new Error('Storage full')
        })
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        expect(() => secureStorage.setItem('test', 'value')).not.toThrow()
        expect(consoleSpy).toHaveBeenCalledWith('Secure storage setItem failed:', expect.any(Error))
        
        consoleSpy.mockRestore()
      })

      it('should reject invalid keys', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        secureStorage.setItem('', 'value')
        secureStorage.setItem(null as any, 'value')
        
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledTimes(2)
        
        consoleSpy.mockRestore()
      })
    })

    describe('getItem', () => {
      it('should retrieve and parse stored item', () => {
        mockLocalStorage.store['secure_testKey'] = JSON.stringify({ data: 'testValue' })
        
        const result = secureStorage.getItem('testKey')
        
        expect(result).toEqual({ data: 'testValue' })
      })

      it('should return null for non-existent items', () => {
        const result = secureStorage.getItem('nonExistent')
        
        expect(result).toBeNull()
      })

      it('should handle parsing errors gracefully', () => {
        mockLocalStorage.store['secure_testKey'] = 'invalid json'
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        const result = secureStorage.getItem('testKey')
        
        expect(result).toBeNull()
        expect(consoleSpy).toHaveBeenCalledWith('Secure storage getItem failed:', expect.any(Error))
        
        consoleSpy.mockRestore()
      })

      it('should return null for invalid keys', () => {
        const result1 = secureStorage.getItem('')
        const result2 = secureStorage.getItem(null as any)
        
        expect(result1).toBeNull()
        expect(result2).toBeNull()
      })
    })

    describe('removeItem', () => {
      it('should remove item with secure prefix', () => {
        secureStorage.removeItem('testKey')
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('secure_testKey')
      })

      it('should handle invalid keys gracefully', () => {
        secureStorage.removeItem('')
        secureStorage.removeItem(null as any)
        
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
      })
    })

    describe('clear', () => {
      it('should remove only secure prefixed items', () => {
        mockLocalStorage.store = {
          'secure_item1': 'value1',
          'secure_item2': 'value2',
          'regular_item': 'value3',
          'another_item': 'value4'
        }
        
        // Mock Object.keys
        const originalKeys = Object.keys
        Object.keys = vi.fn(() => ['secure_item1', 'secure_item2', 'regular_item', 'another_item'])
        
        secureStorage.clear()
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('secure_item1')
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('secure_item2')
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('regular_item')
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('another_item')
        
        Object.keys = originalKeys
      })
    })
  })

  describe('validateURL', () => {
    it('should accept valid HTTPS URLs', () => {
      const validURLs = [
        'https://example.com',
        'https://www.example.com/path',
        'https://subdomain.example.com:8080/path?query=value'
      ]
      
      validURLs.forEach(url => {
        expect(validateURL(url)).toBe(true)
      })
    })

    it('should accept localhost HTTP URLs', () => {
      const localhostURLs = [
        'http://localhost',
        'http://localhost:3000',
        'http://localhost:8080/path'
      ]
      
      localhostURLs.forEach(url => {
        expect(validateURL(url)).toBe(true)
      })
    })

    it('should reject HTTP URLs for non-localhost', () => {
      const insecureURLs = [
        'http://example.com',
        'http://www.example.com',
        'http://192.168.1.1'
      ]
      
      insecureURLs.forEach(url => {
        expect(validateURL(url)).toBe(false)
      })
    })

    it('should reject invalid URLs', () => {
      const invalidURLs = [
        'not-a-url',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        ''
      ]
      
      invalidURLs.forEach(url => {
        expect(validateURL(url)).toBe(false)
      })
    })
  })

  describe('generateCSRFToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCSRFToken()
      
      expect(token).toHaveLength(64)
      expect(token).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      
      expect(token1).not.toBe(token2)
    })
  })

  describe('generateSecureRandomString', () => {
    it('should generate string of specified length', () => {
      const lengths = [8, 16, 32, 64]
      
      lengths.forEach(length => {
        const randomString = generateSecureRandomString(length)
        expect(randomString).toHaveLength(length)
      })
    })

    it('should generate string with only allowed characters', () => {
      const randomString = generateSecureRandomString(100)
      const allowedChars = /^[A-Za-z0-9]+$/
      
      expect(randomString).toMatch(allowedChars)
    })

    it('should generate unique strings', () => {
      const string1 = generateSecureRandomString(32)
      const string2 = generateSecureRandomString(32)
      
      expect(string1).not.toBe(string2)
    })

    it('should use default length when not specified', () => {
      const randomString = generateSecureRandomString()
      
      expect(randomString).toHaveLength(32)
    })
  })
})