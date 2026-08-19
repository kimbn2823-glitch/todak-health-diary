import { EXERCISES, type Exercise } from '../data/exercises'
import type { ExerciseLog } from '../types'

/**
 * MET 공식으로 분당 소모 칼로리를 구한다.
 *   kcal/분 = MET × 3.5 × 체중(kg) / 200
 * 산소 소비량(3.5 ml/kg/min) 기준의 표준 근사식이다.
 */
export function kcalPerMinute(met: number, weightKg: number): number {
  return (met * 3.5 * weightKg) / 200
}

/** 특정 운동을 minutes분 했을 때의 소모 칼로리 */
export function burnedKcal(met: number, weightKg: number, minutes: number): number {
  return Math.round(kcalPerMinute(met, weightKg) * minutes)
}

/** 목표 칼로리를 태우는 데 필요한 시간(분) */
export function minutesToBurn(met: number, weightKg: number, kcal: number): number {
  const perMin = kcalPerMinute(met, weightKg)
  if (perMin <= 0) return 0
  return Math.round(kcal / perMin)
}

export interface ExerciseSuggestion {
  exercise: Exercise
  minutes: number
  kcal: number
  perMinute: number
}

/**
 * 태워야 할 칼로리에 맞춰 운동을 추천한다.
 * 너무 오래(120분 초과) 걸리거나 너무 짧은(3분 미만) 운동은 제외해
 * 현실적으로 실천 가능한 것만 남긴다.
 */
export function recommendExercises(params: {
  targetKcal: number
  weightKg: number
  onlyEasy?: boolean
  limit?: number
}): ExerciseSuggestion[] {
  const { targetKcal, weightKg, onlyEasy = false, limit = 6 } = params
  if (targetKcal <= 0) return []

  return EXERCISES.filter((e) => (onlyEasy ? e.easy : true))
    .map((e) => {
      const minutes = minutesToBurn(e.met, weightKg, targetKcal)
      return {
        exercise: e,
        minutes,
        kcal: targetKcal,
        perMinute: kcalPerMinute(e.met, weightKg),
      }
    })
    .filter((s) => s.minutes >= 3 && s.minutes <= 120)
    // 짧은 시간에 끝나는 순 → 부담이 적은 선택지를 먼저 보여준다
    .sort((a, b) => a.minutes - b.minutes)
    .slice(0, limit)
}

/** 하루 총 소모 칼로리 */
export function sumBurned(logs: ExerciseLog[]): number {
  return logs.reduce((s, l) => s + l.kcal, 0)
}

export function findExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}

/** 자주 쓰는 운동 시간 프리셋 */
export const MINUTE_PRESETS = [10, 20, 30, 45, 60]
