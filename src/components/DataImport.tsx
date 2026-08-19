import { useRef, useState } from 'react'
import type { Table } from 'dexie'
import { db } from '../db/db'

type Status = { kind: 'idle' } | { kind: 'ok'; msg: string } | { kind: 'err'; msg: string }

// 백업 JSON을 불러와 기기 간에 기록을 옮긴다.
export default function DataImport() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [busy, setBusy] = useState(false)

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (
      !confirm(
        '불러오면 지금 이 기기의 기록이 백업 파일의 내용으로 바뀝니다.\n계속할까요?'
      )
    )
      return

    setBusy(true)
    setStatus({ kind: 'idle' })
    try {
      const data = JSON.parse(await file.text())
      if (typeof data !== 'object' || data === null || !('version' in data)) {
        throw new Error('이 앱의 백업 파일이 아닌 것 같아요')
      }

      const counts: string[] = []
      await db.transaction(
        'rw',
        [db.profile, db.logs, db.weights, db.plans, db.meds, db.medLogs, db.exerciseLogs, db.sleepLogs, db.bpLogs, db.waterLogs, db.rewardClaims, db.foods],
        async () => {
          // 기존 기록을 비우고 백업 내용으로 교체 (음식 시드는 유지)
          await Promise.all([
            db.profile.clear(),
            db.logs.clear(),
            db.weights.clear(),
            db.plans.clear(),
            db.meds.clear(),
            db.medLogs.clear(),
            db.exerciseLogs.clear(),
            db.sleepLogs.clear(),
            db.bpLogs.clear(),
            db.waterLogs.clear(),
            db.rewardClaims.clear(),
            db.foods.filter((f) => f.isCustom).delete(),
          ])

          const put = async <T,>(table: Table<T, number>, rows: unknown, label: string) => {
            if (!Array.isArray(rows) || rows.length === 0) return
            // id 충돌을 피하려고 기존 키는 버리고 새로 넣는다
            const clean = rows.map((r) => {
              const { id, ...rest } = r as Record<string, unknown>
              void id
              return rest as T
            })
            await table.bulkAdd(clean)
            counts.push(`${label} ${clean.length}건`)
          }

          await put(db.profile, data.profile, '프로필')
          await put(db.logs, data.logs, '식단')
          await put(db.weights, data.weights, '체중')
          await put(db.plans, data.plans, '식단표')
          await put(db.meds, data.meds, '약')
          await put(db.medLogs, data.medLogs, '복용')
          await put(db.exerciseLogs, data.exerciseLogs, '운동')
          await put(db.sleepLogs, data.sleepLogs, '수면')
          await put(db.bpLogs, data.bpLogs, '혈압')
          await put(db.waterLogs, data.waterLogs, '물')
          await put(db.rewardClaims, data.rewardClaims, '보상')
          await put(db.foods, data.foods, '직접등록 음식')
        }
      )

      setStatus({
        kind: 'ok',
        msg: counts.length ? `불러왔어요 — ${counts.join(' · ')}` : '불러올 기록이 없었어요',
      })
      setTimeout(() => location.reload(), 1200)
    } catch (err) {
      setStatus({
        kind: 'err',
        msg: err instanceof Error ? err.message : '파일을 읽지 못했어요',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={handle} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-between px-3 py-3 text-left text-sm hover:bg-cream-100 disabled:opacity-50"
      >
        <span className="text-brand-700">
          {busy ? '불러오는 중…' : '백업 불러오기 (다른 기기에서 옮기기)'}
        </span>
        <span className="text-cream-400">↑</span>
      </button>
      {status.kind !== 'idle' && (
        <p
          className={`px-3 pb-2 text-xs ${
            status.kind === 'ok' ? 'text-ocean-600' : 'text-coral-600'
          }`}
        >
          {status.kind === 'ok' ? '✓ ' : '⚠️ '}
          {status.msg}
        </p>
      )}
    </>
  )
}
