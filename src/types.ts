// 앱 전역에서 사용하는 도메인 타입 정의

export type MealType = '아침' | '점심' | '저녁' | '간식'

export const MEAL_TYPES: MealType[] = ['아침', '점심', '저녁', '간식']

export type FoodCategory =
  | '밥·죽'
  | '면·만두'
  | '국·찌개'
  | '고기·계란'
  | '생선·해산물'
  | '반찬·나물'
  | '김치·장'
  | '빵·간식'
  | '과일'
  | '유제품'
  | '음료'
  | '기타'

export const FOOD_CATEGORIES: FoodCategory[] = [
  '밥·죽',
  '면·만두',
  '국·찌개',
  '고기·계란',
  '생선·해산물',
  '반찬·나물',
  '김치·장',
  '빵·간식',
  '과일',
  '유제품',
  '음료',
  '기타',
]

// 음식 마스터. 영양성분은 servingSize(그램) 1회 제공량 기준.
export interface Food {
  id?: number
  name: string
  category: FoodCategory
  unit: string // 예: "1공기", "1인분", "100g"
  servingSize: number // 1회 제공량(g)
  kcal: number
  carbs: number // 탄수화물(g)
  protein: number // 단백질(g)
  fat: number // 지방(g)
  sodium?: number // 나트륨(mg)
  isCustom: boolean
  seedKey?: string // 시드 데이터 중복 삽입 방지용 키
}

// 식단 기록. 기록 시점의 영양값을 함께 저장하여
// 음식 마스터가 나중에 수정/삭제돼도 기록이 유지되도록 한다.
export interface MealLog {
  id?: number
  date: string // YYYY-MM-DD
  mealType: MealType
  foodId?: number
  foodName: string
  servings: number // 섭취 인분/횟수 (servingSize 배수)
  kcal: number
  carbs: number
  protein: number
  fat: number
  sodium?: number
  /** 식단 사진 (압축된 data URL). 휴대폰에서 촬영해 붙일 수 있다. */
  photo?: string
  createdAt: number
}

export interface WeightLog {
  id?: number
  date: string // YYYY-MM-DD
  weightKg: number
  note?: string
}

export type Gender = '남성' | '여성'

export type ActivityLevel =
  | '거의 안함'
  | '가벼움'
  | '보통'
  | '활발함'
  | '매우 활발함'

export const ACTIVITY_LEVELS: { key: ActivityLevel; factor: number; desc: string }[] = [
  { key: '거의 안함', factor: 1.2, desc: '운동 거의 안 함 / 좌식 생활' },
  { key: '가벼움', factor: 1.375, desc: '주 1~3회 가벼운 운동' },
  { key: '보통', factor: 1.55, desc: '주 3~5회 중간 강도 운동' },
  { key: '활발함', factor: 1.725, desc: '주 6~7회 강한 운동' },
  { key: '매우 활발함', factor: 1.9, desc: '매일 고강도 운동 / 육체노동' },
]

export type GoalType = '감량' | '유지' | '증량'

export interface MacroTargets {
  carbs: number // g
  protein: number // g
  fat: number // g
}

export interface Profile {
  id?: number
  name: string
  gender: Gender
  age: number
  heightCm: number
  currentWeightKg: number
  targetWeightKg: number
  activityLevel: ActivityLevel
  goalType: GoalType
  targetKcal: number
  targetMacros: MacroTargets
  /** 목표 달성 희망일 (YYYY-MM-DD). 설정하면 필요한 감량 속도를 역산한다. */
  targetDate?: string
  onboarded: boolean
}

// 주간 식단 계획: 날짜+끼니 슬롯에 배치한 음식 목록
export interface PlanEntry {
  id?: number
  date: string // YYYY-MM-DD
  mealType: MealType
  foodId?: number
  foodName: string
  servings: number
  kcal: number
  carbs: number
  protein: number
  fat: number
}

// --- 물 마시기 ---

export interface WaterLog {
  id?: number
  date: string // YYYY-MM-DD (하루 한 건)
  cups: number // 마신 잔 수 (0~8)
}

// --- 보상 쿠폰 (뱃지 마일스톤) ---

export interface RewardClaim {
  id?: number
  rewardId: string // lib/rewards.ts의 Reward.id
  claimedAt: number
}

// --- 혈압 기록 ---

export type BpSource = '워치' | '직접입력'

export interface BpLog {
  id?: number
  date: string // YYYY-MM-DD
  time: string // HH:mm
  systolic: number // 수축기 (mmHg)
  diastolic: number // 이완기 (mmHg)
  pulse?: number // 맥박 (bpm)
  source: BpSource
  createdAt: number
}

// --- 수면 기록 ---

export type SleepQuality = '좋음' | '보통' | '나쁨'

export const SLEEP_QUALITIES: SleepQuality[] = ['좋음', '보통', '나쁨']

export interface SleepLog {
  id?: number
  /** 기상한 날짜 (YYYY-MM-DD). 밤 사이 수면을 이 날짜에 기록한다. */
  date: string
  bedTime: string // 취침 시각 HH:mm
  wakeTime: string // 기상 시각 HH:mm
  hours: number // 계산된 수면 시간
  quality: SleepQuality
  memo?: string
  createdAt: number
}

// --- 운동 기록 ---

export interface ExerciseLog {
  id?: number
  date: string // YYYY-MM-DD
  exerciseId: string
  name: string
  emoji: string
  minutes: number
  kcal: number // 소모 칼로리
  createdAt: number
}

// --- 약 복용 알림 ---

export type MealRelation = '식전' | '식후' | '무관'

export const MEAL_RELATIONS: MealRelation[] = ['식전', '식후', '무관']

export interface Medication {
  id?: number
  name: string
  dose: string // 예: "1정", "5ml"
  times: string[] // 복용 시각 목록 (HH:mm)
  mealRelation: MealRelation
  memo?: string
  active: boolean // 복용 중 여부
  createdAt: number
}

// 복용 완료 기록. 날짜+약+시각 조합으로 한 번의 복용을 나타낸다.
export interface MedLog {
  id?: number
  date: string // YYYY-MM-DD
  medId: number
  time: string // HH:mm (예정 시각)
  takenAt: number
}

// 오늘 복용해야 할 한 건 (약 + 예정 시각 + 완료 여부)
export interface DoseSlot {
  med: Medication
  time: string
  taken: boolean
  logId?: number
}

export interface DayNutrition {
  kcal: number
  carbs: number
  protein: number
  fat: number
  sodium: number
}
