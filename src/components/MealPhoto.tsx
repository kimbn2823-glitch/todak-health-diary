import { useRef, useState } from 'react'
import { db } from '../db/db'
import { compressImage, dataUrlBytes, formatBytes } from '../lib/image'
import type { MealLog } from '../types'

interface Props {
  log: MealLog
}

/**
 * 식단 기록에 사진을 붙이고 보여준다.
 * 휴대폰에서는 capture 속성 덕분에 바로 카메라가 열린다.
 */
export default function MealPhoto({ log }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState(false)

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // 같은 파일을 다시 골라도 change가 발생하도록 값을 비운다
    e.target.value = ''
    if (!file || log.id == null) return

    setBusy(true)
    setError('')
    try {
      const photo = await compressImage(file)
      await db.logs.update(log.id, { photo })
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진을 저장하지 못했어요')
    } finally {
      setBusy(false)
    }
  }

  const removePhoto = async () => {
    if (log.id == null) return
    await db.logs.update(log.id, { photo: undefined })
    setViewing(false)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={pick}
      />

      {log.photo ? (
        <button
          onClick={() => setViewing(true)}
          className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-cream-300"
          aria-label="사진 보기"
        >
          <img src={log.photo} alt="식단 사진" className="h-full w-full object-cover" />
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-lg text-brand-400 transition hover:bg-cream-300 disabled:opacity-50"
          aria-label="사진 추가"
        >
          {busy ? '…' : '📷'}
        </button>
      )}

      {error && <span className="text-[11px] text-coral-600">{error}</span>}

      {/* 사진 크게 보기 */}
      {viewing && log.photo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
          onClick={() => setViewing(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={log.photo} alt="식단 사진" className="max-h-[60vh] w-full object-contain" />
            <div className="p-4">
              <p className="text-sm font-bold text-brand-800">{log.foodName}</p>
              <p className="mt-0.5 text-xs text-brand-400">
                {log.kcal} kcal · 사진 {formatBytes(dataUrlBytes(log.photo))}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setViewing(false)
                    inputRef.current?.click()
                  }}
                  className="btn-ghost flex-1"
                >
                  다시 찍기
                </button>
                <button onClick={removePhoto} className="btn-ghost flex-1 text-coral-600">
                  사진 삭제
                </button>
              </div>
              <button onClick={() => setViewing(false)} className="btn-primary mt-2 w-full">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
