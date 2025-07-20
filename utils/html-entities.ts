const htmlEntities: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}

const namedEntities: { [key: string]: string } = {
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
  '§': '&sect;',
  '¶': '&para;',
  '•': '&bull;',
  '–': '&ndash;',
  '—': '&mdash;',
  ''': '&lsquo;',
  ''': '&rsquo;',
  '"': '&ldquo;',
  '"': '&rdquo;',
  '«': '&laquo;',
  '»': '&raquo;',
  '…': '&hellip;',
  '°': '&deg;',
  '±': '&plusmn;',
  '¼': '&frac14;',
  '½': '&frac12;',
  '¾': '&frac34;',
  '×': '&times;',
  '÷': '&divide;',
  '←': '&larr;',
  '→': '&rarr;',
  '↑': '&uarr;',
  '↓': '&darr;',
  '♠': '&spades;',
  '♣': '&clubs;',
  '♥': '&hearts;',
  '♦': '&diams;',
  ' ': '&nbsp;'
}

const reverseEntities: { [key: string]: string } = {}
for (const [char, entity] of Object.entries(htmlEntities)) {
  reverseEntities[entity] = char
}
for (const [char, entity] of Object.entries(namedEntities)) {
  reverseEntities[entity] = char
}

export interface EncodingOptions {
  useNamedEntities?: boolean
  encodeNonAscii?: boolean
  decimal?: boolean
}

export function encodeHTML(text: string, options: EncodingOptions = {}): string {
  const { useNamedEntities = true, encodeNonAscii = false, decimal = false } = options
  
  let result = text

  // First encode basic HTML entities
  result = result.replace(/[&<>"'`=\/]/g, (match) => htmlEntities[match] || match)

  // Encode named entities if requested
  if (useNamedEntities) {
    for (const [char, entity] of Object.entries(namedEntities)) {
      result = result.split(char).join(entity)
    }
  }

  // Encode non-ASCII characters if requested
  if (encodeNonAscii) {
    result = result.replace(/[\u0080-\uFFFF]/g, (match) => {
      const charCode = match.charCodeAt(0)
      if (decimal) {
        return `&#${charCode};`
      } else {
        return `&#x${charCode.toString(16).toUpperCase()};`
      }
    })
  }

  return result
}

export function decodeHTML(text: string): string {
  let result = text

  // Decode numeric entities (both decimal and hexadecimal)
  result = result.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10))
  })
  
  result = result.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })

  // Decode named entities
  for (const [entity, char] of Object.entries(reverseEntities)) {
    result = result.split(entity).join(char)
  }

  return result
}

export function encodeAttribute(text: string): string {
  // For attributes, we need to encode quotes and basic entities
  return text.replace(/[&<>"']/g, (match) => htmlEntities[match] || match)
}

export function stripTags(html: string): string {
  // Remove HTML tags but keep the content
  return html.replace(/<[^>]*>/g, '')
}

export function escapeForRegex(text: string): string {
  // Escape special regex characters
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export interface EntityInfo {
  character: string
  entity: string
  decimal: string
  hexadecimal: string
  description?: string
}

export function getCommonEntities(): EntityInfo[] {
  const entities: EntityInfo[] = [
    { character: '&', entity: '&amp;', decimal: '&#38;', hexadecimal: '&#x26;', description: 'アンパサンド' },
    { character: '<', entity: '&lt;', decimal: '&#60;', hexadecimal: '&#x3C;', description: '小なり記号' },
    { character: '>', entity: '&gt;', decimal: '&#62;', hexadecimal: '&#x3E;', description: '大なり記号' },
    { character: '"', entity: '&quot;', decimal: '&#34;', hexadecimal: '&#x22;', description: 'ダブルクォート' },
    { character: "'", entity: '&#39;', decimal: '&#39;', hexadecimal: '&#x27;', description: 'シングルクォート' },
    { character: '©', entity: '&copy;', decimal: '&#169;', hexadecimal: '&#xA9;', description: '著作権記号' },
    { character: '®', entity: '&reg;', decimal: '&#174;', hexadecimal: '&#xAE;', description: '登録商標記号' },
    { character: '™', entity: '&trade;', decimal: '&#8482;', hexadecimal: '&#x2122;', description: '商標記号' },
    { character: '€', entity: '&euro;', decimal: '&#8364;', hexadecimal: '&#x20AC;', description: 'ユーロ記号' },
    { character: '¥', entity: '&yen;', decimal: '&#165;', hexadecimal: '&#xA5;', description: '円記号' },
    { character: ' ', entity: '&nbsp;', decimal: '&#160;', hexadecimal: '&#xA0;', description: 'ノーブレークスペース' }
  ]
  
  return entities
}