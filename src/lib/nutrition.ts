import {
  ACTIVITY_LEVELS,
  type ActivityLevel,
  type Gender,
  type GoalType,
  type MacroTargets,
  type MealLog,
  type DayNutrition,
} from '../types'

// Mifflin-St Jeor 공식으로 기초대사량(BMR) 계산
export function calcBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === '남성' ? base + 5 : base - 161
}

export function activityFactor(level: ActivityLevel): number {
  return ACTIVITY_LEVELS.find((a) => a.key === level)?.factor ?? 1.375
}

// 총 에너지 소비량(TDEE)
export function calcTDEE(bmr: number, level: ActivityLevel): number {
  return bmr * activityFactor(level)
}

// 목표에 따른 하루 권장 칼로리
// 감량: -500kcal, 유지: 0, 증량: +300kcal
export function calcTargetKcal(tdee: number, goal: GoalType): number {
  let target = tdee
  if (goal === '감량') target = tdee - 500
  else if (goal === '증량') target = tdee + 300
  // 지나치게 낮은 값 방지 (안전 하한선 1200kcal)
  return Math.max(1200, Math.round(target / 10) * 10)
}

// 목표 칼로리를 탄단지 비율로 분배 (탄 50% / 단 25% / 지 25%)
// 감량 시 단백질 비중을 높여 근손실 방지 (탄 40 / 단 35 / 지 25)
export function calcMacroTargets(targetKcal: number, goal: GoalType): MacroTargets {
  const ratio =
    goal === '감량'
      ? { carbs: 0.4, protein: 0.35, fat: 0.25 }
      : goal === '증량'
        ? { carbs: 0.5, protein: 0.3, fat: 0.2 }
        : { carbs: 0.5, protein: 0.25, fat: 0.25 }
  return {
    // 탄수화물·단백질 4kcal/g, 지방 9kcal/g
    carbs: Math.round((targetKcal * ratio.carbs) / 4),
    protein: Math.round((targetKcal * ratio.protein) / 4),
    fat: Math.round((targetKcal * ratio.fat) / 9),
  }
}

// 한 번에 목표 칼로리·매크로를 계산하는 헬퍼
export function computeGoals(params: {
  gender: Gender
  weightKg: number
  heightCm: number
  age: number
  activityLevel: ActivityLevel
  goalType: GoalType
}) {
  const bmr = calcBMR(params.gender, params.weightKg, params.heightCm, params.age)
  const tdee = calcTDEE(bmr, params.activityLevel)
  const targetKcal = calcTargetKcal(tdee, params.goalType)
  const targetMacros = calcMacroTargets(targetKcal, params.goalType)
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetKcal, targetMacros }
}

// 체질량지수(BMI)
export function calcBMI(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return weightKg / (m * m)
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: '저체중', color: 'text-sky2-500' }
  if (bmi < 23) return { label: '정상', color: 'text-brand-600' }
  if (bmi < 25) return { label: '과체중', color: 'text-mango-600' }
  return { label: '비만', color: 'text-coral-600' }
}

// 여러 식단 기록을 합산
export function sumNutrition(logs: MealLog[]): DayNutrition {
  return logs.reduce<DayNutrition>(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      carbs: acc.carbs + l.carbs,
      protein: acc.protein + l.protein,
      fat: acc.fat + l.fat,
      sodium: acc.sodium + (l.sodium ?? 0),
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 }
  )
}

export const round = (n: number, digits = 0): number => {
  const p = 10 ** digits
  return Math.round(n * p) / p
}
