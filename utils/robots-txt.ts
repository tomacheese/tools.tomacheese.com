/**
 * robots.txt生成のためのユーティリティ関数
 */

/**
 * ユーザーエージェント設定
 */
export interface UserAgentRule {
  /** ユーザーエージェント名 */
  userAgent: string
  /** 許可するパス */
  allow: string[]
  /** 禁止するパス */
  disallow: string[]
  /** クロール遅延（秒） */
  crawlDelay?: number
}

/**
 * robots.txt設定
 */
export interface RobotsTxtConfig {
  /** ユーザーエージェント別ルール */
  userAgentRules: UserAgentRule[]
  /** サイトマップURL */
  sitemaps: string[]
  /** その他のカスタムディレクティブ */
  customDirectives: string[]
}

/**
 * デフォルトのUser-Agent設定を取得
 */
export function getDefaultUserAgents(): { name: string; description: string }[] {
  return [
    { name: '*', description: 'すべてのクローラー' },
    { name: 'Googlebot', description: 'Google検索エンジン' },
    { name: 'Bingbot', description: 'Bing検索エンジン' },
    { name: 'Slurp', description: 'Yahoo!検索エンジン' },
    { name: 'DuckDuckBot', description: 'DuckDuckGo検索エンジン' },
    { name: 'Baiduspider', description: 'Baidu検索エンジン' },
    { name: 'facebookexternalhit', description: 'Facebook' },
    { name: 'Twitterbot', description: 'Twitter' },
    { name: 'LinkedInBot', description: 'LinkedIn' },
    { name: 'ia_archiver', description: 'Internet Archive' },
  ]
}

/**
 * よく使われるパスパターンを取得
 */
export function getCommonPaths(): { path: string; description: string; type: 'allow' | 'disallow' }[] {
  return [
    { path: '/', description: 'サイト全体', type: 'allow' },
    { path: '/admin/', description: '管理者ページ', type: 'disallow' },
    { path: '/private/', description: 'プライベートページ', type: 'disallow' },
    { path: '/wp-admin/', description: 'WordPress管理画面', type: 'disallow' },
    { path: '/wp-content/uploads/', description: 'WordPressアップロード', type: 'allow' },
    { path: '/wp-includes/', description: 'WordPressファイル', type: 'disallow' },
    { path: '/cgi-bin/', description: 'CGIディレクトリ', type: 'disallow' },
    { path: '/tmp/', description: '一時ファイル', type: 'disallow' },
    { path: '/search/', description: '検索ページ', type: 'disallow' },
    { path: '/login/', description: 'ログインページ', type: 'disallow' },
    { path: '/*.pdf', description: 'PDFファイル', type: 'allow' },
    { path: '/*.jpg', description: 'JPG画像', type: 'allow' },
    { path: '/*.png', description: 'PNG画像', type: 'allow' },
    { path: '/*.gif', description: 'GIF画像', type: 'allow' },
    { path: '/*.css', description: 'CSSファイル', type: 'allow' },
    { path: '/*.js', description: 'JavaScriptファイル', type: 'allow' },
  ]
}

/**
 * robots.txtのテンプレートを取得
 */
export function getRobotsTxtTemplates(): { name: string; description: string; config: RobotsTxtConfig }[] {
  return [
    {
      name: '全て許可',
      description: 'すべてのクローラーにサイト全体へのアクセスを許可',
      config: {
        userAgentRules: [
          {
            userAgent: '*',
            allow: ['/'],
            disallow: [],
          },
        ],
        sitemaps: [],
        customDirectives: [],
      },
    },
    {
      name: '全て禁止',
      description: 'すべてのクローラーのアクセスを禁止',
      config: {
        userAgentRules: [
          {
            userAgent: '*',
            allow: [],
            disallow: ['/'],
          },
        ],
        sitemaps: [],
        customDirectives: [],
      },
    },
    {
      name: '基本設定',
      description: '一般的なサイトの基本設定（管理画面等を禁止）',
      config: {
        userAgentRules: [
          {
            userAgent: '*',
            allow: ['/'],
            disallow: ['/admin/', '/private/', '/cgi-bin/', '/tmp/'],
          },
        ],
        sitemaps: ['https://example.com/sitemap.xml'],
        customDirectives: [],
      },
    },
    {
      name: 'WordPress',
      description: 'WordPress サイト向けの設定',
      config: {
        userAgentRules: [
          {
            userAgent: '*',
            allow: ['/wp-content/uploads/', '/*.css', '/*.js'],
            disallow: ['/wp-admin/', '/wp-includes/', '/wp-content/plugins/', '/wp-content/themes/'],
          },
        ],
        sitemaps: ['https://example.com/sitemap_index.xml'],
        customDirectives: [],
      },
    },
    {
      name: 'ECサイト',
      description: 'ECサイト向けの設定（カート、検索結果等を制御）',
      config: {
        userAgentRules: [
          {
            userAgent: '*',
            allow: ['/products/', '/categories/', '/*.jpg', '/*.png'],
            disallow: ['/cart/', '/checkout/', '/search/', '/admin/', '/user/'],
          },
        ],
        sitemaps: ['https://example.com/sitemap.xml', 'https://example.com/products-sitemap.xml'],
        customDirectives: [],
      },
    },
  ]
}

/**
 * URLが有効かどうかを検証
 */
export function validateUrl(url: string): boolean {
  if (!url.trim()) return false
  
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * パスの形式を検証
 */
export function validatePath(path: string): boolean {
  if (!path.trim()) return false
  
  // パスは / で始まるか、ワイルドカードパターンである必要がある
  return path.startsWith('/') || path.includes('*')
}

/**
 * User-Agent名を検証
 */
export function validateUserAgent(userAgent: string): boolean {
  if (!userAgent.trim()) return false
  
  // ワイルドカードは例外として許可、それ以外は空白文字やタブを含まない
  if (userAgent === '*') return true
  return !/\s/.test(userAgent)
}

/**
 * robots.txtを生成
 */
export function generateRobotsTxt(config: RobotsTxtConfig): string {
  const lines: string[] = []
  
  // ヘッダーコメント
  lines.push('# robots.txt generated by Tools.tomacheese.com')
  lines.push('# https://tools.tomacheese.com/tools/robots-txt-generator')
  lines.push('')
  
  // ユーザーエージェント別ルール
  config.userAgentRules.forEach((rule, index) => {
    if (index > 0) {
      lines.push('') // ルール間に空行を挿入
    }
    
    lines.push(`User-agent: ${rule.userAgent}`)
    
    // Allow ディレクティブ
    rule.allow.forEach(path => {
      if (path.trim()) {
        lines.push(`Allow: ${path}`)
      }
    })
    
    // Disallow ディレクティブ
    rule.disallow.forEach(path => {
      if (path.trim()) {
        lines.push(`Disallow: ${path}`)
      }
    })
    
    // Crawl-delay ディレクティブ
    if (rule.crawlDelay && rule.crawlDelay > 0) {
      lines.push(`Crawl-delay: ${rule.crawlDelay}`)
    }
  })
  
  // サイトマップ
  if (config.sitemaps.length > 0) {
    lines.push('')
    config.sitemaps.forEach(sitemap => {
      if (sitemap.trim() && validateUrl(sitemap)) {
        lines.push(`Sitemap: ${sitemap}`)
      }
    })
  }
  
  // カスタムディレクティブ
  if (config.customDirectives.length > 0) {
    lines.push('')
    config.customDirectives.forEach(directive => {
      if (directive.trim()) {
        lines.push(directive)
      }
    })
  }
  
  return lines.join('\n')
}

/**
 * robots.txtを解析
 */
export function parseRobotsTxt(content: string): RobotsTxtConfig {
  const lines = content.split('\n').map(line => line.trim())
  const userAgentRules: UserAgentRule[] = []
  const sitemaps: string[] = []
  const customDirectives: string[] = []
  
  let currentRule: UserAgentRule | null = null
  
  lines.forEach(line => {
    // コメント行をスキップ
    if (line.startsWith('#') || !line) {
      return
    }
    
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) {
      // ディレクティブの形式でない場合はカスタムディレクティブとして追加
      if (line.trim()) {
        customDirectives.push(line)
      }
      return
    }
    
    const directive = line.substring(0, colonIndex).trim().toLowerCase()
    const value = line.substring(colonIndex + 1).trim()
    
    switch (directive) {
      case 'user-agent':
        // 新しいユーザーエージェントルール開始
        if (currentRule) {
          userAgentRules.push(currentRule)
        }
        currentRule = {
          userAgent: value,
          allow: [],
          disallow: [],
        }
        break
        
      case 'allow':
        if (currentRule && value) {
          currentRule.allow.push(value)
        }
        break
        
      case 'disallow':
        if (currentRule && value) {
          currentRule.disallow.push(value)
        }
        break
        
      case 'crawl-delay':
        if (currentRule) {
          const delay = parseInt(value, 10)
          if (!isNaN(delay) && delay > 0) {
            currentRule.crawlDelay = delay
          }
        }
        break
        
      case 'sitemap':
        if (validateUrl(value)) {
          sitemaps.push(value)
        }
        break
        
      default:
        // 認識されないディレクティブはカスタムディレクティブとして追加
        customDirectives.push(line)
        break
    }
  })
  
  // 最後のルールを追加
  if (currentRule) {
    userAgentRules.push(currentRule)
  }
  
  return {
    userAgentRules,
    sitemaps,
    customDirectives,
  }
}

/**
 * robots.txt の基本的な検証
 */
export function validateRobotsTxt(config: RobotsTxtConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // ユーザーエージェントルールの検証
  if (config.userAgentRules.length === 0) {
    errors.push('少なくとも1つのUser-Agentルールが必要です')
  }
  
  config.userAgentRules.forEach((rule, index) => {
    if (!validateUserAgent(rule.userAgent)) {
      errors.push(`ルール${index + 1}: User-Agent「${rule.userAgent}」が無効です`)
    }
    
    rule.allow.forEach(path => {
      if (!validatePath(path)) {
        errors.push(`ルール${index + 1}: Allow パス「${path}」が無効です`)
      }
    })
    
    rule.disallow.forEach(path => {
      if (!validatePath(path)) {
        errors.push(`ルール${index + 1}: Disallow パス「${path}」が無効です`)
      }
    })
    
    if (rule.crawlDelay !== undefined && (rule.crawlDelay < 0 || !Number.isInteger(rule.crawlDelay))) {
      errors.push(`ルール${index + 1}: Crawl-delay「${rule.crawlDelay}」が無効です（正の整数である必要があります）`)
    }
  })
  
  // サイトマップURLの検証
  config.sitemaps.forEach(sitemap => {
    if (!validateUrl(sitemap)) {
      errors.push(`サイトマップURL「${sitemap}」が無効です`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * ファイルサイズを計算（バイト）
 */
export function calculateFileSize(content: string): number {
  return new Blob([content]).size
}

/**
 * robots.txtのプレビュー情報を生成
 */
export function generatePreviewInfo(config: RobotsTxtConfig): {
  totalRules: number
  totalSitemaps: number
  hasWildcardRule: boolean
  restrictiveRules: number
  estimatedSize: string
} {
  const content = generateRobotsTxt(config)
  const fileSize = calculateFileSize(content)
  
  const totalRules = config.userAgentRules.length
  const totalSitemaps = config.sitemaps.length
  const hasWildcardRule = config.userAgentRules.some(rule => rule.userAgent === '*')
  const restrictiveRules = config.userAgentRules.filter(rule => 
    rule.disallow.length > 0 || rule.crawlDelay !== undefined
  ).length
  
  const estimatedSize = fileSize < 1024 
    ? `${fileSize} bytes`
    : `${(fileSize / 1024).toFixed(1)} KB`
  
  return {
    totalRules,
    totalSitemaps,
    hasWildcardRule,
    restrictiveRules,
    estimatedSize,
  }
}