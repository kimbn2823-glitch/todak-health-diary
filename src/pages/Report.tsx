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
import type { MealLog } from '../types'
import { lastNDays, formatShort } from '../lib/dates'
import { sumNutrition } from '../lib/nutrition'
import { useProfile } from '../store/useProfile'
import PageHeader from '../components/PageHeader'
import { ArtSalad, ArtChart } from '../components/HealthArt'
import Character from '../components/Character'
import WeeklyHealth from '../components/WeeklyHealth'

export default function Report() {
  const profile = useProfile((s) => s.profile)!
  const [range, setRange] = useState<7 | 30>(7)
  const days = lastNDays(range)

  const logs = useLiveQuery(
    () => db.logs.where('date').anyOf(days).toArray(),
    [days.join()],
    [] as MealLog[]
  )

  const all = logs ?? []
  const loggedDays = new Set(all.map((l) => l.date))

  // 일별 집계
  const byDay = days.map((d) => {
    const dayLogs = all.filter((l) => l.date === d)
    const n = sumNutrition(dayLogs)
    return { date: d, label: formatShort(d), ...n, hasLog: dayLogs.length > 0 }
  })

  // 기록된 날만 대상으로 평균
  const activeDays = byDay.filter((b) => b.hasLog)
  const avgKcal = activeDays.length
    ? Math.round(activeDays.reduce((s, b) => s + b.kcal, 0) / activeDays.length)
    : 0
  const avgProtein = activeDays.length
    ? Math.round(activeDays.reduce((s, b) => s + b.protein, 0) / activeDays.length)
    : 0
  const avgCarbs = activeDays.length
    ? Math.round(activeDays.reduce((s, b) => s + b.carbs, 0) / activeDays.length)
    : 0
  const avgFat = activeDays.length
    ? Math.round(activeDays.reduce((s, b) => s + b.fat, 0) / activeDays.length)
    : 0

  // 목표 달성률: 목표 ±10% 이내인 날 비율
  const onTargetDays = activeDays.filter(
    (b) => Math.abs(b.kcal - profile.targetKcal) <= profile.targetKcal * 0.1
  ).length
  const achievement = activeDays.length
    ? Math.round((onTargetDays / activeDays.length) * 100)
    : 0

  const insights = buildInsights({
    avgKcal,
    targetKcal: profile.targetKcal,
    avgProtein,
    targetProtein: profile.targetMacros.protein,
    loggedDaysCount: loggedDays.size,
    totalDays: range,
  })

  const maxKcal = Math.max(profile.targetKcal * 1.2, ...byDay.map((b) => b.kcal), 1)

  return (
    <div>
      <PageHeader title="📊 리포트·분석" subtitle="나의 식습관을 한눈에" />

      {/* 기간 선택 */}
      <div className="mx-5 mb-4 flex rounded-xl bg-cream-200 p-1">
        {([7, 30] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              range === r ? 'bg-white text-brand-600 shadow-sm' : 'text-brand-400'
            }`}
          >
            최근 {r}일
          </button>
        ))}
      </div>

      {/* 캐릭터 요약 */}
      <div className="mx-5 mb-4 card flex items-center gap-3 p-4">
        <Character name="writeLog" size={70} className="-my-2 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand-800">📊 이번 기간 요약</p>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-400">꾸준히 기록할수록 분석이 정확해져요.</p>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-3">
        <Stat label="평균 섭취" value={avgKcal} unit="kcal" />
        <Stat label="목표 달성률" value={achievement} unit="%" accent />
        <Stat label="기록한 날" value={loggedDays.size} unit={`/${range}일`} />
      </div>

      <WeeklyHealth />

      {/* 일별 칼로리 바차트 */}
      <div className="mx-5 mb-4 card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArtChart size={26} />
            <p className="text-sm font-semibold text-brand-700">일별 섭취 칼로리</p>
          </div>
          <span className="text-xs text-brand-300">목표 {profile.targetKcal}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byDay} margin={{ top: 5, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f7ece1" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#93a9da' }}
              tickLine={false}
              axisLine={false}
              interval={range === 30 ? 4 : 0}
            />
            <YAxis
              domain={[0, Math.ceil(maxKcal / 100) * 100]}
              tick={{ fontSize: 11, fill: '#93a9da' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              formatter={(v: number) => [`${v} kcal`, '섭취']}
              contentStyle={{ borderRadius: 12, border: '1px solid #efe0d1', fontSize: 12 }}
            />
            <ReferenceLine y={profile.targetKcal} stroke="#3d57a0" strokeDasharray="5 4" />
            <Bar dataKey="kcal" radius={[4, 4, 0, 0]}>
              {byDay.map((b) => (
                <Cell
                  key={b.date}
                  fill={
                    b.kcal === 0
                      ? '#f7ece1'
                      : b.kcal > profile.targetKcal * 1.1
                        ? '#f5604a'
                        : '#3d57a0'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 영양 균형 (평균) */}
      <div className="mx-5 mb-4 card p-4">
        <div className="mb-3 flex items-center gap-2">
          <ArtSalad size={26} />
          <p className="text-sm font-semibold text-brand-700">평균 영양 균형</p>
        </div>
        <MacroBalance carbs={avgCarbs} protein={avgProtein} fat={avgFat} />
      </div>

      {/* 인사이트 */}
      <div className="mx-5 mb-4 space-y-2">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 rounded-2xl p-4 text-sm ${ins.tone === 'good' ? 'bg-brand-50 text-brand-700' : ins.tone === 'warn' ? 'bg-mango-100 text-mango-600' : 'bg-cream-200 text-brand-600'}`}
          >
            <span className="text-base leading-none">{ins.emoji}</span>
            <span>{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MacroBalance({ carbs, protein, fat }: { carbs: number; protein: number; fat: number }) {
  // 칼로리 환산 비율
  const cK = carbs * 4
  const pK = protein * 4
  const fK = fat * 9
  const total = cK + pK + fK || 1
  const seg = [
    { label: '탄수화물', pct: (cK / total) * 100, color: '#ffa152', g: carbs },
    { label: '단백질', pct: (pK / total) * 100, color: '#5b8fd4', g: protein },
    { label: '지방', pct: (fK / total) * 100, color: '#ff7d63', g: fat },
  ]
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {seg.map((s) => (
          <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
        ))}
      </div>
      <div className="mt-3 flex justify-between">
        {seg.map((s) => (
          <div key={s.label} className="text-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-brand-400">{s.label}</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-brand-700">{Math.round(s.pct)}%</p>
            <p className="text-[11px] text-brand-300">{s.g}g</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string
  value: number
  unit: string
  accent?: boolean
}) {
  return (
    <div className={`card p-4 ${accent ? 'bg-brand-50 ring-brand-100' : ''}`}>
      <p className="text-xs text-brand-300">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? 'text-brand-700' : 'text-brand-800'}`}>
        {value}
        <span className="text-xs font-normal text-brand-300"> {unit}</span>
      </p>
    </div>
  )
}

interface Insight {
  emoji: string
  text: string
  tone: 'good' | 'warn' | 'neutral'
}

function buildInsights(p: {
  avgKcal: number
  targetKcal: number
  avgProtein: number
  targetProtein: number
  loggedDaysCount: number
  totalDays: number
}): Insight[] {
  const out: Insight[] = []

  if (p.loggedDaysCount === 0) {
    return [
      {
        emoji: '📝',
        text: '아직 기록이 없어요. 식단을 기록하면 맞춤 분석을 볼 수 있어요.',
        tone: 'neutral',
      },
    ]
  }

  // 칼로리 분석
  if (p.avgKcal > p.targetKcal * 1.1) {
    out.push({
      emoji: '⚠️',
      text: `평균 섭취(${p.avgKcal}kcal)가 목표보다 높아요. 간식·야식을 줄여보는 건 어떨까요?`,
      tone: 'warn',
    })
  } else if (p.avgKcal < p.targetKcal * 0.8 && p.avgKcal > 0) {
    out.push({
      emoji: '💡',
      text: `평균 섭취가 목표보다 다소 낮아요. 너무 적게 먹으면 근손실이 올 수 있어요.`,
      tone: 'warn',
    })
  } else {
    out.push({
      emoji: '👍',
      text: '평균 섭취 칼로리가 목표 범위 안에 잘 들어와 있어요!',
      tone: 'good',
    })
  }

  // 단백질 분석
  if (p.avgProtein < p.targetProtein * 0.8) {
    out.push({
      emoji: '🥚',
      text: `단백질 섭취(${p.avgProtein}g)가 목표(${p.targetProtein}g)보다 부족해요. 닭가슴살·두부·계란을 추가해 보세요.`,
      tone: 'warn',
    })
  } else {
    out.push({
      emoji: '💪',
      text: '단백질을 목표만큼 잘 챙기고 있어요.',
      tone: 'good',
    })
  }

  // 기록 습관
  const rate = p.loggedDaysCount / p.totalDays
  if (rate >= 0.8) {
    out.push({ emoji: '🔥', text: '기록 습관이 아주 좋아요. 꾸준함이 성공의 비결이에요!', tone: 'good' })
  } else {
    out.push({
      emoji: '📅',
      text: `최근 ${p.totalDays}일 중 ${p.loggedDaysCount}일 기록했어요. 매일 기록하면 더 정확해져요.`,
      tone: 'neutral',
    })
  }

  return out
}
