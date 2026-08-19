import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import { useProfile } from '../store/useProfile'
import { calcStreak, calcBadges, nextBadge } from '../lib/streaks'

// 🔥 연속 기록 스트릭 + 뱃지 요약 (홈)
export default function StreakCard() {
  const profile = useProfile((s) => s.profile)
  const logs = useLiveQuery(() => db.logs.toArray(), [], [])
  const exerciseLogs = useLiveQuery(() => db.exerciseLogs.toArray(), [], [])
  const sleepLogs = useLiveQuery(() => db.sleepLogs.toArray(), [], [])
  const bpLogs = useLiveQuery(() => db.bpLogs.toArray(), [], [])
  const waterLogs = useLiveQuery(() => db.waterLogs.toArray(), [], [])
  const medLogs = useLiveQuery(() => db.medLogs.toArray(), [], [])
  const weights = useLiveQuery(() => db.weights.toArray(), [], [])

  const streak = calcStreak(new Set((logs ?? []).map((l) => l.date)))
  const badges = calcBadges({
    logs: logs ?? [],
    exerciseLogs: exerciseLogs ?? [],
    sleepLogs: sleepLogs ?? [],
    bpLogs: bpLogs ?? [],
    waterLogs: waterLogs ?? [],
    medLogs: medLogs ?? [],
    weights: weights ?? [],
    profile: profile ?? null,
  })
  const earned = badges.filter((b) => b.earned)
  const next = nextBadge(badges)

  return (
    <Link to="/report" className="mx-5 mt-4 card block p-5 transition hover:shadow-lift">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand-800">
            {streak > 0 ? (
              <>
                🔥 <span className="text-coral-600">{streak}일 연속</span> 기록 중!
              </>
            ) : (
              '🔥 오늘 기록하면 스트릭 시작!'
            )}
          </p>
          <p className="mt-0.5 text-xs text-brand-400">
            {next
              ? `다음 뱃지: ${next.emoji} ${next.label} — ${next.desc}`
              : '모든 뱃지를 다 모았어요! 대단해요 👑'}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex -space-x-1.5">
            {earned.slice(-3).map((b) => (
              <span
                key={b.id}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-mango-100 text-base ring-2 ring-white"
                title={b.label}
              >
                {b.emoji}
              </span>
            ))}
            {earned.length === 0 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-base ring-2 ring-white">
                🔒
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] font-semibold text-brand-400">
            뱃지 {earned.length}/{badges.length}
          </p>
        </div>
      </div>
    </Link>
  )
}
