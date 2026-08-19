import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { MEAL_TYPES, type Food, type MealLog, type MealType } from '../types'
import { todayKey, shiftDay, formatKorean, isToday } from '../lib/dates'
import { sumNutrition } from '../lib/nutrition'
import { useProfile } from '../store/useProfile'
import FoodSearch from '../components/FoodSearch'
import PageHeader from '../components/PageHeader'
import { Heartbeat } from '../components/Decor'
import { MEAL_EMOJI } from '../lib/emoji'
import Character from '../components/Character'
import MealPhoto from '../components/MealPhoto'
import {
  ArtSunrise,
  ArtSun,
  ArtNightMeal,
  ArtSnack,
} from '../components/HealthArt'

const MEAL_ART: Record<MealType, (p: { size?: number }) => JSX.Element> = {
  아침: ArtSunrise,
  점심: ArtSun,
  저녁: ArtNightMeal,
  간식: ArtSnack,
}

export default function Diary() {
  const [date, setDate] = useState(todayKey())
  const [picking, setPicking] = useState<MealType | null>(null)
  const profile = useProfile((s) => s.profile)

  const logs = useLiveQuery(
    () => db.logs.where('date').equals(date).toArray(),
    [date],
    [] as MealLog[]
  )

  const total = sumNutrition(logs ?? [])
  const targetKcal = profile?.targetKcal ?? 2000

  const addLog = async (meal: MealType, food: Food, servings: number) => {
    const log: MealLog = {
      date,
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
    }
    await db.logs.add(log)
    setPicking(null)
  }

  const removeLog = async (id?: number) => {
    if (id != null) await db.logs.delete(id)
  }

  return (
    <div>
      <PageHeader title="🍽️ 식단 기록" subtitle="먹은 음식을 끼니별로 기록하세요" />

      {/* 날짜 네비게이션 */}
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
            <button onClick={() => setDate(todayKey())} className="text-xs text-brand-500">
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

      {/* 일일 합계 요약 */}
      <div className="relative mx-5 mb-4 flex items-center justify-between overflow-hidden rounded-3xl bg-brand-800 px-5 py-4 text-white shadow-lift">
        <Heartbeat
          className="pointer-events-none absolute inset-x-0 bottom-1 h-8 w-full"
          color="#ff9c88"
          opacity={0.3}
        />
        <div className="relative">
          <p className="text-xs text-brand-200">총 섭취</p>
          <p className="text-2xl font-bold tabular-nums">
            {total.kcal}
            <span className="ml-1 text-sm font-normal text-brand-200">/ {targetKcal} kcal</span>
          </p>
        </div>
        <div className="relative flex items-end gap-2">
          <div className="text-right text-xs text-brand-200">
            <p>탄 {total.carbs}g</p>
            <p>단 {total.protein}g</p>
            <p>지 {total.fat}g</p>
          </div>
          <Character name="healthyMeal" size={64} className="-mb-4 shrink-0" />
        </div>
      </div>

      {/* 끼니별 카드 */}
      <div className="space-y-3 px-5">
        {MEAL_TYPES.map((meal) => {
          const items = (logs ?? []).filter((l) => l.mealType === meal)
          const mealKcal = items.reduce((s, l) => s + l.kcal, 0)
          const MealArt = MEAL_ART[meal]
          return (
            <div key={meal} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <MealArt size={30} />
                  <span className="font-semibold text-brand-800">{MEAL_EMOJI[meal]} {meal}</span>
                  {mealKcal > 0 && (
                    <span className="text-xs text-brand-300">{mealKcal} kcal</span>
                  )}
                </div>
                <button
                  onClick={() => setPicking(meal)}
                  className="rounded-lg bg-coral-50 px-3 py-1.5 text-sm font-semibold text-coral-600 hover:bg-coral-100"
                >
                  + 추가
                </button>
              </div>
              {items.length > 0 && (
                <ul className="divide-y divide-cream-200 border-t border-cream-200">
                  {items.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-4 py-2.5">
                      <MealPhoto log={l} />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-brand-700">{l.foodName}</span>
                        <span className="ml-1.5 text-xs text-brand-300">×{l.servings}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm tabular-nums text-brand-400">{l.kcal} kcal</span>
                        <button
                          onClick={() => removeLog(l.id)}
                          className="text-cream-400 hover:text-coral-500"
                          aria-label="삭제"
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

      {(logs ?? []).length === 0 && (
        <div className="mx-5 mt-4 flex flex-col items-center rounded-3xl bg-ocean-50 px-6 py-7 text-center">
          <Character name="writeLog" size={104} />
          <p className="mt-2 text-sm font-semibold text-brand-700">
            아직 오늘 기록이 없어요
          </p>
          <p className="mt-1 text-xs text-brand-400">
            끼니별 <span className="font-semibold text-coral-600">+ 추가</span>를 눌러 먹은 음식을
            남겨보세요.
          </p>
        </div>
      )}

      {picking && (
        <FoodSearch
          onClose={() => setPicking(null)}
          onPick={(food, servings) => addLog(picking, food, servings)}
        />
      )}
    </div>
  )
}
