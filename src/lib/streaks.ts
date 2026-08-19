import type {
  MealLog,
  ExerciseLog,
  SleepLog,
  BpLog,
  WaterLog,
  MedLog,
  WeightLog,
  Profile,
} from '../types'
import { todayKey, shiftDay } from './dates'

/**
 * 연속 기록(스트릭) 일수.
 * 오늘 기록이 있으면 오늘부터, 없으면 어제부터 거슬러 센다
 * (하루가 끝나기 전엔 스트릭이 깨진 것으로 보지 않기 위함).
 */
export function calcStreak(loggedDates: Set<string>): number {
  const today = todayKey()
  let cursor = loggedDates.has(today) ? today : shiftDay(today, -1)
  let streak = 0
  while (loggedDates.has(cursor)) {
    streak++
    cursor = shiftDay(cursor, -1)
  }
  return streak
}

export interface Badge {
  id: string
  emoji: string
  label: string
  desc: string
  earned: boolean
}

export interface BadgeInput {
  logs: MealLog[]
  exerciseLogs: ExerciseLog[]
  sleepLogs: SleepLog[]
  bpLogs: BpLog[]
  waterLogs: WaterLog[]
  medLogs: MedLog[]
  weights: WeightLog[]
  profile: Profile | null
}

/** 쌓인 기록에서 뱃지를 계산한다 (별도 저장 없이 항상 파생). */
export function calcBadges(d: BadgeInput): Badge[] {
  const mealDates = new Set(d.logs.map((l) => l.date))
  const streak = calcStreak(mealDates)
  const goodSleep = d.sleepLogs.filter((s) => s.hours >= 7 && s.hours <= 9).length
  const sortedWeights = [...d.weights].sort((a, b) => a.date.localeCompare(b.date))
  const latestWeight = sortedWeights[sortedWeights.length - 1]
  const goalReached =
    d.profile != null &&
    latestWeight != null &&
    d.profile.goalType === '감량' &&
    latestWeight.weightKg <= d.profile.targetWeightKg + 0.05

  return [
    { id: 'first-meal', emoji: '🍚', label: '첫 술', desc: '첫 식단을 기록했어요', earned: d.logs.length > 0 },
    { id: 'streak3', emoji: '🔥', label: '작심삼일 극복', desc: '3일 연속 기록', earned: streak >= 3 },
    { id: 'streak7', emoji: '💪', label: '일주일 개근', desc: '7일 연속 기록', earned: streak >= 7 },
    { id: 'streak30', emoji: '🏆', label: '한 달의 기적', desc: '30일 연속 기록', earned: streak >= 30 },
    { id: 'water8', emoji: '💧', label: '수분 충전 완료', desc: '하루 물 8잔 달성', earned: d.waterLogs.some((w) => w.cups >= 8) },
    { id: 'first-ex', emoji: '👟', label: '첫 운동', desc: '첫 운동을 기록했어요', earned: d.exerciseLogs.length > 0 },
    { id: 'ex10', emoji: '🏃', label: '꾸준한 몸', desc: '운동 10회 기록', earned: d.exerciseLogs.length >= 10 },
    { id: 'sleep5', emoji: '😴', label: '꿀잠 요정', desc: '적정 수면(7~9시간) 5회', earned: goodSleep >= 5 },
    { id: 'first-bp', emoji: '🩺', label: '혈관 지킴이', desc: '첫 혈압을 측정했어요', earned: d.bpLogs.length > 0 },
    { id: 'med10', emoji: '💊', label: '약속 지킴이', desc: '복용 체크 10회', earned: d.medLogs.length >= 10 },
    { id: 'goal', emoji: '🎯', label: '목표 달성!', desc: '목표 체중에 도달했어요', earned: goalReached },
    { id: 'all-round', emoji: '🌈', label: '만능 관리자', desc: '식단·운동·수면·혈압을 모두 기록', earned: d.logs.length > 0 && d.exerciseLogs.length > 0 && d.sleepLogs.length > 0 && d.bpLogs.length > 0 },
  ]
}

/** 다음으로 노릴 만한 뱃지 (아직 못 딴 것 중 첫 번째) */
export function nextBadge(badges: Badge[]): Badge | undefined {
  return badges.find((b) => !b.earned)
}
