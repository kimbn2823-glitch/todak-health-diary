import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from 'recharts'
import { db } from '../db/db'
import { SLEEP_QUALITIES, type SleepLog, type SleepQuality } from '../types'
import { todayKey, shiftDay, formatKorean, formatShort, isToday, lastNDays } from '../lib/dates'
import {
  calcSleepHours,
  assessSleep,
  averageHours,
  qualityCounts,
  QUALITY_EMOJI,
  QUALITY_COLOR,
  IDEAL_MIN,
  IDEAL_MAX,
} from '../lib/sleep'
import PageHeader from '../components/PageHeader'
import Character from '../components/Character'

export default function Sleep() {
  const [date, setDate] = useState(todayKey())
  const [bedTime, setBedTime] = useState('23:30')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState<SleepQuality>('보통')
  const [memo, setMemo] = useState('')

  const all = useLiveQuery(() => db.sleepLogs.orderBy('date').toArray(), [], [] as SleepLog[])
  const logs = all ?? []
  const todayLog = logs.find((l) => l.date === date)

  const hours = calcSleepHours(bedTime, wakeTime)
  const assessment = assessSleep(todayLog ? todayLog.hours : null)

  // 최근 7일
  const days = lastNDays(7)
  const recent = logs.filter((l) => days.includes(l.date))
  const avg = averageHours(recent)
  const counts = qualityCounts(recent)

  const chartData = days.map((d) => {
    const log = logs.find((l) => l.date === d)
    return { date: d, label: formatShort(d), hours: log?.hours ?? 0, quality: log?.quality }
  })

  const save = async () => {
    const h = calcSleepHours(bedTime, wakeTime)
    // 하루 한 건이므로 같은 날짜는 덮어쓴다 (date 유니크)
    const existing = logs.find((l) => l.date === date)
    const payload: SleepLog = {
      ...(existing?.id != null ? { id: existing.id } : {}),
      date,
      bedTime,
      wakeTime,
      hours: h,
      quality,
      memo: memo.trim() || undefined,
      createdAt: existing?.createdAt ?? Date.now(),
    }
    await db.sleepLogs.put(payload)
    setMemo('')
  }

  const remove = async (id?: number) => {
    if (id != null) await db.sleepLogs.delete(id)
  }

  const tone =
    assessment.tone === 'good'
      ? { box: 'bg-ocean-50', text: 'text-ocean-600' }
      : assessment.tone === 'warn'
        ? { box: 'bg-coral-50', text: 'text-coral-600' }
        : { box: 'bg-cream-200', text: 'text-brand-500' }

  return (
    <div>
      <PageHeader title="😴 수면 기록" subtitle="잘 자야 잘 빠져요" />

      {/* 날짜 이동 */}
      <div className="flex items-center justify-between px-5 pb-3">
        <button
          onClick={() => setDate((d) => shiftDay(d, -1))}
          className="rounded-lg px-3 py-1.5 text-brand-300 hover:bg-cream-200"
        >
          ‹ 이전
        </button>
        <div className="text-center">
          <div className="font-semibold text-brand-800">{formatKorean(date)}</div>
          {!isToday(date) && (
            <button onClick={() => setDate(todayKey())} className="text-xs text-coral-600">
              오늘로
            </button>
          )}
        </div>
        <button
          onClick={() => setDate((d) => shiftDay(d, 1))}
          disabled={isToday(date)}
          className="rounded-lg px-3 py-1.5 text-brand-300 hover:bg-cream-200 disabled:opacity-30"
        >
          다음 ›
        </button>
      </div>

      {/* 오늘의 수면 요약 */}
      <div className="mx-5 mb-4 overflow-hidden rounded-3xl bg-brand-800 px-5 py-4 text-white shadow-lift">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-brand-200">이 날 잔 시간</p>
            {todayLog ? (
              <>
                <p className="text-3xl font-bold tabular-nums">
                  {todayLog.hours}
                  <span className="ml-1 text-sm font-normal text-brand-200">시간</span>
                </p>
                <p className="mt-0.5 text-xs text-brand-200">
                  {todayLog.bedTime} → {todayLog.wakeTime} · {QUALITY_EMOJI[todayLog.quality]}{' '}
                  {todayLog.quality}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">아직 기록 없음</p>
                <p className="mt-0.5 text-xs text-brand-200">아래에서 입력해 주세요</p>
              </>
            )}
          </div>
          <Character name="sleeping" size={86} className="-my-3 shrink-0" />
        </div>
      </div>

      {/* 평가 */}
      <div className={`mx-5 mb-4 rounded-2xl p-4 ${tone.box}`}>
        <p className={`text-sm font-bold ${tone.text}`}>{assessment.label}</p>
        <p className={`mt-1 text-xs leading-relaxed ${tone.text}`}>{assessment.advice}</p>
      </div>

      {/* 입력 */}
      <div className="mx-5 mb-4 card p-5">
        <p className="mb-3 text-sm font-bold text-brand-800">
          🛏️ {todayLog ? '수면 기록 수정' : '수면 기록하기'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">취침 시각</label>
            <input
              type="time"
              className="input"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
            />
          </div>
          <div>
            <label className="label">기상 시각</label>
            <input
              type="time"
              className="input"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-cream-100 py-3 text-center">
          <span className="text-xs text-brand-400">수면 시간</span>
          <p className="text-2xl font-bold text-brand-800">
            {hours}
            <span className="text-sm font-normal text-brand-300"> 시간</span>
          </p>
        </div>

        <div className="mt-3">
          <label className="label">잠은 어땠나요?</label>
          <div className="flex gap-2">
            {SLEEP_QUALITIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`btn flex-1 ${
                  quality === q ? 'bg-brand-800 text-white' : 'bg-cream-200 text-brand-600'
                }`}
              >
                {QUALITY_EMOJI[q]} {q}
              </button>
            ))}
          </div>
        </div>

        <input
          className="input mt-3"
          placeholder="메모 (선택) — 예: 자다가 두 번 깼어요"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        <button onClick={save} className="btn-primary mt-3 w-full">
          {todayLog ? '수정 저장' : '기록 추가'}
        </button>
      </div>

      {/* 최근 7일 */}
      <div className="mx-5 mb-4 card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-brand-800">📈 최근 7일 수면</p>
          {avg !== null && (
            <span className="chip bg-cream-200 text-brand-500">평균 {avg}시간</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f7ece1" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#93a9da' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 12]}
              ticks={[0, 3, 6, 9, 12]}
              tick={{ fontSize: 11, fill: '#93a9da' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              formatter={(v: number) => [`${v}시간`, '수면']}
              contentStyle={{ borderRadius: 12, border: '1px solid #efe0d1', fontSize: 12 }}
            />
            <ReferenceLine y={IDEAL_MIN} stroke="#5b8fd4" strokeDasharray="5 4" />
            <ReferenceLine y={IDEAL_MAX} stroke="#5b8fd4" strokeDasharray="5 4" />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {chartData.map((d) => (
                <Cell
                  key={d.date}
                  fill={
                    d.hours === 0
                      ? '#f7ece1'
                      : d.hours >= IDEAL_MIN && d.hours <= IDEAL_MAX
                        ? '#5b8fd4'
                        : '#ffa152'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-center text-[11px] text-brand-300">
          점선은 권장 수면 {IDEAL_MIN}~{IDEAL_MAX}시간
        </p>

        {recent.length > 0 && (
          <div className="mt-3 flex justify-around border-t border-cream-200 pt-3">
            {SLEEP_QUALITIES.map((q) => (
              <div key={q} className="text-center">
                <p className="text-lg">{QUALITY_EMOJI[q]}</p>
                <p className="text-sm font-bold" style={{ color: QUALITY_COLOR[q] }}>
                  {counts[q]}일
                </p>
                <p className="text-[11px] text-brand-300">{q}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 기록 목록 */}
      {logs.length > 0 && (
        <div className="mx-5 mb-4 card divide-y divide-cream-200 p-1">
          {[...logs].reverse().slice(0, 14).map((l) => (
            <div key={l.id} className="flex items-center justify-between px-3 py-2.5">
              <div className="min-w-0">
                <span className="text-sm font-medium text-brand-700">{formatKorean(l.date)}</span>
                <span className="ml-2 text-xs text-brand-300">
                  {l.bedTime} → {l.wakeTime}
                </span>
                {l.memo && <p className="text-xs text-brand-300">{l.memo}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm">{QUALITY_EMOJI[l.quality]}</span>
                <span className="font-semibold tabular-nums text-brand-800">{l.hours}시간</span>
                <button
                  onClick={() => remove(l.id)}
                  className="text-cream-400 hover:text-coral-500"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="px-8 pb-4 text-center text-[11px] leading-relaxed text-brand-300">
        성인 권장 수면은 하루 {IDEAL_MIN}~{IDEAL_MAX}시간입니다. 수면이 부족하면 식욕 호르몬이
        흐트러져 체중 관리가 어려워질 수 있어요.
      </p>
    </div>
  )
}
