/**
 * ファイル操作ユーティリティ関数
 * ブラウザ環境でのファイル読み込み・ダウンロード機能を提供
 */

/**
 * ファイルの内容をテキストとして読み込む
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const text = event.target?.result as string
      resolve(text || '')
    }

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * テキストをファイルとしてダウンロード
 */
export function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
