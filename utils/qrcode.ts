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
    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }

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
