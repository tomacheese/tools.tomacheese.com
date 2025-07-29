import * as QRCodeLib from 'qrcode'
import jsQR from 'jsqr'

interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

/**
 * QRコードを生成して、データURLとSVGの両方を返す
 * @param text エンコードするテキスト
 * @param options QRコードのオプション
 * @returns dataURLとSVGを含むオブジェクト
 */
export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<{ dataURL: string; svg: string }> {
  const width = options.width ?? 256
  const margin = options.margin ?? 4
  const darkColor = options.color?.dark ?? '#000000'
  const lightColor = options.color?.light ?? '#FFFFFF'

  const qrOptions = {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'M' as const,
  }

  try {
    // データURLとSVGを並行で生成
    const [dataURL, svg] = await Promise.all([
      QRCodeLib.toDataURL(text, qrOptions),
      QRCodeLib.toString(text, { type: 'svg', ...qrOptions }),
    ])

    return { dataURL, svg }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('QRコード生成エラー:', error)
    }
    throw new Error('QRコードの生成に失敗しました')
  }
}

/**
 * 画像データURLからQRコードを読み取る
 * @param imageDataURL 読み取る画像のデータURL
 * @returns デコードされたテキスト、読み取れない場合はnull
 */
export async function readQRCode(imageDataURL: string): Promise<string | null> {
  // 入力値のバリデーション
  if (!imageDataURL || typeof imageDataURL !== 'string') {
    return null
  }

  // data URL の基本的なバリデーション
  if (!imageDataURL.startsWith('data:image/')) {
    return null
  }

  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(imageData.data, imageData.width, imageData.height)

        if (result) {
          resolve(result.data)
        } else {
          resolve(null)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('QRコード読み取りエラー:', error)
        }
        resolve(null)
      }
    }

    img.onerror = () => {
      resolve(null)
    }

    // タイムアウト処理
    setTimeout(() => resolve(null), 5000)

    img.src = imageDataURL
  })
}

/**
 * QRコードを生成してそれを読み取り、正しく動作することを検証する
 * @param text 検証に使用するテキスト
 * @param options QRコードのオプション
 * @returns 検証結果
 */
export async function validateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<{
  success: boolean
  generated: boolean
  readable: boolean
  decodedText: string | null
  originalText: string
}> {
  try {
    // QRコードを生成
    const { dataURL } = await generateQRCode(text, options)
    const generated = !!dataURL

    // 生成されたQRコードを読み取り
    const decodedText = await readQRCode(dataURL)
    const readable = decodedText === text

    return {
      success: generated && readable,
      generated,
      readable,
      decodedText,
      originalText: text,
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('QRコード検証エラー:', error)
    }
    return {
      success: false,
      generated: false,
      readable: false,
      decodedText: null,
      originalText: text,
    }
  }
}

// 後方互換性のためのクラス（非推奨）
/**
 * @deprecated generateQRCode関数を使用してください
 */
export class QRCode {
  private text: string

  constructor(text: string) {
    this.text = text
  }

  async toDataURL(options: QRCodeOptions = {}): Promise<string> {
    const result = await generateQRCode(this.text, options)
    return result.dataURL
  }

  async toSVG(options: QRCodeOptions = {}): Promise<string> {
    const result = await generateQRCode(this.text, options)
    return result.svg
  }
}
