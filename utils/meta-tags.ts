export interface MetaTagsInput {
  title: string
  description: string
  keywords: string
  author: string
  url: string
  image: string
  siteName: string
  type: string
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite: string
  twitterCreator: string
  language: string
  viewport: string
  charset: string
  robots: string
  canonical: string
  generator: string
  theme: string
}

export interface GeneratedMetaTags {
  basic: string[]
  openGraph: string[]
  twitter: string[]
  additional: string[]
  combined: string
}

/**
 * Generate basic HTML meta tags
 */
export function generateBasicMetaTags(input: Partial<MetaTagsInput>): string[] {
  const tags: string[] = []

  if (input.charset) {
    tags.push(`<meta charset="${escapeHtml(input.charset)}">`)
  }

  if (input.viewport) {
    tags.push(`<meta name="viewport" content="${escapeHtml(input.viewport)}">`)
  }

  if (input.title) {
    tags.push(`<title>${escapeHtml(input.title)}</title>`)
  }

  if (input.description) {
    tags.push(
      `<meta name="description" content="${escapeHtml(input.description)}">`
    )
  }

  if (input.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(input.keywords)}">`)
  }

  if (input.author) {
    tags.push(`<meta name="author" content="${escapeHtml(input.author)}">`)
  }

  if (input.robots) {
    tags.push(`<meta name="robots" content="${escapeHtml(input.robots)}">`)
  }

  if (input.generator) {
    tags.push(
      `<meta name="generator" content="${escapeHtml(input.generator)}">`
    )
  }

  if (input.language) {
    tags.push(
      `<meta http-equiv="content-language" content="${escapeHtml(input.language)}">`
    )
  }

  if (input.theme) {
    tags.push(`<meta name="theme-color" content="${escapeHtml(input.theme)}">`)
  }

  if (input.canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(input.canonical)}">`)
  }

  return tags
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(input: Partial<MetaTagsInput>): string[] {
  const tags: string[] = []

  if (input.title) {
    tags.push(`<meta property="og:title" content="${escapeHtml(input.title)}">`)
  }

  if (input.description) {
    tags.push(
      `<meta property="og:description" content="${escapeHtml(input.description)}">`
    )
  }

  if (input.url) {
    tags.push(`<meta property="og:url" content="${escapeHtml(input.url)}">`)
  }

  if (input.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(input.image)}">`)
  }

  if (input.siteName) {
    tags.push(
      `<meta property="og:site_name" content="${escapeHtml(input.siteName)}">`
    )
  }

  if (input.type) {
    tags.push(`<meta property="og:type" content="${escapeHtml(input.type)}">`)
  }

  if (input.language) {
    tags.push(
      `<meta property="og:locale" content="${escapeHtml(input.language)}">`
    )
  }

  return tags
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterTags(input: Partial<MetaTagsInput>): string[] {
  const tags: string[] = []

  if (input.twitterCard) {
    tags.push(
      `<meta name="twitter:card" content="${escapeHtml(input.twitterCard)}">`
    )
  }

  if (input.title) {
    tags.push(
      `<meta name="twitter:title" content="${escapeHtml(input.title)}">`
    )
  }

  if (input.description) {
    tags.push(
      `<meta name="twitter:description" content="${escapeHtml(input.description)}">`
    )
  }

  if (input.image) {
    tags.push(
      `<meta name="twitter:image" content="${escapeHtml(input.image)}">`
    )
  }

  if (input.twitterSite) {
    tags.push(
      `<meta name="twitter:site" content="${escapeHtml(input.twitterSite)}">`
    )
  }

  if (input.twitterCreator) {
    tags.push(
      `<meta name="twitter:creator" content="${escapeHtml(input.twitterCreator)}">`
    )
  }

  return tags
}

/**
 * Generate all meta tags
 */
export function generateAllMetaTags(
  input: Partial<MetaTagsInput>
): GeneratedMetaTags {
  const basic = generateBasicMetaTags(input)
  const openGraph = generateOpenGraphTags(input)
  const twitter = generateTwitterTags(input)
  const additional: string[] = []

  // Add additional useful meta tags
  if (input.url) {
    additional.push(
      `<link rel="alternate" hreflang="${input.language ?? 'en'}" href="${escapeHtml(input.url)}">`
    )
  }

  const allTags = [...basic, ...openGraph, ...twitter, ...additional]
  const combined = allTags.join('\n')

  return {
    basic,
    openGraph,
    twitter,
    additional,
    combined,
  }
}

/**
 * Get default meta tags configuration
 */
export function getDefaultMetaTags(): Partial<MetaTagsInput> {
  return {
    charset: 'UTF-8',
    viewport: 'width=device-width, initial-scale=1.0',
    type: 'website',
    twitterCard: 'summary_large_image',
    language: 'ja',
    robots: 'index, follow',
    theme: '#ffffff',
  }
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  }

  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate meta tags input
 */
export function validateMetaTagsInput(input: Partial<MetaTagsInput>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (input.title && input.title.length > 60) {
    errors.push('タイトルは60文字以内にすることを推奨します')
  }

  if (input.description && input.description.length > 160) {
    errors.push('説明文は160文字以内にすることを推奨します')
  }

  if (input.url && !isValidUrl(input.url)) {
    errors.push('URLの形式が正しくありません')
  }

  if (input.image && !isValidUrl(input.image)) {
    errors.push('画像URLの形式が正しくありません')
  }

  if (input.canonical && !isValidUrl(input.canonical)) {
    errors.push('カノニカルURLの形式が正しくありません')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get meta tags preview data
 */
export function getMetaTagsPreview(input: Partial<MetaTagsInput>): {
  google: { title: string; url: string; description: string }
  facebook: { title: string; description: string; image?: string }
  twitter: { title: string; description: string; image?: string }
} {
  return {
    google: {
      title: input.title ?? 'タイトルなし',
      url: input.url ?? 'https://example.com',
      description: input.description ?? '説明文がありません',
    },
    facebook: {
      title: input.title ?? 'タイトルなし',
      description: input.description ?? '説明文がありません',
      image: input.image,
    },
    twitter: {
      title: input.title ?? 'タイトルなし',
      description: input.description ?? '説明文がありません',
      image: input.image,
    },
  }
}

/**
 * Common meta tags templates
 */
export const META_TAG_TEMPLATES = {
  blog: {
    type: 'article',
    twitterCard: 'summary_large_image' as const,
    robots: 'index, follow',
  },
  ecommerce: {
    type: 'website',
    twitterCard: 'summary_large_image' as const,
    robots: 'index, follow',
  },
  company: {
    type: 'website',
    twitterCard: 'summary' as const,
    robots: 'index, follow',
  },
  news: {
    type: 'article',
    twitterCard: 'summary_large_image' as const,
    robots: 'index, follow, news',
  },
}
