export interface ImageToBase64Options {
  format?: 'jpeg' | 'png' | 'webp'
  quality?: number
  maxWidth?: number
  maxHeight?: number
  includeDataUrl?: boolean
}

export interface Base64Result {
  base64: string
  dataUrl: string
  mimeType: string
  size: number
  width: number
  height: number
}

export function imageToBase64(
  file: File,
  options: ImageToBase64Options = {}
): Promise<Base64Result> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const img = new Image()

    reader.onload = e => {
      const dataUrl = e.target?.result as string
      img.src = dataUrl

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Calculate dimensions
          const { width, height } = calculateDimensions(
            img.width,
            img.height,
            options.maxWidth,
            options.maxHeight
          )

          canvas.width = width
          canvas.height = height

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height)

          // Determine output format
          const format = options.format || getFormatFromMimeType(file.type)
          const mimeType = getMimeTypeFromFormat(format)
          const quality = options.quality || 0.92

          // Convert to data URL
          const outputDataUrl = canvas.toDataURL(mimeType, quality)
          const base64 = outputDataUrl.split(',')[1]

          // Calculate size of base64 string
          const size = Math.round((base64.length * 3) / 4)

          resolve({
            base64,
            dataUrl: outputDataUrl,
            mimeType,
            size,
            width,
            height,
          })
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  if (!maxWidth && !maxHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight
  let width = originalWidth
  let height = originalHeight

  if (maxWidth && width > maxWidth) {
    width = maxWidth
    height = Math.round(width / aspectRatio)
  }

  if (maxHeight && height > maxHeight) {
    height = maxHeight
    width = Math.round(height * aspectRatio)
  }

  return { width, height }
}

function getFormatFromMimeType(mimeType: string): 'jpeg' | 'png' | 'webp' {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpeg'
    case 'image/webp':
      return 'webp'
    default:
      return 'png'
  }
}

function getMimeTypeFromFormat(format: 'jpeg' | 'png' | 'webp'): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/png'
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }

  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      document.body.removeChild(textarea)
      resolve()
    } catch (error) {
      document.body.removeChild(textarea)
      reject(error)
    }
  })
}

export function downloadAsText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      resolve(result)
    }
    reader.onerror = error => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

export function extractBase64FromDataUrl(dataUrl: string): string {
  const parts = dataUrl.split(',')
  return parts.length > 1 ? parts[1] : ''
}

export function calculateBase64Size(base64: string): number {
  // Remove padding characters and calculate the size
  const padding = (base64.match(/=/g) || []).length
  return Math.floor((base64.length * 3) / 4) - padding
}
