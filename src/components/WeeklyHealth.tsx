import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useProfile } from '../store/useProfile'
import { lastNDays } from '../lib/dates'
import { classifyBp } from '../lib/bp'
import { sumNutrition } from '../lib/nutrition'
import { calcBadges, type Badge } from '../lib/streaks'
import { REWARDS, rewardState } from '../lib/rewards'

// 📋 이번 주 건강 성적표 — 흩어진 기록을 한눈에 + 교차 인사이트
export default function WeeklyHealth() {
  const profile = useProfile((s) => s.profile)
  const [selected, setSelected] = useState<Badge | null>(null)
  const [rewardTab, setRewardTab] = useState<'뱃지' | '보상'>('뱃지')
  const claims = useLiveQuery(() => db.rewardClaims.toArray(), [], [])

  const claimReward = async (rewardId: string, label: string) => {
    if (!confirm(`🎁 ${label} 쿠폰을 사용할까요?\n(진짜로 자신에게 선물해 주세요!)`)) return
    try {
      await db.rewardClaims.add({ rewardId, claimedAt: Date.now() })
    } catch {
      // 이미 사용된 쿠폰(&rewardId 유니크)은 무시
    }
  }
  const days = lastNDays(7)
  const daySet = new Set(days)

  const logs = useLiveQuery(() => db.logs.where('date').anyOf(days).toArray(), [days.join()], [])
  const sleepLogs = useLiveQuery(() => db.sleepLogs.where('date').anyOf(days).toArray(), [days.join()], [])
  const exerciseLogs = useLiveQuery(() => db.exerciseLogs.where('date').anyOf(days).toArray(), [days.join()], [])
  const bpLogs = useLiveQuery(() => db.bpLogs.where('date').anyOf(days).toArray(), [days.join()], [])
  const waterLogs = useLiveQuery(() => db.waterLogs.toArray(), [], [])
  const medLogs = useLiveQuery(() => db.medLogs.where('date').anyOf(days).toArray(), [days.join()], [])
  const weights = useLiveQuery(() => db.weights.toArray(), [], [])

  // --- 주간 지표 ---
  const sleeps = sleepLogs ?? []
  const avgSleep = sleeps.length
    ? Math.round((sleeps.reduce((s, l) => s + l.hours, 0) / sleeps.length) * 10) / 10
    : null

  const exs = exerciseLogs ?? []
  const burned = exs.reduce((s, l) => s + l.kcal, 0)

  const bps = bpLogs ?? []
  const avgSys = bps.length ? Math.round(bps.reduce((s, l) => s + l.systolic, 0) / bps.length) : null
  const avgDia = bps.length ? Math.round(bps.reduce((s, l) => s + l.diastolic, 0) / bps.length) : null
  const bpCat = avgSys != null && avgDia != null ? classifyBp(avgSys, avgDia) : null

  const waters = (waterLogs ?? []).filter((w) => daySet.has(w.date))
  const avgCups = waters.length
    ? Math.round((waters.reduce((s, w) => s + w.cups, 0) / waters.length) * 10) / 10
    : null

  const weekWeights = (weights ?? []).filter((w) => daySet.has(w.date)).sort((a, b) => a.date.localeCompare(b.date))
  const weightDelta =
    weekWeights.length >= 2
      ? Math.round((weekWeights[weekWeights.length - 1].weightKg - weekWeights[0].weightKg) * 10) / 10
      : null

  // --- 교차 인사이트: 수면과 식사량의 관계 ---
  const insight = (() => {
    const meals = logs ?? []
    const kcalByDay = new Map<string, number>()
    for (const l of meals) kcalByDay.set(l.date, (kcalByDay.get(l.date) ?? 0) + l.kcal)
    const short: number[] = []
    const good: number[] = []
    for (const s of sleeps) {
      const kcal = kcalByDay.get(s.date)
      if (kcal == null) continue
      ;(s.hours < 7 ? short : good).push(kcal)
    }
    if (short.length < 2 || good.length < 2) return null
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
    const diff = Math.round(avg(short) - avg(good))
    if (Math.abs(diff) < 100) return null
    return diff > 0
      ? `잠이 부족했던 날(7시간 미만)에 평균 ${diff}kcal 더 드셨어요. 수면이 식욕에 영향을 주고 있어요.`
      : `푹 잔 날에 오히려 ${Math.abs(diff)}kcal 더 드셨네요. 활동량이 늘어서일 수 있어요.`
  })()

  // --- 뱃지 ---
  const allLogs = useLiveQuery(() => db.logs.toArray(), [], [])
  const allEx = useLiveQuery(() => db.exerciseLogs.toArray(), [], [])
  const allSleep = useLiveQuery(() => db.sleepLogs.toArray(), [], [])
  const allBp = useLiveQuery(() => db.bpLogs.toArray(), [], [])
  const allMed = useLiveQuery(() => db.medLogs.toArray(), [], [])
  const badges = calcBadges({
    logs: allLogs ?? [],
    exerciseLogs: allEx ?? [],
    sleepLogs: allSleep ?? [],
    bpLogs: allBp ?? [],
    waterLogs: waterLogs ?? [],
    medLogs: allMed ?? [],
    weights: weights ?? [],
    profile: profile ?? null,
  })
  const earnedCount = badges.filter((b) => b.earned).length

  const nutrition = sumNutrition(logs ?? [])
  const hasAny =
    (logs ?? []).length + sleeps.length + exs.length + bps.length + waters.length + weekWeights.length > 0

  return (
    <>
      {/* 이번 주 건강 성적표 */}
      <div className="mx-5 mb-4 card p-5">
        <p className="mb-1 text-sm font-bold text-brand-800">📋 이번 주 건강 성적표</p>
        <p className="mb-3 text-xs text-brand-300">최근 7일의 모든 기록을 한눈에</p>

        {hasAny ? (
          <div className="grid grid-cols-3 gap-2">
            <Cell emoji="🍽️" label="총 섭취" value={nutrition.kcal > 0 ? `${(nutrition.kcal / 1000).toFixed(1)}k` : '—'} unit="kcal" />
            <Cell emoji="🏃" label="운동 소모" value={burned > 0 ? `${burned}` : '—'} unit={`kcal · ${exs.length}회`} />
            <Cell emoji="😴" label="평균 수면" value={avgSleep != null ? `${avgSleep}` : '—'} unit="시간" />
            <Cell
              emoji="🩺"
              label="평균 혈압"
              value={avgSys != null ? `${avgSys}/${avgDia}` : '—'}
              unit={bpCat ? bpCat.label : 'mmHg'}
            />
            <Cell emoji="💧" label="평균 물" value={avgCups != null ? `${avgCups}` : '—'} unit="잔/일" />
            <Cell
              emoji="⚖️"
              label="체중 변화"
              value={weightDelta != null ? `${weightDelta > 0 ? '+' : ''}${weightDelta}` : '—'}
              unit="kg"
              tone={weightDelta != null ? (weightDelta < 0 ? 'good' : weightDelta > 0 ? 'warn' : undefined) : undefined}
            />
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-brand-400">
            이번 주 기록이 아직 없어요. 오늘부터 채워볼까요?
          </p>
        )}

        {insight && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-ocean-50 p-3.5">
            <span>🔍</span>
            <p className="text-xs leading-relaxed text-ocean-600">{insight}</p>
          </div>
        )}
      </div>

      {/* 뱃지 & 보상 */}
      <div className="mx-5 mb-4 card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex rounded-xl bg-cream-200 p-0.5">
            {(['뱃지', '보상'] as const).map((tb) => (
              <button
                key={tb}
                onClick={() => setRewardTab(tb)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  rewardTab === tb ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-400'
                }`}
              >
                {tb === '뱃지' ? '🏅 뱃지' : '🎁 보상'}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-brand-400">
            뱃지 {earnedCount} / {badges.length}
          </span>
        </div>

        {rewardTab === '보상' ? (
          <>
            <div className="space-y-2.5">
              {REWARDS.map((rw) => {
                const state = rewardState(rw, earnedCount, claims ?? [])
                const claim = (claims ?? []).find((c) => c.rewardId === rw.id)
                return (
                  <div
                    key={rw.id}
                    className={`flex items-center gap-3 rounded-2xl border-2 border-dashed p-3.5 ${
                      state === '사용가능'
                        ? 'border-coral-300 bg-coral-50'
                        : state === '사용완료'
                          ? 'border-cream-300 bg-cream-100 opacity-70'
                          : 'border-cream-300 bg-cream-100'
                    }`}
                  >
                    <span className={`text-2xl ${state === '잠김' ? 'opacity-40 grayscale' : ''}`}>
                      {rw.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-brand-800">
                        {rw.label}
                        <span className="ml-1.5 text-[10px] font-semibold text-brand-300">
                          뱃지 {rw.need}개
                        </span>
                      </p>
                      <p className="text-xs text-brand-400">{rw.desc}</p>
                      {state === '잠김' && (
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-cream-300">
                          <div
                            className="h-full rounded-full bg-mango-500 transition-all"
                            style={{ width: `${Math.min(100, (earnedCount / rw.need) * 100)}%` }}
                          />
                        </div>
                      )}
                      {state === '사용완료' && claim && (
                        <p className="mt-0.5 text-[10px] text-brand-300">
                          {new Date(claim.claimedAt).toLocaleDateString('ko-KR')} 사용
                        </p>
                      )}
                    </div>
                    {state === '사용가능' ? (
                      <button
                        onClick={() => claimReward(rw.id, rw.label)}
                        className="shrink-0 rounded-xl bg-coral-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-coral-600 active:scale-95"
                      >
                        사용하기
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs font-bold text-brand-300">
                        {state === '사용완료' ? '✓ 사용완료' : `${earnedCount}/${rw.need}`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="mt-2.5 text-center text-[11px] leading-relaxed text-brand-300">
              쿠폰은 <b>나에게 주는 셀프 선물</b>이에요 😄
              <br />
              달성하면 진짜로 사 드시고 «사용하기»를 눌러 도장을 찍으세요!
            </p>
          </>
        ) : (
          <>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelected(b)}
              className={`flex flex-col items-center rounded-2xl px-1 py-2.5 text-center transition active:scale-95 ${
                b.earned
                  ? 'bg-mango-100 hover:bg-mango-300/40'
                  : 'bg-cream-100 opacity-60 grayscale hover:opacity-90'
              }`}
            >
              <span className="text-xl">{b.earned ? b.emoji : '🔒'}</span>
              <span className="mt-1 text-[10px] font-semibold leading-tight text-brand-700">
                {b.label}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-center text-[11px] text-brand-300">
          뱃지를 누르면 달성 조건이 보여요
        </p>
          </>
        )}
      </div>

      {/* 뱃지 상세 팝업 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                selected.earned ? 'bg-mango-100' : 'bg-cream-200 grayscale'
              }`}
            >
              {selected.earned ? selected.emoji : '🔒'}
            </div>
            <p className="mt-3 text-lg font-bold text-brand-800">
              {selected.emoji} {selected.label}
            </p>
            <p className="mt-1 text-sm text-brand-400">{selected.desc}</p>
            <p
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                selected.earned ? 'bg-ocean-50 text-ocean-600' : 'bg-cream-200 text-brand-500'
              }`}
            >
              {selected.earned ? '🎉 달성 완료!' : '아직 잠겨 있어요 — 도전해 보세요!'}
            </p>
            <button onClick={() => setSelected(null)} className="btn-primary mt-4 w-full">
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Cell({
  emoji,
  label,
  value,
  unit,
  tone,
}: {
  emoji: string
  label: string
  value: string
  unit: string
  tone?: 'good' | 'warn'
}) {
  return (
    <div className="rounded-2xl bg-cream-100 px-1 py-3 text-center">
      <p className="text-base">{emoji}</p>
      <p className="text-[10px] text-brand-400">{label}</p>
      <p
        className={`mt-0.5 text-sm font-bold tabular-nums ${
          tone === 'good' ? 'text-ocean-600' : tone === 'warn' ? 'text-coral-600' : 'text-brand-800'
        }`}
      >
        {value}
      </p>
      <p className="text-[9px] text-brand-300">{unit}</p>
    </div>
  )
}
