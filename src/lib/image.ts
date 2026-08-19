// 사진을 저장 가능한 크기로 줄여 data URL로 만든다.
// 휴대폰 사진은 3~8MB라 그대로 저장하면 브라우저 저장 공간을 금방 채운다.

const MAX_EDGE = 900 // 긴 변 기준 최대 픽셀
const QUALITY = 0.72 // JPEG 품질

export async function compressImage(file: File): Promise<string> {
  const bitmap = await loadBitmap(file)

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지를 처리할 수 없어요')
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, w, h)
  if ('close' in bitmap) (bitmap as ImageBitmap).close()

  return canvas.toDataURL('image/jpeg', QUALITY)
}

// createImageBitmap이 없는 브라우저(구형 iOS 등)를 위한 대체 경로
async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // 아래 <img> 방식으로 넘어간다
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('사진을 읽을 수 없어요'))
    }
    img.src = url
  })
}

/** data URL의 대략적인 바이트 크기 */
export function dataUrlBytes(dataUrl: string): number {
  const i = dataUrl.indexOf(',')
  if (i < 0) return 0
  return Math.round((dataUrl.length - i - 1) * 0.75)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
