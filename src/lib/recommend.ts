import type { Food, MacroTargets } from '../types'

export interface RecommendInput {
  foods: Food[]
  remainingKcal: number
  targetMacros: MacroTargets // 하루 전체 목표 (부족 매크로 판단용)
  consumedMacros: { carbs: number; protein: number; fat: number }
  excludeIds?: number[]
}

export interface Recommendation {
  food: Food
  servings: number
  kcal: number
  reason: string
}

// 남은 칼로리와 부족한 영양소를 고려해 음식 조합을 제안한다.
// 서버/AI 없이 동작하는 규칙 기반(그리디) 추천.
export function recommendMeals(input: RecommendInput): Recommendation[] {
  const { foods, remainingKcal, targetMacros, consumedMacros, excludeIds = [] } = input

  if (remainingKcal < 80) return []

  // 부족한 매크로 파악 (달성률이 가장 낮은 영양소를 우선)
  const deficits = {
    protein: Math.max(0, targetMacros.protein - consumedMacros.protein),
    carbs: Math.max(0, targetMacros.carbs - consumedMacros.carbs),
    fat: Math.max(0, targetMacros.fat - consumedMacros.fat),
  }
  const proteinShort =
    consumedMacros.protein / (targetMacros.protein || 1) < 0.7 && deficits.protein > 15

  const candidates = foods
    .filter((f) => f.id != null && !excludeIds.includes(f.id))
    // 술·탄산음료 등은 추천에서 제외
    .filter((f) => !['소주', '맥주', '콜라'].includes(f.name))

  // 각 음식에 점수 부여
  const scored = candidates.map((f) => {
    // 1인분 기준 남은 칼로리에 대한 적합도 (너무 크면 감점)
    const fitKcal = 1 - Math.min(1, Math.abs(f.kcal - remainingKcal * 0.5) / remainingKcal)
    // 단백질 밀도 (kcal당 단백질) — 단백질 부족 시 가중
    const proteinDensity = f.protein / Math.max(1, f.kcal)
    const proteinBonus = proteinShort ? proteinDensity * 400 : proteinDensity * 100
    // 채소·과일 등 저칼로리 균형 보너스
    const balanceBonus =
      f.category === '과일' || f.category === '반찬·나물' ? 20 : 0
    return { food: f, score: fitKcal * 100 + proteinBonus + balanceBonus }
  })

  scored.sort((a, b) => b.score - a.score)

  // 그리디: 남은 칼로리를 채울 때까지 상위 후보에서 서로 다른 카테고리를 담는다.
  const picks: Recommendation[] = []
  const usedCategories = new Set<string>()
  let budget = remainingKcal

  for (const s of scored) {
    if (picks.length >= 4) break
    if (budget < 80) break
    const f = s.food
    // 한 끼가 지나치게 단조롭지 않도록 카테고리 중복 제한 (밥류는 예외적으로 1회만)
    if (usedCategories.has(f.category)) continue

    // 남은 예산 안에서 담을 수 있는 인분 수 (0.5 단위, 최대 2)
    let servings = Math.min(2, Math.max(0.5, Math.floor((budget / f.kcal) * 2) / 2))
    if (f.kcal * 0.5 > budget) continue
    const kcal = Math.round(f.kcal * servings)
    if (kcal > budget + 100) {
      servings = 0.5
    }

    const finalKcal = Math.round(f.kcal * servings)
    picks.push({
      food: f,
      servings,
      kcal: finalKcal,
      reason: buildReason(f, proteinShort),
    })
    usedCategories.add(f.category)
    budget -= finalKcal
  }

  return picks
}

function buildReason(f: Food, proteinShort: boolean): string {
  if (proteinShort && f.protein / Math.max(1, f.kcal) > 0.08) {
    return '단백질 보충에 좋아요'
  }
  if (f.category === '과일' || f.category === '반찬·나물') {
    return '저칼로리로 포만감을 더해요'
  }
  if (f.kcal < 200) return '가볍게 즐기기 좋아요'
  return '남은 목표 칼로리에 알맞아요'
}
