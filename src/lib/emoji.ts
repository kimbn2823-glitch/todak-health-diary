import type { FoodCategory, MealType } from '../types'

// 음식 분류별 이모지
export const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  '밥·죽': '🍚',
  '면·만두': '🍜',
  '국·찌개': '🍲',
  '고기·계란': '🍖',
  '생선·해산물': '🐟',
  '반찬·나물': '🥬',
  '김치·장': '🌶️',
  '빵·간식': '🍞',
  과일: '🍎',
  유제품: '🥛',
  음료: '☕',
  기타: '🍽️',
}

// 끼니별 이모지
export const MEAL_EMOJI: Record<MealType, string> = {
  아침: '🌅',
  점심: '☀️',
  저녁: '🌙',
  간식: '🍪',
}

// 화면별 헤더 이모지
export const PAGE_EMOJI = {
  home: '🏠',
  diary: '🍽️',
  meds: '💊',
  plan: '✨',
  report: '📊',
  weight: '⚖️',
  settings: '⚙️',
  goal: '🎯',
} as const

// 활동량·목표 등 선택지 이모지
export const ACTIVITY_EMOJI: Record<string, string> = {
  '거의 안함': '🛋️',
  가벼움: '🚶',
  보통: '🏃',
  활발함: '🏋️',
  '매우 활발함': '🔥',
}

export const GOAL_EMOJI: Record<string, string> = {
  감량: '📉',
  유지: '⚖️',
  증량: '📈',
}

export const GENDER_EMOJI: Record<string, string> = {
  남성: '👨',
  여성: '👩',
}

// 식사와의 관계 (복약)
export const MEAL_RELATION_EMOJI: Record<string, string> = {
  식전: '🍽️',
  식후: '🥄',
  무관: '🕐',
}
