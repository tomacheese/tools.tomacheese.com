import QRCodeLib from 'qrcode'
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
 * QRコード生成クラス
 * qrcodeライブラリをラップして、既存のAPIとの互換性を保つ
 */
export class QRCode {
  private text: string

  constructor(text: string) {
    this.text = text
  }

  public async toDataURL(options: QRCodeOptions = {}): Promise<string> {
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
    }

    return await QRCodeLib.toDataURL(this.text, qrOptions)
  }

  public async toSVG(options: QRCodeOptions = {}): Promise<string> {
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
    }

    return await QRCodeLib.toString(this.text, {
      type: 'svg',
      ...qrOptions,
    })
  }
}

/**
 * QRコード生成関数
 * テキストからQRコードのDataURLとSVGを生成する
 */
export async function generateQRCode(
  text: string,
  options?: QRCodeOptions
): Promise<{ dataURL: string; svg: string }> {
  const qr = new QRCode(text)
  const [dataURL, svg] = await Promise.all([
    qr.toDataURL(options),
    qr.toSVG(options),
  ])

  return { dataURL, svg }
}

/**
 * QRコード読み取り機能
 * jsQRライブラリを使用して画像からQRコードをデコードする
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

  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Cannot get canvas context')
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          resolve(code.data)
        } else {
          resolve(null)
        }
      } catch (error) {
        console.error('QRコード読み取り中にエラーが発生しました:', error)
        resolve(null)
      }
    }

    img.onerror = () => {
      resolve(null)
    }

    // タイムアウト処理を追加
    setTimeout(() => resolve(null), 5000)

    img.src = imageDataURL
  })
}

/**
 * 生成されたQRコードを検証する関数
 * QRコードを生成してから、そのQRコードを読み取って正しいデータが入っているかチェック
 */
export async function verifyQRCode(
  text: string,
  options?: QRCodeOptions
): Promise<{ isValid: boolean; readData: string | null; generatedQR: { dataURL: string; svg: string } }> {
  try {
    // QRコードを生成
    const generatedQR = await generateQRCode(text, options)
    
    // 生成されたQRコードを読み取り
    const readData = await readQRCode(generatedQR.dataURL)
    
    // 元のテキストと読み取ったデータが一致するかチェック
    const isValid = readData === text
    
    return {
      isValid,
      readData,
      generatedQR
    }
  } catch (error) {
    console.error('QRコード検証中にエラーが発生しました:', error)
    return {
      isValid: false,
      readData: null,
      generatedQR: { dataURL: '', svg: '' }
    }
  }
}
