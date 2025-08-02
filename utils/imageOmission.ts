/**
 * 画像省略ツール用のユーティリティ関数
 */

export interface WaveLineOptions {
  color: string
  thickness: number
  amplitude: number
  frequency: number
  margin: number
  blurLevel: number
}

export interface OmissionRange {
  start: number
  end: number
}

export interface ImageOmissionOptions {
  image: HTMLImageElement
  range: OmissionRange
  waveOptions: WaveLineOptions
  isVertical: boolean
}

/**
 * デフォルトの波線オプション
 */
export const DEFAULT_WAVE_OPTIONS: WaveLineOptions = {
  color: '#333333',
  thickness: 5,
  amplitude: 15,
  frequency: 0.02,
  margin: 0,
  blurLevel: 10,
}

/**
 * 画像から主要色を抽出する関数
 */
export function extractDominantColor(image: HTMLImageElement): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return '#333333'

    // サンプリング用の小さなサイズに設定（パフォーマンス向上）
    const sampleSize = 100
    canvas.width = sampleSize
    canvas.height = sampleSize

    // 画像を描画
    ctx.drawImage(image, 0, 0, sampleSize, sampleSize)

    // 画像データを取得
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
    const data = imageData.data

    // 色の出現回数をカウント
    const colorCounts: { [key: string]: number } = {}

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]

      // 透明度が低い場合はスキップ
      if (alpha < 128) continue

      // 色を8段階に量子化して似た色をまとめる
      const quantizedR = Math.floor(r / 32) * 32
      const quantizedG = Math.floor(g / 32) * 32
      const quantizedB = Math.floor(b / 32) * 32

      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1
    }

    // 最も出現回数の多い色を取得
    let dominantColor = '96,96,96' // デフォルト色
    let maxCount = 0

    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count
        dominantColor = color
      }
    }

    // RGB値を取得し、70%に調整（読みやすい暗色に変換）
    const [r, g, b] = dominantColor.split(',').map(Number)
    const darkenedR = Math.floor(r * 0.7)
    const darkenedG = Math.floor(g * 0.7)
    const darkenedB = Math.floor(b * 0.7)

    // 16進数に変換
    const toHex = (value: number) => value.toString(16).padStart(2, '0')
    return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`
  } catch (error: unknown) {
    // Canvas APIが利用できない場合やエラーが発生した場合はデフォルト色を返す
    console.warn('Failed to extract dominant color from image:', error)
    return '#333333'
  }
}

/**
 * 画像が縦長かどうかを判定
 */
export function isVerticalImage(image: HTMLImageElement): boolean {
  return image.height > image.width
}

/**
 * 波線を描画する関数
 */
export function drawWaveLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: WaveLineOptions,
  isVertical: boolean
): void {
  ctx.strokeStyle = options.color
  ctx.lineWidth = options.thickness
  ctx.lineCap = 'round'

  ctx.beginPath()

  if (isVertical) {
    // 縦長画像の場合、横方向に波線を描画（端から端まで）
    const centerY = y + height / 2
    const waveLength = width

    ctx.moveTo(x, centerY)

    for (let i = 0; i <= waveLength; i++) {
      const currentX = x + i
      const waveY =
        centerY + Math.sin(i * options.frequency) * options.amplitude
      ctx.lineTo(currentX, waveY)
    }
  } else {
    // 横長画像の場合、縦方向に波線を描画（端から端まで）
    const centerX = x + width / 2
    const waveLength = height

    ctx.moveTo(centerX, y)

    for (let i = 0; i <= waveLength; i++) {
      const currentY = y + i
      const waveX =
        centerX + Math.sin(i * options.frequency) * options.amplitude
      ctx.lineTo(waveX, currentY)
    }
  }

  ctx.stroke()
}

/**
 * 省略範囲を検証する
 */
export function validateOmissionRange(
  range: OmissionRange,
  maxValue: number
): boolean {
  return (
    range.start >= 0 &&
    range.end >= 0 &&
    range.start < range.end &&
    range.end <= maxValue &&
    range.start < maxValue
  )
}

/**
 * 省略された画像を生成する
 */
export function generateOmittedImage(
  options: ImageOmissionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const { image, range, waveOptions, isVertical } = options

      if (
        !validateOmissionRange(range, isVertical ? image.height : image.width)
      ) {
        throw new Error('Invalid omission range')
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas context not available')
      }

      if (isVertical) {
        // 縦長画像の処理
        const omittedHeight = range.end - range.start
        const waveHeight = Math.max(50, Math.min(omittedHeight, 100))

        canvas.width = image.width
        canvas.height = image.height - omittedHeight + waveHeight

        // 上部分を描画
        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          range.start,
          0,
          0,
          image.width,
          range.start
        )

        // 省略部分にぼかした背景を描画
        const topHalfHeight = Math.floor(waveHeight / 2)
        const bottomHalfHeight = waveHeight - topHalfHeight

        // ぼかし効果を作成するための一時キャンバス
        const blurCanvas = document.createElement('canvas')
        const blurCtx = blurCanvas.getContext('2d')
        if (!blurCtx) throw new Error('Blur canvas context not available')

        blurCanvas.width = image.width
        blurCanvas.height = waveHeight

        // 重複を避けるため、波線幅以上のマージンを確保
        const margin = Math.max(waveHeight, 20)

        // 上半分：省略範囲より前の画像部分を使用（完全に外側から）
        const topSourceHeight = topHalfHeight
        const topSourceStart = Math.max(
          0,
          range.start - margin - topSourceHeight
        )
        if (
          topSourceStart >= 0 &&
          topSourceStart + topSourceHeight <= range.start - margin
        ) {
          blurCtx.drawImage(
            image,
            0,
            topSourceStart,
            image.width,
            topSourceHeight,
            0,
            0,
            image.width,
            topHalfHeight
          )
        } else {
          // フォールバック：利用可能な上部画像を使用
          const availableTop = Math.max(0, range.start - margin)
          if (availableTop > 0) {
            blurCtx.drawImage(
              image,
              0,
              0,
              image.width,
              availableTop,
              0,
              0,
              image.width,
              topHalfHeight
            )
          }
        }

        // 下半分：省略範囲より後の画像部分を使用（完全に外側から）
        const bottomSourceHeight = bottomHalfHeight
        const bottomSourceStart = Math.min(
          image.height - bottomSourceHeight,
          range.end + margin
        )
        if (
          bottomSourceStart >= range.end + margin &&
          bottomSourceStart + bottomSourceHeight <= image.height
        ) {
          blurCtx.drawImage(
            image,
            0,
            bottomSourceStart,
            image.width,
            bottomSourceHeight,
            0,
            topHalfHeight,
            image.width,
            bottomHalfHeight
          )
        } else {
          // フォールバック：利用可能な下部画像を使用
          const availableBottomStart = range.end + margin
          const availableBottomHeight = Math.max(
            0,
            image.height - availableBottomStart
          )
          if (
            availableBottomHeight > 0 &&
            availableBottomStart < image.height
          ) {
            blurCtx.drawImage(
              image,
              0,
              availableBottomStart,
              image.width,
              availableBottomHeight,
              0,
              topHalfHeight,
              image.width,
              bottomHalfHeight
            )
          }
        }

        // 手動ぼかし効果を適用
        if (waveOptions.blurLevel > 0 && blurCtx.getImageData) {
          const imageData = blurCtx.getImageData(
            0,
            0,
            blurCanvas.width,
            blurCanvas.height
          )
          const blurredData = applyGaussianBlur(
            imageData,
            waveOptions.blurLevel
          )
          blurCtx.putImageData(blurredData, 0, 0)
        }

        // ぼかした画像を描画
        ctx.drawImage(blurCanvas, 0, range.start)

        // 波線を描画
        drawWaveLine(
          ctx,
          0,
          range.start,
          image.width,
          waveHeight,
          waveOptions,
          true
        )

        // 下部分を描画
        const bottomY = range.start + waveHeight
        const sourceY = range.end
        const bottomHeight = image.height - range.end

        ctx.drawImage(
          image,
          0,
          sourceY,
          image.width,
          bottomHeight,
          0,
          bottomY,
          image.width,
          bottomHeight
        )
      } else {
        // 横長画像の処理
        const omittedWidth = range.end - range.start
        const waveWidth = Math.max(50, Math.min(omittedWidth, 100))

        canvas.width = image.width - omittedWidth + waveWidth
        canvas.height = image.height

        // 左部分を描画
        ctx.drawImage(
          image,
          0,
          0,
          range.start,
          image.height,
          0,
          0,
          range.start,
          image.height
        )

        // 省略部分にぼかした背景を描画
        const leftHalfWidth = Math.floor(waveWidth / 2)
        const rightHalfWidth = waveWidth - leftHalfWidth

        // ぼかし効果を作成するための一時キャンバス
        const blurCanvas = document.createElement('canvas')
        const blurCtx = blurCanvas.getContext('2d')
        if (!blurCtx) throw new Error('Blur canvas context not available')

        blurCanvas.width = waveWidth
        blurCanvas.height = image.height

        // 重複を避けるため、波線幅以上のマージンを確保
        const margin = Math.max(waveWidth, 20)

        // 左半分：省略範囲より前の画像部分を使用（完全に外側から）
        const leftSourceWidth = leftHalfWidth
        const leftSourceStart = Math.max(
          0,
          range.start - margin - leftSourceWidth
        )
        if (
          leftSourceStart >= 0 &&
          leftSourceStart + leftSourceWidth <= range.start - margin
        ) {
          blurCtx.drawImage(
            image,
            leftSourceStart,
            0,
            leftSourceWidth,
            image.height,
            0,
            0,
            leftHalfWidth,
            image.height
          )
        } else {
          // フォールバック：利用可能な左部画像を使用
          const availableLeft = Math.max(0, range.start - margin)
          if (availableLeft > 0) {
            blurCtx.drawImage(
              image,
              0,
              0,
              availableLeft,
              image.height,
              0,
              0,
              leftHalfWidth,
              image.height
            )
          }
        }

        // 右半分：省略範囲より後の画像部分を使用（完全に外側から）
        const rightSourceWidth = rightHalfWidth
        const rightSourceStart = Math.min(
          image.width - rightSourceWidth,
          range.end + margin
        )
        if (
          rightSourceStart >= range.end + margin &&
          rightSourceStart + rightSourceWidth <= image.width
        ) {
          blurCtx.drawImage(
            image,
            rightSourceStart,
            0,
            rightSourceWidth,
            image.height,
            leftHalfWidth,
            0,
            rightHalfWidth,
            image.height
          )
        } else {
          // フォールバック：利用可能な右部画像を使用
          const availableRightStart = range.end + margin
          const availableRightWidth = Math.max(
            0,
            image.width - availableRightStart
          )
          if (availableRightWidth > 0 && availableRightStart < image.width) {
            blurCtx.drawImage(
              image,
              availableRightStart,
              0,
              availableRightWidth,
              image.height,
              leftHalfWidth,
              0,
              rightHalfWidth,
              image.height
            )
          }
        }

        // 手動ぼかし効果を適用
        if (waveOptions.blurLevel > 0 && blurCtx.getImageData) {
          const imageData = blurCtx.getImageData(
            0,
            0,
            blurCanvas.width,
            blurCanvas.height
          )
          const blurredData = applyGaussianBlur(
            imageData,
            waveOptions.blurLevel
          )
          blurCtx.putImageData(blurredData, 0, 0)
        }

        // ぼかした画像を描画
        ctx.drawImage(blurCanvas, range.start, 0)

        // 波線を描画
        drawWaveLine(
          ctx,
          range.start,
          0,
          waveWidth,
          image.height,
          waveOptions,
          false
        )

        // 右部分を描画
        const rightX = range.start + waveWidth
        const sourceX = range.end
        const rightWidth = image.width - range.end

        ctx.drawImage(
          image,
          sourceX,
          0,
          rightWidth,
          image.height,
          rightX,
          0,
          rightWidth,
          image.height
        )
      }

      // 画像をBase64として出力
      const dataUrl = canvas.toDataURL('image/png')
      resolve(dataUrl)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 画像をファイルから読み込む
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      reject(
        new Error('Unsupported file type. Only JPEG and PNG are supported.')
      )
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Canvas から画像をダウンロードする
 */
export function downloadOmittedImage(
  dataUrl: string,
  filename: string = 'omitted-image.png'
): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 省略範囲のパーセンテージを計算
 */
export function calculateOmissionPercentage(
  range: OmissionRange,
  totalSize: number
): number {
  if (totalSize === 0) return 0
  const omittedSize = range.end - range.start
  return Math.round((omittedSize / totalSize) * 100)
}

/**
 * 手動ガウシアンぼかしを適用
 */
function applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
  if (radius === 0) return imageData

  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height

  // ガウシアンカーネルの生成
  const kernelSize = Math.ceil(radius * 3) * 2 + 1
  const kernel = generateGaussianKernel(radius, kernelSize)
  const half = Math.floor(kernelSize / 2)

  // 水平方向のぼかし
  const temp = new Uint8ClampedArray(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0
      let weightSum = 0

      for (let i = -half; i <= half; i++) {
        const nx = Math.max(0, Math.min(width - 1, x + i))
        const idx = (y * width + nx) * 4
        const weight = kernel[i + half]

        r += data[idx] * weight
        g += data[idx + 1] * weight
        b += data[idx + 2] * weight
        a += data[idx + 3] * weight
        weightSum += weight
      }

      const idx = (y * width + x) * 4
      temp[idx] = r / weightSum
      temp[idx + 1] = g / weightSum
      temp[idx + 2] = b / weightSum
      temp[idx + 3] = a / weightSum
    }
  }

  // 垂直方向のぼかし
  const result = new Uint8ClampedArray(data.length)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0
      let weightSum = 0

      for (let i = -half; i <= half; i++) {
        const ny = Math.max(0, Math.min(height - 1, y + i))
        const idx = (ny * width + x) * 4
        const weight = kernel[i + half]

        r += temp[idx] * weight
        g += temp[idx + 1] * weight
        b += temp[idx + 2] * weight
        a += temp[idx + 3] * weight
        weightSum += weight
      }

      const idx = (y * width + x) * 4
      result[idx] = r / weightSum
      result[idx + 1] = g / weightSum
      result[idx + 2] = b / weightSum
      result[idx + 3] = a / weightSum
    }
  }

  return new ImageData(result, width, height)
}

/**
 * ガウシアンカーネルを生成
 */
function generateGaussianKernel(radius: number, size: number): number[] {
  const kernel = new Array(size)
  const sigma = radius / 3
  const twoSigmaSquare = 2 * sigma * sigma
  const half = Math.floor(size / 2)

  let sum = 0
  for (let i = 0; i < size; i++) {
    const x = i - half
    kernel[i] = Math.exp(-(x * x) / twoSigmaSquare)
    sum += kernel[i]
  }

  // 正規化
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum
  }

  return kernel
}
