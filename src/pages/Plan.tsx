import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import {
  MEAL_TYPES,
  type Food,
  type MealLog,
  type MealType,
  type PlanEntry,
} from '../types'
import { todayKey, weekKeys, weekdayShort, isToday, formatShort, shiftDay } from '../lib/dates'
import { sumNutrition } from '../lib/nutrition'
import { recommendMeals } from '../lib/recommend'
import { useProfile } from '../store/useProfile'
import FoodSearch from '../components/FoodSearch'
import PageHeader from '../components/PageHeader'
import { ArtSalad } from '../components/HealthArt'
import WorkoutScene from '../components/WorkoutScene'
import Character from '../components/Character'
import ExerciseTab from '../components/ExerciseTab'
import { MEAL_EMOJI } from '../lib/emoji'

type Tab = '식단 추천' | '운동 추천' | '식단표'

const TABS: { key: Tab; emoji: string }[] = [
  { key: '식단 추천', emoji: '🥗' },
  { key: '운동 추천', emoji: '🏃' },
  { key: '식단표', emoji: '📅' },
]

export default function Plan() {
  const [tab, setTab] = useState<Tab>('식단 추천')
  return (
    <div>
      <PageHeader title="✨ 추천·계획" subtitle="목표에 맞는 식단과 운동을 제안해요" />
      <div className="mx-5 mb-4 flex rounded-xl bg-cream-200 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              tab === t.key ? 'bg-white text-brand-600 shadow-sm' : 'text-brand-400'
            }`}
          >
            {t.emoji} {t.key}
          </button>
        ))}
      </div>
      {tab === '식단 추천' ? (
        <RecommendTab />
      ) : tab === '운동 추천' ? (
        <ExerciseTab />
      ) : (
        <WeeklyPlanTab />
      )}
    </div>
  )
}

// --- 추천 탭 ---
function RecommendTab() {
  const profile = useProfile((s) => s.profile)!
  const today = todayKey()
  const [nonce, setNonce] = useState(0) // 다시 추천용

  const logs = useLiveQuery(
    () => db.logs.where('date').equals(today).toArray(),
    [today],
    [] as MealLog[]
  )
  const foods = useLiveQuery(() => db.foods.toArray(), [], [] as Food[])

  const consumed = sumNutrition(logs ?? [])
  const remainingKcal = Math.max(0, profile.targetKcal - consumed.kcal)

  const recs = useMemo(() => {
    if (!foods || foods.length === 0) return []
    // nonce에 따라 후보를 살짝 회전시켜 "다시 추천" 다양성 확보
    const rotated =
      nonce > 0
        ? [...foods.slice(nonce % foods.length), ...foods.slice(0, nonce % foods.length)]
        : foods
    return recommendMeals({
      foods: rotated,
      remainingKcal,
      targetMacros: profile.targetMacros,
      consumedMacros: consumed,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foods, remainingKcal, nonce])

  const addToLog = async (food: Food, servings: number) => {
    const now = new Date().getHours()
    const meal: MealType = now < 10 ? '아침' : now < 15 ? '점심' : now < 21 ? '저녁' : '간식'
    await db.logs.add({
      date: today,
      mealType: meal,
      foodId: food.id,
      foodName: food.name,
      servings,
      kcal: Math.round(food.kcal * servings),
      carbs: Math.round(food.carbs * servings),
      protein: Math.round(food.protein * servings),
      fat: Math.round(food.fat * servings),
      sodium: food.sodium ? Math.round(food.sodium * servings) : undefined,
      createdAt: Date.now(),
    })
  }

  return (
    <div className="px-5">
      <div className="mb-4 card flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs text-brand-300">오늘 남은 목표 칼로리</p>
          <p className="mt-1 text-2xl font-bold text-brand-600">
            {remainingKcal}
            <span className="text-sm font-normal text-brand-300"> / {profile.targetKcal} kcal</span>
          </p>
          <p className="mt-1 text-xs text-brand-300">
            단백질 {Math.round(consumed.protein)} / {profile.targetMacros.protein}g 섭취
          </p>
        </div>
        <Character name="healthyMeal" size={76} className="-my-3 shrink-0" />
      </div>

      {remainingKcal < 80 ? (
        <div className="card overflow-hidden">
          <div className="flex flex-col items-center px-8 pb-5 pt-8 text-center">
            <Character name="celebrate" size={116} />
            <p className="mt-3 font-bold text-brand-800">오늘 목표를 거의 채웠어요!</p>
            <p className="mt-1 text-sm text-brand-400">
              무리한 추가 섭취보다는 가벼운 운동 어떠세요?
            </p>
          </div>
          <div className="flex justify-center bg-cream-200 pt-3">
            <WorkoutScene width={230} />
          </div>
        </div>
      ) : recs.length === 0 ? (
        <div className="card p-8 text-center text-sm text-brand-300">추천할 음식을 찾고 있어요…</div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArtSalad size={26} />
              <p className="text-sm font-semibold text-brand-700">추천 음식</p>
            </div>
            <button
              onClick={() => setNonce((n) => n + 7)}
              className="text-xs font-medium text-brand-600"
            >
              ↻ 다시 추천
            </button>
          </div>
          <div className="space-y-2.5">
            {recs.map((r) => (
              <div key={r.food.id} className="card flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-brand-800">{r.food.name}</span>
                    <span className="text-xs text-brand-300">×{r.servings}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-brand-600">{r.reason}</p>
                  <p className="text-xs text-brand-300">
                    {r.kcal} kcal · 단백질 {Math.round(r.food.protein * r.servings)}g
                  </p>
                </div>
                <button
                  onClick={() => addToLog(r.food, r.servings)}
                  className="ml-3 shrink-0 rounded-lg bg-coral-50 px-3 py-2 text-sm font-semibold text-coral-600 hover:bg-coral-100"
                >
                  기록 추가
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// --- 주간 식단표 탭 ---
function WeeklyPlanTab() {
  const [anchor, setAnchor] = useState(todayKey())
  const days = weekKeys(anchor)
  const [selectedDay, setSelectedDay] = useState(todayKey())
  const [picking, setPicking] = useState<MealType | null>(null)

  const plans = useLiveQuery(
    () => db.plans.where('date').anyOf(days).toArray(),
    [days.join()],
    [] as PlanEntry[]
  )

  const dayPlans = (plans ?? []).filter((p) => p.date === selectedDay)

  const addPlan = async (meal: MealType, food: Food, servings: number) => {
    await db.plans.add({
      date: selectedDay,
      mealType: meal,
      foodId: food.id,
      foodName: food.name,
      servings,
      kcal: Math.round(food.kcal * servings),
      carbs: Math.round(food.carbs * servings),
      protein: Math.round(food.protein * servings),
      fat: Math.round(food.fat * servings),
    })
    setPicking(null)
  }

  const removePlan = async (id?: number) => {
    if (id != null) await db.plans.delete(id)
  }

  // 계획을 실제 식단 기록으로 옮기기
  const applyToLog = async () => {
    if (dayPlans.length === 0) return
    const logs: MealLog[] = dayPlans.map((p) => ({
      date: p.date,
      mealType: p.mealType,
      foodId: p.foodId,
      foodName: p.foodName,
      servings: p.servings,
      kcal: p.kcal,
      carbs: p.carbs,
      protein: p.protein,
      fat: p.fat,
      createdAt: Date.now(),
    }))
    await db.logs.bulkAdd(logs)
    alert(`${selectedDay}의 계획 ${logs.length}건을 식단 기록에 추가했어요.`)
  }

  const dayKcal = (d: string) =>
    (plans ?? []).filter((p) => p.date === d).reduce((s, p) => s + p.kcal, 0)

  return (
    <div className="px-5">
      {/* 주 선택 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setAnchor((a) => shiftWeek(a, -1))}
          className="rounded-lg px-2 py-1 text-sm text-brand-300 hover:bg-cream-200"
        >
          ‹ 지난주
        </button>
        <span className="text-sm font-semibold text-brand-700">
          {formatShort(days[0])} ~ {formatShort(days[6])}
        </span>
        <button
          onClick={() => setAnchor((a) => shiftWeek(a, 1))}
          className="rounded-lg px-2 py-1 text-sm text-brand-300 hover:bg-cream-200"
        >
          다음주 ›
        </button>
      </div>

      {/* 요일 선택 */}
      <div className="mb-4 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const active = d === selectedDay
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex flex-col items-center rounded-xl py-2 transition ${
                active ? 'bg-brand-800 text-white' : 'bg-cream-200 text-brand-400'
              }`}
            >
              <span className="text-[10px]">{weekdayShort(d)}</span>
              <span className="text-sm font-bold">{d.slice(8)}</span>
              <span className={`text-[9px] ${active ? 'text-brand-100' : 'text-brand-300'}`}>
                {dayKcal(d) > 0 ? dayKcal(d) : '·'}
              </span>
            </button>
          )
        })}
      </div>

      {/* 선택한 날짜의 끼니별 계획 */}
      <div className="space-y-3">
        {MEAL_TYPES.map((meal) => {
          const items = dayPlans.filter((p) => p.mealType === meal)
          return (
            <div key={meal} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="font-semibold text-brand-800">{MEAL_EMOJI[meal]} {meal}</span>
                <button
                  onClick={() => setPicking(meal)}
                  className="text-sm font-semibold text-coral-600"
                >
                  + 추가
                </button>
              </div>
              {items.length > 0 && (
                <ul className="divide-y divide-cream-200 border-t border-cream-200">
                  {items.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-brand-700">
                        {p.foodName} <span className="text-xs text-brand-300">×{p.servings}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-brand-400">{p.kcal} kcal</span>
                        <button
                          onClick={() => removePlan(p.id)}
                          className="text-cream-400 hover:text-coral-500"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {dayPlans.length > 0 && (
        <button onClick={applyToLog} className="btn-primary mt-4 w-full">
          이 날 계획을 식단 기록으로 추가 {isToday(selectedDay) ? '(오늘)' : ''}
        </button>
      )}

      {picking && (
        <FoodSearch
          onClose={() => setPicking(null)}
          onPick={(food, servings) => addPlan(picking, food, servings)}
        />
      )}
    </div>
  )
}

// 주 단위 이동 (7일)
function shiftWeek(anchor: string, weeks: number): string {
  return shiftDay(anchor, weeks * 7)
}
