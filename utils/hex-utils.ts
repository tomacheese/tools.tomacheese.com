/**
 * ランダムな16進数文字列生成の共通ユーティリティ
 */

export interface RandomHexOptions {
  uppercase?: boolean
}

/**
 * ランダムな16進数文字列を生成する
 */
export function generateRandomHex(
  length: number,
  options: RandomHexOptions = {}
): string {
  if (length < 1) {
    throw new Error('長さは1以上である必要があります')
  }

  const { uppercase = false } = options
  const hexChars = uppercase ? '0123456789ABCDEF' : '0123456789abcdef'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += hexChars[Math.floor(Math.random() * hexChars.length)]
  }

  return result
}