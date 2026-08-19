import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { db } from '../db/db'
import type { WeightLog } from '../types'
import { todayKey, formatShort, formatKorean } from '../lib/dates'
import { computeGoals } from '../lib/nutrition'
import { buildWeightPlan } from '../lib/weightLoss'
import { useProfile } from '../store/useProfile'
import PageHeader from '../components/PageHeader'
import Character from '../components/Character'
import WeightPlanCard from '../components/WeightPlanCard'
import GoalForm from '../components/GoalForm'

export default function Weight() {
  const profile = useProfile((s) => s.profile)!
  const saveProfile = useProfile((s) => s.save)
  const [date, setDate] = useState(todayKey())
  const [weight, setWeight] = useState<string>('')
  const [note, setNote] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)

  const weights = useLiveQuery(
    () => db.weights.orderBy('date').toArray(),
    [],
    [] as WeightLog[]
  )

  const sorted = weights ?? []
  const latest = sorted[sorted.length - 1]
  const first = sorted[0]
  const currentWeight = latest?.weightKg ?? profile.currentWeightKg
  const changed = latest && first ? latest.weightKg - first.weightKg : 0

  const save = async () => {
    const w = Number(weight)
    if (!w || w <= 0) return
    // 같은 날짜 기록은 덮어쓰기 (date 유니크)
    await db.weights.put({ date, weightKg: w, note: note.trim() || undefined })
    setWeight('')
    setNote('')
  }

  const remove = async (id?: number) => {
    if (id != null) await db.weights.delete(id)
  }

  const chartData = sorted.map((w) => ({
    date: w.date,
    label: formatShort(w.date),
    weight: w.weightKg,
  }))

  const weightsOnly = sorted.map((w) => w.weightKg)
  const domainMin = Math.min(profile.targetWeightKg, ...weightsOnly, currentWeight) - 1
  const domainMax = Math.max(profile.targetWeightKg, ...weightsOnly, currentWeight) + 1

  const { tdee } = computeGoals({
    gender: profile.gender,
    weightKg: currentWeight,
    heightCm: profile.heightCm,
    age: profile.age,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
  })
  const plan = buildWeightPlan(sorted, profile, tdee)

  if (editingGoal) {
    return (
      <div>
        <PageHeader title="🎯 감량 목표 설정" subtitle="목표 체중과 날짜를 정해보세요" />
        <div className="mx-5 card p-5">
          <GoalForm
            profile={profile}
            currentWeight={currentWeight}
            onSave={async (p) => {
              await saveProfile(p)
              setEditingGoal(false)
            }}
            onCancel={() => setEditingGoal(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="⚖️ 체중 관리" subtitle="꾸준히 기록하면 변화가 보여요" />

      {/* 요약 */}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-3">
        <SummaryCard label="현재" value={`${currentWeight}`} unit="kg" />
        <SummaryCard label="목표" value={`${profile.targetWeightKg}`} unit="kg" accent />
        <SummaryCard
          label="변화"
          value={`${changed > 0 ? '+' : ''}${changed.toFixed(1)}`}
          unit="kg"
          tone={changed < 0 ? 'good' : changed > 0 ? 'bad' : 'neutral'}
        />
      </div>

      {/* 감량 목표·진행 */}
      <div className="mx-5 mb-4">
        <WeightPlanCard
          plan={plan}
          targetDate={profile.targetDate}
          onEditGoal={() => setEditingGoal(true)}
        />
      </div>

      {/* 차트 */}
      <div className="mx-5 mb-4 card p-4">
        <p className="mb-3 text-sm font-semibold text-brand-700">체중 추이</p>
        {chartData.length >= 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f7ece1" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#93a9da' }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[Math.floor(domainMin), Math.ceil(domainMax)]}
                tick={{ fontSize: 11, fill: '#93a9da' }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(v: number) => [`${v} kg`, '체중']}
                labelFormatter={(l) => l}
                contentStyle={{ borderRadius: 12, border: '1px solid #efe0d1', fontSize: 12 }}
              />
              <ReferenceLine
                y={profile.targetWeightKg}
                stroke="#f5604a"
                strokeDasharray="5 4"
                label={{ value: '목표', position: 'right', fill: '#f5604a', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2e4382"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2e4382' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center py-9">
            <Character name="weighIn" size={110} />
            <p className="mt-2 text-sm font-semibold text-brand-700">아직 기록이 없어요</p>
            <p className="mt-1 text-xs text-brand-400">아래에서 오늘 체중을 입력해 보세요.</p>
          </div>
        )}
      </div>

      {/* 입력 */}
      <div className="mx-5 mb-4 card p-4">
        <p className="mb-3 text-sm font-semibold text-brand-700">체중 기록하기</p>
        <div className="flex gap-2">
          <input
            type="date"
            className="input flex-1"
            value={date}
            max={todayKey()}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="relative w-32">
            <input
              type="number"
              step={0.1}
              className="input pr-8"
              placeholder="체중"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-300">
              kg
            </span>
          </div>
        </div>
        <input
          className="input mt-2"
          placeholder="메모 (선택) — 예: 아침 공복"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={save} disabled={!weight} className="btn-primary mt-2 w-full">
          기록 추가
        </button>
      </div>

      {/* 기록 목록 */}
      {sorted.length > 0 && (
        <div className="mx-5 mb-4 card divide-y divide-cream-200 p-1">
          {[...sorted].reverse().map((w) => (
            <div key={w.id} className="flex items-center justify-between px-3 py-2.5">
              <div>
                <span className="text-sm font-medium text-brand-700">{formatKorean(w.date)}</span>
                {w.note && <span className="ml-2 text-xs text-brand-300">{w.note}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold tabular-nums text-brand-800">{w.weightKg} kg</span>
                <button onClick={() => remove(w.id)} className="text-cream-400 hover:text-coral-500">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  unit,
  accent,
  tone = 'neutral',
}: {
  label: string
  value: string
  unit: string
  accent?: boolean
  tone?: 'good' | 'bad' | 'neutral'
}) {
  const color =
    tone === 'good' ? 'text-brand-600' : tone === 'bad' ? 'text-coral-600' : 'text-brand-800'
  return (
    <div className={`card p-4 ${accent ? 'bg-brand-50 ring-brand-100' : ''}`}>
      <p className="text-xs text-brand-300">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? 'text-brand-700' : color}`}>
        {value}
        <span className="text-sm font-normal text-brand-300"> {unit}</span>
      </p>
    </div>
  )
}
