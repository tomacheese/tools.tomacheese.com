/**
 * SEO と構造化データ管理のためのコンポーザブル
 */

export interface ToolSEOData {
  title: string
  description: string
  category: string
  keywords?: string[]
  type?: 'tool' | 'calculator' | 'generator' | 'converter' | 'analyzer'
}

export interface StructuredData {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  applicationCategory: string
  operatingSystem: string
  offers: {
    '@type': string
    price: string
  }
  creator?: {
    '@type': string
    name: string
  }
  about?: string[]
}

export const useSEO = () => {
  const route = useRoute()

  /**
   * ツールページのSEOメタデータとOGタグを設定
   */
  const setToolSEO = (data: ToolSEOData) => {
    const baseURL =
      process.env.DEPLOY_ENV === 'GH_PAGES'
        ? 'https://tomacheese.github.io/tools.tomacheese.com'
        : 'http://localhost:3000'

    const currentURL = baseURL + route.path
    const fullTitle = `${data.title} - Tools.tomacheese.com`

    // Basic SEO
    useSeoMeta({
      title: fullTitle,
      description: data.description,
      keywords: data.keywords?.join(', '),
      robots: 'index, follow',
      canonical: currentURL,

      // Open Graph
      ogTitle: fullTitle,
      ogDescription: data.description,
      ogUrl: currentURL,
      ogType: 'website',
      ogSiteName: 'Tools.tomacheese.com',
      ogLocale: 'ja_JP',

      // Twitter Card
      twitterCard: 'summary',
      twitterTitle: fullTitle,
      twitterDescription:
        data.description.length > 160
          ? `${data.description.substring(0, 157)}...`
          : data.description,
    })

    // 構造化データを設定
    setStructuredData(data, currentURL)
  }

  /**
   * 構造化データ（JSON-LD）を設定
   */
  const setStructuredData = (data: ToolSEOData, url: string) => {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: data.title,
      description: data.description,
      url,
      applicationCategory: mapCategoryToSchema(data.category),
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
      },
      creator: {
        '@type': 'Person',
        name: 'tomacheese',
      },
    }

    // キーワードがある場合は about フィールドに追加
    if (data.keywords && data.keywords.length > 0) {
      structuredData.about = data.keywords
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(structuredData),
        },
      ],
    })
  }

  /**
   * WebSiteスキーマの構造化データを設定（トップページ用）
   */
  const setWebsiteSchema = () => {
    const baseURL =
      process.env.DEPLOY_ENV === 'GH_PAGES'
        ? 'https://tomacheese.github.io/tools.tomacheese.com'
        : 'http://localhost:3000'

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Tools.tomacheese.com',
      description:
        'カラーピッカー、文字数カウンター、数学計算など、日常的に使える便利なWebツールを提供しています。無料で安全なブラウザ上で動作するオンラインツール集です。',
      url: baseURL,
      author: {
        '@type': 'Person',
        name: 'tomacheese',
      },
      inLanguage: 'ja',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseURL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(websiteSchema),
        },
      ],
    })
  }

  /**
   * カテゴリをSchema.orgの形式にマッピング
   */
  const mapCategoryToSchema = (category: string): string => {
    const categoryMap: Record<string, string> = {
      utility: 'UtilitiesApplication',
      calculator: 'UtilitiesApplication',
      generator: 'UtilitiesApplication',
      converter: 'UtilitiesApplication',
      analyzer: 'UtilitiesApplication',
      encoder: 'UtilitiesApplication',
      timer: 'UtilitiesApplication',
      color: 'GraphicsApplication',
      image: 'GraphicsApplication',
      text: 'UtilitiesApplication',
      number: 'UtilitiesApplication',
      health: 'HealthApplication',
      finance: 'FinanceApplication',
    }

    return categoryMap[category] || 'UtilitiesApplication'
  }

  /**
   * FAQ構造化データを生成
   */
  const generateFAQSchema = (
    faqs: Array<{ question: string; answer: string }>
  ) => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(faqSchema),
        },
      ],
    })
  }

  /**
   * BreadcrumbList構造化データを生成
   */
  const generateBreadcrumbSchema = (
    breadcrumbs: Array<{ name: string; url: string }>
  ) => {
    const baseURL =
      process.env.DEPLOY_ENV === 'GH_PAGES'
        ? 'https://tomacheese.github.io/tools.tomacheese.com'
        : 'http://localhost:3000'

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: `${baseURL}${breadcrumb.url}`,
      })),
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    })
  }

  return {
    setToolSEO,
    setWebsiteSchema,
    generateFAQSchema,
    generateBreadcrumbSchema,
  }
}
