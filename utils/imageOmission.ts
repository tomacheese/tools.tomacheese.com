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
  thickness: 2,
  amplitude: 10,
  frequency: 0.02,
  margin: 0,
  blurLevel: 5,
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
        if (waveOptions.blurLevel > 0) {
          // 省略範囲の中央部分を取得してぼかし
          const blurSourceY =
            range.start + (range.end - range.start) / 2 - waveHeight / 2

          // 元画像の一部を描画してぼかし効果をシミュレート
          ctx.globalAlpha = 0.7 // 透明度を下げて「ぼかし」効果をシミュレート
          ctx.drawImage(
            image,
            0,
            Math.max(0, blurSourceY),
            image.width,
            waveHeight,
            0,
            range.start,
            image.width,
            waveHeight
          )
          ctx.globalAlpha = 1.0 // 透明度を元に戻す
        }

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
        if (waveOptions.blurLevel > 0) {
          // 省略範囲の中央部分を取得してぼかし
          const blurSourceX =
            range.start + (range.end - range.start) / 2 - waveWidth / 2

          // 元画像の一部を描画してぼかし効果をシミュレート
          ctx.globalAlpha = 0.7 // 透明度を下げて「ぼかし」効果をシミュレート
          ctx.drawImage(
            image,
            Math.max(0, blurSourceX),
            0,
            waveWidth,
            image.height,
            range.start,
            0,
            waveWidth,
            image.height
          )
          ctx.globalAlpha = 1.0 // 透明度を元に戻す
        }

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
