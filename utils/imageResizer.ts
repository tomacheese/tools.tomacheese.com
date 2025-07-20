export interface ResizeOptions {
  width?: number
  height?: number
  maintainAspectRatio?: boolean
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export interface ImageInfo {
  width: number
  height: number
  size: number
  type: string
}

export function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      const { width, height } = calculateDimensions(
        img.width,
        img.height,
        options.width,
        options.height,
        options.maintainAspectRatio ?? true
      )

      canvas.width = width
      canvas.height = height

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw the image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      const format = options.format || getFormatFromMimeType(file.type)
      const mimeType = getMimeTypeFromFormat(format)
      const quality = options.quality || 0.92

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      }, mimeType, quality)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number,
  maintainAspectRatio?: boolean
): { width: number; height: number } {
  if (!targetWidth && !targetHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  if (!maintainAspectRatio) {
    return {
      width: targetWidth || originalWidth,
      height: targetHeight || originalHeight
    }
  }

  const aspectRatio = originalWidth / originalHeight

  if (targetWidth && targetHeight) {
    // Both dimensions specified, fit within bounds
    const targetRatio = targetWidth / targetHeight
    if (aspectRatio > targetRatio) {
      // Image is wider
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio)
      }
    } else {
      // Image is taller
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight
      }
    }
  } else if (targetWidth) {
    // Only width specified
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio)
    }
  } else if (targetHeight) {
    // Only height specified
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight
    }
  }

  return { width: originalWidth, height: originalHeight }
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

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function generateFilename(originalName: string, format: string, suffix = 'resized'): string {
  const parts = originalName.split('.')
  const nameWithoutExt = parts.slice(0, -1).join('.')
  return `${nameWithoutExt}_${suffix}.${format}`
}