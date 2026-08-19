import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { ExerciseLog, MealLog, WeightLog } from '../types'
import { EXERCISES, EXERCISE_CATEGORIES, type Exercise } from '../data/exercises'
import {
  recommendExercises,
  burnedKcal,
  kcalPerMinute,
  sumBurned,
  MINUTE_PRESETS,
} from '../lib/exercise'
import { sumNutrition } from '../lib/nutrition'
import { todayKey } from '../lib/dates'
import { useProfile } from '../store/useProfile'
import Character from './Character'

// 오늘 섭취량 기준 운동 추천 + 운동 기록
export default function ExerciseTab() {
  const profile = useProfile((s) => s.profile)!
  const today = todayKey()
  const [picking, setPicking] = useState<Exercise | null>(null)

  const logs = useLiveQuery(
    () => db.logs.where('date').equals(today).toArray(),
    [today],
    [] as MealLog[]
  )
  const exLogs = useLiveQuery(
    () => db.exerciseLogs.where('date').equals(today).toArray(),
    [today],
    [] as ExerciseLog[]
  )
  const latestWeight = useLiveQuery(
    () => db.weights.orderBy('date').last(),
    [],
    undefined as WeightLog | undefined
  )

  const weightKg = latestWeight?.weightKg ?? profile.currentWeightKg
  const consumed = sumNutrition(logs ?? []).kcal
  const burned = sumBurned(exLogs ?? [])
  // 순 섭취 = 먹은 것 - 운동으로 태운 것
  const net = consumed - burned
  const over = net - profile.targetKcal

  // 초과했으면 초과분을, 아니면 가벼운 기본 목표(200kcal)를 태우도록 추천
  const targetBurn = over > 30 ? Math.round(over) : 200
  const isOver = over > 30

  const suggestions = useMemo(
    () => recommendExercises({ targetKcal: targetBurn, weightKg }),
    [targetBurn, weightKg]
  )

  const addLog = async (ex: Exercise, minutes: number) => {
    await db.exerciseLogs.add({
      date: today,
      exerciseId: ex.id,
      name: ex.name,
      emoji: ex.emoji,
      minutes,
      kcal: burnedKcal(ex.met, weightKg, minutes),
      createdAt: Date.now(),
    })
    setPicking(null)
  }

  const removeLog = async (id?: number) => {
    if (id != null) await db.exerciseLogs.delete(id)
  }

  return (
    <div className="px-5">
      {/* 오늘의 칼로리 수지 */}
      <div className="mb-4 card p-5">
        <div className="flex items-center gap-3">
          <Character name="stretch" size={68} className="-my-2 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-800">🔥 오늘의 칼로리 수지</p>
            <p className="mt-0.5 text-xs text-brand-400">
              {isOver
                ? `목표보다 ${Math.round(over)}kcal 많아요. 운동으로 채워볼까요?`
                : '목표 안에 있어요. 가볍게 움직이면 더 좋아요!'}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Cell label="섭취" value={consumed} tone="text-brand-800" />
          <Cell label="소모" value={burned} tone="text-ocean-600" prefix="-" />
          <Cell
            label="순 섭취"
            value={net}
            tone={isOver ? 'text-coral-600' : 'text-brand-800'}
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-brand-300">
          하루 목표 {profile.targetKcal} kcal · 체중 {weightKg}kg 기준
        </p>
      </div>

      {/* 운동 추천 */}
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-bold text-brand-800">
          🏃 {targetBurn}kcal 태우려면
        </p>
        <span className="text-xs text-brand-300">탭하면 기록돼요</span>
      </div>

      {suggestions.length === 0 ? (
        <div className="card p-6 text-center text-sm text-brand-400">
          추천할 운동을 찾지 못했어요.
        </div>
      ) : (
        <div className="space-y-2.5">
          {suggestions.map((s) => (
            <button
              key={s.exercise.id}
              onClick={() => setPicking(s.exercise)}
              className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-lift"
            >
              <span className="text-2xl">{s.exercise.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-800">{s.exercise.name}</p>
                <p className="text-xs text-brand-400">{s.exercise.desc}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-ocean-600">
                  {s.minutes}
                  <span className="text-xs font-normal text-brand-300">분</span>
                </p>
                <p className="text-[11px] text-brand-300">
                  분당 {s.perMinute.toFixed(1)}kcal
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 오늘 운동 기록 */}
      <div className="mb-2 mt-6 flex items-baseline justify-between">
        <p className="text-sm font-bold text-brand-800">💪 오늘 한 운동</p>
        <button
          onClick={() => setPicking(EXERCISES[1])}
          className="text-xs font-semibold text-coral-600"
        >
          + 직접 추가
        </button>
      </div>

      {(exLogs ?? []).length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-brand-400">아직 운동 기록이 없어요</p>
          <p className="mt-1 text-xs text-brand-300">
            위에서 운동을 골라 탭해 보세요.
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-cream-200 p-1">
          {(exLogs ?? []).map((l) => (
            <div key={l.id} className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{l.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-brand-700">{l.name}</p>
                  <p className="text-xs text-brand-300">{l.minutes}분</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold tabular-nums text-ocean-600">
                  -{l.kcal}
                  <span className="text-xs font-normal text-brand-300"> kcal</span>
                </span>
                <button
                  onClick={() => removeLog(l.id)}
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

      {picking && (
        <ExercisePicker
          initial={picking}
          weightKg={weightKg}
          onAdd={addLog}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  )
}

function Cell({
  label,
  value,
  tone,
  prefix = '',
}: {
  label: string
  value: number
  tone: string
  prefix?: string
}) {
  return (
    <div className="rounded-2xl bg-cream-100 py-3">
      <p className="text-[11px] text-brand-400">{label}</p>
      <p className={`mt-0.5 text-lg font-bold tabular-nums ${tone}`}>
        {value > 0 ? prefix : ''}
        {value}
      </p>
    </div>
  )
}

// 운동 선택 + 시간 입력 시트
function ExercisePicker({
  initial,
  weightKg,
  onAdd,
  onClose,
}: {
  initial: Exercise
  weightKg: number
  onAdd: (ex: Exercise, minutes: number) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Exercise>(initial)
  const [minutes, setMinutes] = useState(30)
  const [category, setCategory] = useState<string>('전체')

  const list = EXERCISES.filter((e) =>
    category === '전체' ? true : e.category === category
  )
  const kcal = burnedKcal(selected.met, weightKg, minutes)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="flex h-[86vh] w-full max-w-lg flex-col rounded-t-3xl bg-white sm:h-[78vh] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <h3 className="text-base font-bold text-brand-800">🏃 운동 기록</h3>
          <button onClick={onClose} className="text-sm text-brand-300 hover:text-brand-600">
            닫기
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto px-5 py-3">
          {['전체', ...EXERCISE_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`chip whitespace-nowrap ${
                category === c
                  ? 'bg-brand-800 text-white'
                  : 'bg-cream-200 text-brand-400 hover:bg-cream-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <ul className="divide-y divide-cream-200">
            {list.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setSelected(e)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition ${
                    selected.id === e.id ? 'bg-ocean-50' : 'hover:bg-cream-100'
                  }`}
                >
                  <span className="text-xl">{e.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-800">{e.name}</p>
                    <p className="text-xs text-brand-300">{e.desc}</p>
                  </div>
                  <span className="shrink-0 text-xs text-brand-400">
                    분당 {kcalPerMinute(e.met, weightKg).toFixed(1)}kcal
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 시간 선택 */}
        <div className="border-t border-cream-200 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-brand-800">
                {selected.emoji} {selected.name}
              </p>
              <p className="text-xs text-brand-400">
                {minutes}분 · <span className="font-bold text-ocean-600">{kcal} kcal</span> 소모
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinutes((m) => Math.max(5, m - 5))}
                className="h-9 w-9 rounded-full bg-cream-200 text-lg font-bold text-brand-600"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 rounded-lg border border-cream-300 py-1.5 text-center text-sm"
              />
              <button
                onClick={() => setMinutes((m) => m + 5)}
                className="h-9 w-9 rounded-full bg-cream-200 text-lg font-bold text-brand-600"
              >
                +
              </button>
            </div>
          </div>
          <div className="mb-3 flex gap-1.5">
            {MINUTE_PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className={`chip flex-1 justify-center ${
                  minutes === m ? 'bg-ocean-500 text-white' : 'bg-cream-200 text-brand-500'
                }`}
              >
                {m}분
              </button>
            ))}
          </div>
          <button onClick={() => onAdd(selected, minutes)} className="btn-primary w-full">
            기록 추가
          </button>
        </div>
      </div>
    </div>
  )
}
