export async function generateHash(text: string, algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)

  let buffer: ArrayBuffer

  if (algorithm === 'MD5') {
    // MD5はWeb Crypto APIではサポートされていないため、手動実装
    buffer = await generateMD5(data)
  } else {
    // Web Crypto APIを使用
    buffer = await crypto.subtle.digest(algorithm, data)
  }

  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// MD5実装（最小限の実装）
async function generateMD5(data: Uint8Array): Promise<ArrayBuffer> {
  // MD5の定数
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ]

  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]

  let h0 = 0x67452301
  let h1 = 0xEFCDAB89
  let h2 = 0x98BADCFE
  let h3 = 0x10325476

  // パディング
  const msgLen = data.length
  const bitLen = msgLen * 8
  const newLen = msgLen + 1
  const padLen = (newLen % 64 < 56) ? 56 - (newLen % 64) : 120 - (newLen % 64)
  const totalLen = newLen + padLen + 8

  const padded = new Uint8Array(totalLen)
  padded.set(data)
  padded[msgLen] = 0x80

  const view = new DataView(padded.buffer)
  view.setUint32(totalLen - 8, bitLen >>> 0, true)
  view.setUint32(totalLen - 4, 0, true)

  // MD5の処理
  for (let offset = 0; offset < totalLen; offset += 64) {
    const chunk = padded.slice(offset, offset + 64)
    const M = new Uint32Array(16)
    for (let i = 0; i < 16; i++) {
      M[i] = (chunk[i * 4] | (chunk[i * 4 + 1] << 8) | (chunk[i * 4 + 2] << 16) | (chunk[i * 4 + 3] << 24)) >>> 0
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3

    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number

      if (i < 16) {
        f = (b & c) | ((~b >>> 0) & d)
        g = i
      } else if (i < 32) {
        f = (d & b) | ((~d >>> 0) & c)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = b ^ c ^ d
        g = (3 * i + 5) % 16
      } else {
        f = c ^ (b | (~d >>> 0))
        g = (7 * i) % 16
      }

      const temp = d
      d = c
      c = b
      b = (b + leftRotate((a + f + K[i] + M[g]) >>> 0, s[i])) >>> 0
      a = temp
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
  }

  const result = new ArrayBuffer(16)
  const resultView = new DataView(result)
  resultView.setUint32(0, h0, true)
  resultView.setUint32(4, h1, true)
  resultView.setUint32(8, h2, true)
  resultView.setUint32(12, h3, true)

  return result
}

function leftRotate(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0
}