// QRコード生成のための純粋なJavaScript実装
// 簡易版のQRコード生成（サイズ制限あり）

interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

export class QRCode {
  private modules: boolean[][]
  private size: number

  constructor(text: string) {
    // 簡易実装のため、固定サイズのQRコードを生成
    this.size = 25
    this.modules = Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(false))
    this.generatePattern(text)
  }

  private generatePattern(text: string): void {
    // 位置検出パターンを配置
    this.drawPositionPattern(0, 0)
    this.drawPositionPattern(this.size - 7, 0)
    this.drawPositionPattern(0, this.size - 7)

    // タイミングパターンを配置
    this.drawTimingPattern()

    // データをエンコード（簡易版）
    this.encodeData(text)
  }

  private drawPositionPattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (row + r <= -1 || this.size <= row + r) continue
        if (col + c <= -1 || this.size <= col + c) continue

        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true
        } else {
          this.modules[row + r][col + c] = false
        }
      }
    }
  }

  private drawTimingPattern(): void {
    for (let i = 8; i < this.size - 8; i++) {
      if (this.modules[i][6] !== null) continue
      this.modules[i][6] = i % 2 === 0
    }

    for (let i = 8; i < this.size - 8; i++) {
      if (this.modules[6][i] !== null) continue
      this.modules[6][i] = i % 2 === 0
    }
  }

  private encodeData(text: string): void {
    // 簡易的なデータエンコーディング
    // 実際のQRコードは複雑なリードソロモン誤り訂正を使用しますが、
    // ここでは簡易的なパターンを生成します
    const data = text.split('').map(c => c.charCodeAt(0))
    let dataIndex = 0

    // データを配置（簡易版）
    for (let col = this.size - 1; col > 0; col -= 2) {
      if (col === 6) col--

      for (let vert = 0; vert < this.size; vert++) {
        for (let c = 0; c < 2; c++) {
          const x = col - c
          const y = ((col + 1) & 2) === 0 ? this.size - 1 - vert : vert

          if (this.modules[y][x] !== null) continue

          if (dataIndex < data.length) {
            const bit =
              (data[Math.floor(dataIndex / 8)] >> (7 - (dataIndex % 8))) & 1
            this.modules[y][x] = bit === 1
            dataIndex++
          } else {
            // パディング
            this.modules[y][x] = false
          }
        }
      }
    }
  }

  public toDataURL(options: QRCodeOptions = {}): string {
    const width = options.width ?? 256
    const margin = options.margin ?? 4
    const darkColor = options.color?.dark ?? '#000000'
    const lightColor = options.color?.light ?? '#FFFFFF'

    const cellSize = Math.floor((width - 2 * margin) / this.size)
    const canvasSize = cellSize * this.size + 2 * margin

    // Canvas要素を作成
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Cannot get canvas context')

    // 背景を描画
    ctx.fillStyle = lightColor
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // モジュールを描画
    ctx.fillStyle = darkColor
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.modules[row][col]) {
          ctx.fillRect(
            margin + col * cellSize,
            margin + row * cellSize,
            cellSize,
            cellSize
          )
        }
      }
    }

    return canvas.toDataURL()
  }

  public toSVG(options: QRCodeOptions = {}): string {
    const width = options.width ?? 256
    const margin = options.margin ?? 4
    const darkColor = options.color?.dark ?? '#000000'
    const lightColor = options.color?.light ?? '#FFFFFF'

    const cellSize = Math.floor((width - 2 * margin) / this.size)
    const svgSize = cellSize * this.size + 2 * margin

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`
    svg += `<rect width="${svgSize}" height="${svgSize}" fill="${lightColor}"/>`

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.modules[row][col]) {
          svg += `<rect x="${margin + col * cellSize}" y="${margin + row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${darkColor}"/>`
        }
      }
    }

    svg += '</svg>'
    return svg
  }
}

export function generateQRCode(
  text: string,
  options?: QRCodeOptions
): { dataURL: string; svg: string } {
  const qr = new QRCode(text)
  return {
    dataURL: qr.toDataURL(options),
    svg: qr.toSVG(options),
  }
}

// QRコード読み取り機能
export async function readQRCode(imageDataURL: string): Promise<string | null> {
  // 入力値のバリデーション
  if (!imageDataURL || typeof imageDataURL !== 'string') {
    return null
  }

  // data URL の基本的なバリデーション
  if (!imageDataURL.startsWith('data:image/')) {
    return null
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Cannot get canvas context')
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = decodeQRCode(imageData)
        resolve(result)
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    
    // タイムアウト処理を追加
    setTimeout(() => resolve(null), 3000)
    
    img.src = imageDataURL
  })
}

// 簡易QRコードデコーダー（基本的なパターン認識）
function decodeQRCode(imageData: ImageData): string | null {
  // この実装は簡易版です。実際のQRコードデコーダーは非常に複雑です。
  // ここでは基本的なパターン認識を行い、シンプルなQRコードのみを対象とします。
  
  const { data, width, height } = imageData
  
  // グレースケール変換
  const grayscale = new Uint8Array(width * height)
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    grayscale[i / 4] = gray
  }
  
  // 二値化（大津の手法の簡易版）
  const threshold = calculateThreshold(grayscale)
  const binary = grayscale.map(pixel => pixel > threshold ? 255 : 0)
  
  // QRコードのパターン検出
  const qrData = findQRPattern(binary, width, height)
  if (!qrData) return null
  
  // データ領域の解析（簡易版）
  return extractData(qrData)
}

function calculateThreshold(grayscale: Uint8Array): number {
  // 簡易的な閾値計算（平均値ベース）
  const sum = grayscale.reduce((acc, val) => acc + val, 0)
  return sum / grayscale.length
}

function findQRPattern(binary: Uint8Array, width: number, height: number): QRPatternData | null {
  // 位置検出パターンを探す
  const patterns = []
  
  for (let y = 0; y < height - 7; y++) {
    for (let x = 0; x < width - 7; x++) {
      if (isPositionPattern(binary, x, y, width)) {
        patterns.push({ x, y })
      }
    }
  }
  
  // 3つの位置検出パターンが見つかった場合のみ処理
  if (patterns.length >= 3) {
    return {
      patterns,
      binary,
      width,
      height
    }
  }
  
  return null
}

function isPositionPattern(binary: Uint8Array, x: number, y: number, width: number): boolean {
  // 7x7の位置検出パターンをチェック
  const pattern = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 255, 255, 255, 255, 255, 0],
    [0, 255, 0, 0, 0, 255, 0],
    [0, 255, 0, 255, 0, 255, 0],
    [0, 255, 0, 0, 0, 255, 0],
    [0, 255, 255, 255, 255, 255, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ]
  
  for (let dy = 0; dy < 7; dy++) {
    for (let dx = 0; dx < 7; dx++) {
      const pixelIndex = (y + dy) * width + (x + dx)
      if (binary[pixelIndex] !== pattern[dy][dx]) {
        return false
      }
    }
  }
  
  return true
}

interface QRPatternData {
  patterns: Array<{ x: number; y: number }>
  binary: Uint8Array
  width: number
  height: number
}

function extractData(_qrData: QRPatternData): string | null {
  // 簡易的なデータ抽出
  // 実際のQRコードは複雑なエラー訂正とデータ形式を使用しますが、
  // ここでは限定的なパターンのみをサポートします
  
  // 今回は簡易実装として、よく使われるパターンを返します
  // 実際の実装では、QRコードの仕様に基づいた複雑なデコード処理が必要です
  return 'QRコードが検出されましたが、この簡易実装では完全なデコードはサポートされていません。'
}
