import { describe, it, expect } from 'vitest'
import {
  generateBasicMetaTags,
  generateOpenGraphTags,
  generateTwitterTags,
  generateAllMetaTags,
  getDefaultMetaTags,
  validateMetaTagsInput,
  getMetaTagsPreview,
  isValidUrl,
  META_TAG_TEMPLATES,
} from '~/utils/meta-tags'

describe('meta-tags', () => {
  describe('generateBasicMetaTags', () => {
    it('should generate basic meta tags', () => {
      const input = {
        title: 'Test Title',
        description: 'Test Description',
        charset: 'UTF-8',
        viewport: 'width=device-width, initial-scale=1.0',
      }

      const tags = generateBasicMetaTags(input)

      expect(tags).toContain('<meta charset="UTF-8">')
      expect(tags).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      )
      expect(tags).toContain('<title>Test Title</title>')
      expect(tags).toContain(
        '<meta name="description" content="Test Description">'
      )
    })

    it('should handle empty input', () => {
      const tags = generateBasicMetaTags({})
      expect(tags).toEqual([])
    })

    it('should escape HTML entities', () => {
      const input = {
        title: 'Title with <script>alert("xss")</script>',
        description: 'Description with "quotes" & ampersands',
      }

      const tags = generateBasicMetaTags(input)

      expect(tags).toContain(
        '<title>Title with &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</title>'
      )
      expect(tags).toContain(
        '<meta name="description" content="Description with &quot;quotes&quot; &amp; ampersands">'
      )
    })
  })

  describe('generateOpenGraphTags', () => {
    it('should generate Open Graph tags', () => {
      const input = {
        title: 'OG Title',
        description: 'OG Description',
        url: 'https://example.com',
        image: 'https://example.com/image.jpg',
        siteName: 'Example Site',
        type: 'website',
      }

      const tags = generateOpenGraphTags(input)

      expect(tags).toContain('<meta property="og:title" content="OG Title">')
      expect(tags).toContain(
        '<meta property="og:description" content="OG Description">'
      )
      expect(tags).toContain(
        '<meta property="og:url" content="https://example.com">'
      )
      expect(tags).toContain(
        '<meta property="og:image" content="https://example.com/image.jpg">'
      )
      expect(tags).toContain(
        '<meta property="og:site_name" content="Example Site">'
      )
      expect(tags).toContain('<meta property="og:type" content="website">')
    })

    it('should handle partial input', () => {
      const input = {
        title: 'OG Title',
      }

      const tags = generateOpenGraphTags(input)

      expect(tags).toContain('<meta property="og:title" content="OG Title">')
      expect(tags).toHaveLength(1)
    })
  })

  describe('generateTwitterTags', () => {
    it('should generate Twitter Card tags', () => {
      const input = {
        title: 'Twitter Title',
        description: 'Twitter Description',
        image: 'https://example.com/twitter.jpg',
        twitterCard: 'summary_large_image' as const,
        twitterSite: '@example',
        twitterCreator: '@creator',
      }

      const tags = generateTwitterTags(input)

      expect(tags).toContain(
        '<meta name="twitter:card" content="summary_large_image">'
      )
      expect(tags).toContain(
        '<meta name="twitter:title" content="Twitter Title">'
      )
      expect(tags).toContain(
        '<meta name="twitter:description" content="Twitter Description">'
      )
      expect(tags).toContain(
        '<meta name="twitter:image" content="https://example.com/twitter.jpg">'
      )
      expect(tags).toContain('<meta name="twitter:site" content="@example">')
      expect(tags).toContain('<meta name="twitter:creator" content="@creator">')
    })
  })

  describe('generateAllMetaTags', () => {
    it('should generate all meta tags', () => {
      const input = {
        title: 'Complete Title',
        description: 'Complete Description',
        charset: 'UTF-8',
        url: 'https://example.com',
        image: 'https://example.com/image.jpg',
        twitterCard: 'summary' as const,
        language: 'ja',
      }

      const result = generateAllMetaTags(input)

      expect(result.basic).toContain('<title>Complete Title</title>')
      expect(result.openGraph).toContain(
        '<meta property="og:title" content="Complete Title">'
      )
      expect(result.twitter).toContain(
        '<meta name="twitter:title" content="Complete Title">'
      )
      expect(result.combined).toContain('<title>Complete Title</title>')
      expect(result.combined).toContain(
        '<meta property="og:title" content="Complete Title">'
      )
      expect(result.combined).toContain(
        '<meta name="twitter:title" content="Complete Title">'
      )
    })
  })

  describe('getDefaultMetaTags', () => {
    it('should return default meta tags', () => {
      const defaults = getDefaultMetaTags()

      expect(defaults.charset).toBe('UTF-8')
      expect(defaults.viewport).toBe('width=device-width, initial-scale=1.0')
      expect(defaults.type).toBe('website')
      expect(defaults.twitterCard).toBe('summary_large_image')
      expect(defaults.language).toBe('ja')
      expect(defaults.robots).toBe('index, follow')
    })
  })

  describe('validateMetaTagsInput', () => {
    it('should validate valid input', () => {
      const input = {
        title: 'Valid Title',
        description: 'Valid description under 160 characters',
        url: 'https://example.com',
        image: 'https://example.com/image.jpg',
      }

      const result = validateMetaTagsInput(input)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should detect title too long', () => {
      const input = {
        title:
          'This is a very long title that exceeds the recommended 60 character limit for SEO',
      }

      const result = validateMetaTagsInput(input)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'タイトルは60文字以内にすることを推奨します'
      )
    })

    it('should detect description too long', () => {
      const input = {
        description:
          'This is a very long description that exceeds the recommended 160 character limit for SEO purposes and should trigger a validation error message with many additional words to make it longer than 160 characters for testing',
      }

      const result = validateMetaTagsInput(input)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        '説明文は160文字以内にすることを推奨します'
      )
    })

    it('should detect invalid URLs', () => {
      const input = {
        url: 'not-a-valid-url',
        image: 'also-not-valid',
        canonical: 'invalid-canonical',
      }

      const result = validateMetaTagsInput(input)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('URLの形式が正しくありません')
      expect(result.errors).toContain('画像URLの形式が正しくありません')
      expect(result.errors).toContain('カノニカルURLの形式が正しくありません')
    })
  })

  describe('isValidUrl', () => {
    it('should validate valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('getMetaTagsPreview', () => {
    it('should generate preview data', () => {
      const input = {
        title: 'Preview Title',
        description: 'Preview Description',
        url: 'https://example.com',
        image: 'https://example.com/image.jpg',
      }

      const preview = getMetaTagsPreview(input)

      expect(preview.google.title).toBe('Preview Title')
      expect(preview.google.description).toBe('Preview Description')
      expect(preview.google.url).toBe('https://example.com')

      expect(preview.facebook.title).toBe('Preview Title')
      expect(preview.facebook.description).toBe('Preview Description')
      expect(preview.facebook.image).toBe('https://example.com/image.jpg')

      expect(preview.twitter.title).toBe('Preview Title')
      expect(preview.twitter.description).toBe('Preview Description')
      expect(preview.twitter.image).toBe('https://example.com/image.jpg')
    })

    it('should handle empty input with defaults', () => {
      const preview = getMetaTagsPreview({})

      expect(preview.google.title).toBe('タイトルなし')
      expect(preview.google.description).toBe('説明文がありません')
      expect(preview.google.url).toBe('https://example.com')
    })
  })

  describe('META_TAG_TEMPLATES', () => {
    it('should have valid templates', () => {
      expect(META_TAG_TEMPLATES.blog).toBeDefined()
      expect(META_TAG_TEMPLATES.ecommerce).toBeDefined()
      expect(META_TAG_TEMPLATES.company).toBeDefined()
      expect(META_TAG_TEMPLATES.news).toBeDefined()

      expect(META_TAG_TEMPLATES.blog.type).toBe('article')
      expect(META_TAG_TEMPLATES.blog.twitterCard).toBe('summary_large_image')

      expect(META_TAG_TEMPLATES.company.type).toBe('website')
      expect(META_TAG_TEMPLATES.company.twitterCard).toBe('summary')
    })
  })
})
