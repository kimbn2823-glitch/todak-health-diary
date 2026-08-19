import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { WaterLog } from '../types'
import { todayKey } from '../lib/dates'
import { ArtDroplet } from './HealthArt'

const MAX_CUPS = 8

// 💧 물 마시기 — 컵을 톡톡 눌러 채우는 수분 섭취 기록
export default function WaterCard() {
  const today = todayKey()
  const log = useLiveQuery(
    () => db.waterLogs.where('date').equals(today).first(),
    [today],
    undefined as WaterLog | undefined
  )
  const cups = log?.cups ?? 0

  const setCups = async (n: number) => {
    const next = Math.max(0, Math.min(MAX_CUPS, n))
    if (log?.id != null) {
      await db.waterLogs.update(log.id, { cups: next })
    } else {
      await db.waterLogs.add({ date: today, cups: next })
    }
  }

  // n번째 컵 탭: 그 컵까지 채움. 마지막으로 찬 컵을 다시 탭하면 한 잔 비움.
  const tap = (i: number) => setCups(i + 1 === cups ? cups - 1 : i + 1)

  const done = cups >= MAX_CUPS

  return (
    <div className="mx-5 mt-4 card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArtDroplet size={26} />
          <p className="text-sm font-bold text-brand-800">💧 물 마시기</p>
        </div>
        <span className={`text-sm font-bold tabular-nums ${done ? 'text-ocean-600' : 'text-brand-800'}`}>
          {cups}
          <span className="text-xs font-normal text-brand-300"> / {MAX_CUPS}잔</span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-8 gap-1.5">
        {Array.from({ length: MAX_CUPS }, (_, i) => {
          const filled = i < cups
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              aria-label={`${i + 1}잔`}
              className={`flex h-11 items-end justify-center rounded-xl border-2 pb-1 text-base transition active:scale-95 ${
                filled
                  ? 'border-ocean-300 bg-ocean-100'
                  : 'border-cream-300 bg-cream-100'
              }`}
            >
              <span className={filled ? '' : 'opacity-25 grayscale'}>💧</span>
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-center text-xs text-brand-400">
        {done
          ? '오늘 수분 충전 완료! 잘하셨어요 🎉'
          : cups === 0
            ? '마신 만큼 컵을 눌러주세요 (한 컵 ≈ 250ml)'
            : `${MAX_CUPS - cups}잔 남았어요. 틈틈이 마셔요!`}
      </p>
    </div>
  )
}
