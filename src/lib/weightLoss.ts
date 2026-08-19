import type { WeightLog, Profile } from '../types'
import { formatKorean, fromKey, shiftDay, toKey } from './dates'

// 체지방 1kg을 감량하려면 약 7700kcal의 누적 적자가 필요하다는 통용 추정치.
export const KCAL_PER_KG_FAT = 7700

// 건강한 주간 감량 속도 범위 (kg/주).
// 주당 체중의 0.5~1% 수준이 일반적인 권장치로, 여기서는 절대값으로 단순화한다.
export const SAFE_MIN_PACE = 0.25
export const SAFE_MAX_PACE = 1.0

/** 감량 시작 체중 — 첫 체중 기록이 있으면 그것을, 없으면 프로필 값을 쓴다. */
export function startWeight(weights: WeightLog[], profile: Profile): number {
  if (weights.length === 0) return profile.currentWeightKg
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  return sorted[0].weightKg
}

/** 최신 체중 — 마지막 기록이 있으면 그것을, 없으면 프로필 값을 쓴다. */
export function latestWeight(weights: WeightLog[], profile: Profile): number {
  if (weights.length === 0) return profile.currentWeightKg
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  return sorted[sorted.length - 1].weightKg
}

/**
 * 최근 기록으로 실제 감량 속도(kg/주)를 추정한다.
 * 하루하루의 변동(수분 등)에 흔들리지 않도록 최소제곱 회귀의 기울기를 쓴다.
 * 음수 = 감량 중, 양수 = 증가 중. 데이터가 부족하면 null.
 */
export function actualPaceKgPerWeek(
  weights: WeightLog[],
  windowDays = 28
): number | null {
  if (weights.length < 2) return null
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  const lastDate = sorted[sorted.length - 1].date
  const cutoff = shiftDay(lastDate, -windowDays)
  const pts = sorted.filter((w) => w.date >= cutoff)
  if (pts.length < 2) return null

  const t0 = fromKey(pts[0].date).getTime()
  const xs = pts.map((p) => (fromKey(p.date).getTime() - t0) / 86_400_000)
  const ys = pts.map((p) => p.weightKg)
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n

  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    den += (xs[i] - mx) ** 2
  }
  // 같은 날짜에만 기록이 몰려 있으면 기울기를 낼 수 없다.
  if (den === 0) return null
  return (num / den) * 7
}

/** 목표 칼로리 대비 계획상의 감량 속도(kg/주). dailyDeficit이 양수일 때 감량. */
export function plannedPaceKgPerWeek(dailyDeficit: number): number {
  return -(dailyDeficit * 7) / KCAL_PER_KG_FAT
}

/** 시작 → 목표 구간에서 현재까지의 진행률(0~100). */
export function progressPercent(
  start: number,
  current: number,
  target: number
): number {
  const total = start - target
  if (Math.abs(total) < 0.01) return current <= target ? 100 : 0
  const done = start - current
  return Math.max(0, Math.min(100, (done / total) * 100))
}

export interface PaceAssessment {
  label: string
  tone: 'good' | 'warn' | 'info'
  advice: string
}

/** 감량 속도가 건강한 범위인지 평가한다. */
export function assessPace(
  paceKgPerWeek: number | null,
  goalType: Profile['goalType']
): PaceAssessment {
  if (paceKgPerWeek === null) {
    return {
      label: '📝 기록 부족',
      tone: 'info',
      advice: '체중을 2회 이상 기록하면 감량 속도를 계산해 드려요.',
    }
  }
  if (goalType !== '감량') {
    return {
      label: '⚖️ 감량 목표 아님',
      tone: 'info',
      advice: '설정에서 목표를 «감량»으로 바꾸면 감량 코칭을 받을 수 있어요.',
    }
  }

  const loss = -paceKgPerWeek // 양수면 빠지는 중

  if (loss > SAFE_MAX_PACE) {
    return {
      label: '⚠️ 너무 빠름',
      tone: 'warn',
      advice: `주 ${loss.toFixed(1)}kg은 다소 빠른 속도예요. 근손실·요요 위험이 있으니 섭취를 조금 늘려 주 ${SAFE_MAX_PACE}kg 이내로 조절해 보세요.`,
    }
  }
  if (loss >= SAFE_MIN_PACE) {
    return {
      label: '👍 적정 속도',
      tone: 'good',
      advice: `주 ${loss.toFixed(1)}kg으로 건강한 속도예요. 지금 페이스를 유지해 보세요.`,
    }
  }
  if (loss > 0) {
    return {
      label: '🐢 느린 편',
      tone: 'info',
      advice: '조금씩 줄고 있어요. 기록을 꾸준히 이어가면 흐름이 뚜렷해집니다.',
    }
  }
  if (loss > -0.15) {
    return {
      label: '😐 정체기',
      tone: 'info',
      advice: '체중이 거의 그대로예요. 활동량을 늘리거나 간식·음료 섭취를 점검해 보세요.',
    }
  }
  return {
    label: '📈 증가 중',
    tone: 'warn',
    advice: '최근 체중이 늘고 있어요. 최근 식단 기록에서 초과한 날이 있는지 확인해 보세요.',
  }
}

// --- 목표 설정 ---

/** 정상 BMI(18.5~22.9) 구간에 해당하는 체중 범위 */
export function healthyWeightRange(heightCm: number): [number, number] {
  const m = heightCm / 100
  return [Number((18.5 * m * m).toFixed(1)), Number((22.9 * m * m).toFixed(1))]
}

/** 목표 날짜까지 필요한 감량 속도(kg/주). 음수 = 감량 */
export function requiredPaceKgPerWeek(
  current: number,
  target: number,
  targetDate: string,
  today = toKey(new Date())
): number | null {
  const days =
    (fromKey(targetDate).getTime() - fromKey(today).getTime()) / 86_400_000
  if (days <= 0) return null
  return -(current - target) / (days / 7)
}

export type GoalVerdict = 'ok' | 'aggressive' | 'impossible' | 'slow' | 'invalid'

export interface GoalPlan {
  /** 목표까지 감량해야 할 kg (양수 = 감량) */
  deltaKg: number
  requiredPace: number | null
  /** 목표 달성에 필요한 하루 칼로리 적자 */
  dailyDeficit: number
  /** 위 적자를 반영한 하루 목표 칼로리 (안전 하한 적용) */
  targetKcal: number
  /** 안전 하한(1200kcal)에 걸려 목표 날짜를 맞출 수 없는 경우 true */
  clamped: boolean
  verdict: GoalVerdict
  message: string
  /** 안전 속도(주 0.5kg)로 갔을 때의 현실적인 도달일 */
  suggestedDate: string | null
  healthyRange: [number, number]
  targetBelowHealthy: boolean
}

const SAFE_DAILY_DEFICIT_MAX = 1000
const MIN_INTAKE_KCAL = 1200
const DEFAULT_SAFE_PACE = 0.5

/**
 * 목표 체중·날짜로부터 필요한 칼로리 적자와 실현 가능성을 계산한다.
 * tdee는 활동대사량(유지 칼로리)이다.
 */
export function computeGoalPlan(params: {
  currentWeight: number
  targetWeight: number
  targetDate?: string
  heightCm: number
  tdee: number
  today?: string
}): GoalPlan {
  const { currentWeight, targetWeight, targetDate, heightCm, tdee } = params
  const today = params.today ?? toKey(new Date())
  const deltaKg = currentWeight - targetWeight
  const healthyRange = healthyWeightRange(heightCm)
  const targetBelowHealthy = targetWeight < healthyRange[0]

  // 안전 속도로 갔을 때의 현실적인 도달일
  const suggestedDate =
    deltaKg > 0.05
      ? toKey(new Date(fromKey(today).getTime() + (deltaKg / DEFAULT_SAFE_PACE) * 7 * 86_400_000))
      : null

  if (deltaKg <= 0.05) {
    return {
      deltaKg,
      requiredPace: null,
      dailyDeficit: 0,
      targetKcal: Math.round(tdee / 10) * 10,
      clamped: false,
      verdict: deltaKg < -0.05 ? 'invalid' : 'ok',
      message:
        deltaKg < -0.05
          ? '목표 체중이 현재 체중보다 높아요. 감량이 목적이라면 목표를 더 낮게 잡아주세요.'
          : '이미 목표 체중에 도달했어요! 유지 칼로리로 관리해 보세요.',
      suggestedDate,
      healthyRange,
      targetBelowHealthy,
    }
  }

  const requiredPace = targetDate
    ? requiredPaceKgPerWeek(currentWeight, targetWeight, targetDate, today)
    : -DEFAULT_SAFE_PACE

  // 목표 날짜가 오늘이거나 과거인 경우
  if (targetDate && requiredPace === null) {
    return {
      deltaKg,
      requiredPace: null,
      dailyDeficit: 0,
      targetKcal: Math.max(MIN_INTAKE_KCAL, Math.round((tdee - 500) / 10) * 10),
      clamped: false,
      verdict: 'invalid',
      message: '목표 날짜는 오늘보다 뒤여야 해요.',
      suggestedDate,
      healthyRange,
      targetBelowHealthy,
    }
  }

  const pace = requiredPace ?? -DEFAULT_SAFE_PACE
  const neededDeficit = (Math.abs(pace) * KCAL_PER_KG_FAT) / 7
  const cappedDeficit = Math.min(neededDeficit, SAFE_DAILY_DEFICIT_MAX)
  const rawTarget = tdee - cappedDeficit
  const targetKcal = Math.max(MIN_INTAKE_KCAL, Math.round(rawTarget / 10) * 10)
  // 실제로 적용된 적자 (안전 하한에 걸리면 줄어든다)
  const dailyDeficit = Math.max(0, Math.round(tdee - targetKcal))
  // 하한(1200kcal)이 실제로 걸렸을 때만 true.
  // 10kcal 단위 반올림 때문에 적자끼리 비교하면 오차로 잘못 걸린다.
  const clamped = rawTarget < MIN_INTAKE_KCAL

  let verdict: GoalVerdict = 'ok'
  let message = ''
  const lossPace = Math.abs(pace)

  if (lossPace > SAFE_MAX_PACE * 1.5) {
    verdict = 'impossible'
    message = `이 날짜를 맞추려면 주 ${lossPace.toFixed(1)}kg을 빼야 해요. 건강에 무리가 큰 속도라 권하지 않아요. ${
      suggestedDate
        ? `주 ${DEFAULT_SAFE_PACE}kg 속도라면 ${formatKorean(suggestedDate)}쯤이 현실적이에요.`
        : ''
    }`
  } else if (lossPace > SAFE_MAX_PACE) {
    verdict = 'aggressive'
    message = `주 ${lossPace.toFixed(1)}kg은 다소 빠른 편이에요. 조금 여유 있게 잡으면 유지하기 더 쉬워요.`
  } else if (lossPace < 0.1) {
    verdict = 'slow'
    message = `주 ${lossPace.toFixed(2)}kg은 매우 완만한 속도예요. 천천히 가도 괜찮지만 변화를 느끼기까진 시간이 걸려요.`
  } else {
    verdict = 'ok'
    message = `주 ${lossPace.toFixed(1)}kg 감량 페이스예요. 건강한 범위 안이라 무리 없이 실천할 수 있어요.`
  }

  if (clamped) {
    message += ` 다만 하루 섭취가 ${MIN_INTAKE_KCAL}kcal 아래로 내려가지 않도록 목표 칼로리를 ${targetKcal}kcal로 맞췄어요.`
  }

  return {
    deltaKg,
    requiredPace: pace,
    dailyDeficit,
    targetKcal,
    clamped,
    verdict,
    message,
    suggestedDate,
    healthyRange,
    targetBelowHealthy,
  }
}

export interface WeightPlan {
  start: number
  current: number
  target: number
  /** 목표까지 남은 kg (양수 = 더 빼야 함) */
  remainingKg: number
  lostKg: number
  percent: number
  actualPace: number | null
  plannedPace: number
  /** 실제 속도 기준 도달 예상일. 감량 중이 아니면 null */
  etaDate: string | null
  etaWeeks: number | null
  assessment: PaceAssessment
  reached: boolean
}

/** 감량 계획 전체를 한 번에 계산한다. */
export function buildWeightPlan(
  weights: WeightLog[],
  profile: Profile,
  tdee: number
): WeightPlan {
  const start = startWeight(weights, profile)
  const current = latestWeight(weights, profile)
  const target = profile.targetWeightKg
  const remainingKg = current - target
  const actualPace = actualPaceKgPerWeek(weights)
  const plannedPace = plannedPaceKgPerWeek(Math.max(0, tdee - profile.targetKcal))

  let etaWeeks: number | null = null
  let etaDate: string | null = null
  // 실제 속도가 있으면 그것을, 없으면 계획상의 속도를 쓴다.
  const pace = actualPace !== null && actualPace < -0.05 ? actualPace : plannedPace
  if (remainingKg > 0.05 && pace < -0.05) {
    etaWeeks = remainingKg / Math.abs(pace)
    // 지나치게 먼 미래는 의미가 없으므로 2년까지만 표시한다.
    if (etaWeeks <= 104) {
      etaDate = toKey(
        new Date(Date.now() + etaWeeks * 7 * 86_400_000)
      )
    }
  }

  return {
    start,
    current,
    target,
    remainingKg,
    lostKg: start - current,
    percent: progressPercent(start, current, target),
    actualPace,
    plannedPace,
    etaDate,
    etaWeeks,
    assessment: assessPace(actualPace, profile.goalType),
    reached: remainingKg <= 0.05,
  }
}
