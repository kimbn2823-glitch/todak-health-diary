import Dexie, { type Table } from 'dexie'
import type {
  Food,
  MealLog,
  WeightLog,
  Profile,
  PlanEntry,
  Medication,
  MedLog,
  ExerciseLog,
  SleepLog,
  BpLog,
  WaterLog,
  RewardClaim,
} from '../types'
import { SEED_FOODS } from '../data/foods'

// IndexedDB 기반 로컬 데이터베이스.
// 모든 데이터는 사용자의 브라우저에만 저장된다(서버 전송 없음).
export class HealthDB extends Dexie {
  foods!: Table<Food, number>
  logs!: Table<MealLog, number>
  weights!: Table<WeightLog, number>
  profile!: Table<Profile, number>
  plans!: Table<PlanEntry, number>
  meds!: Table<Medication, number>
  medLogs!: Table<MedLog, number>
  exerciseLogs!: Table<ExerciseLog, number>
  sleepLogs!: Table<SleepLog, number>
  bpLogs!: Table<BpLog, number>
  waterLogs!: Table<WaterLog, number>
  rewardClaims!: Table<RewardClaim, number>

  constructor() {
    super('health-diet-db')
    this.version(1).stores({
      // &seedKey: 시드 중복 방지를 위한 유니크 인덱스
      foods: '++id, name, category, isCustom, &seedKey',
      logs: '++id, date, mealType, [date+mealType]',
      weights: '++id, &date',
      profile: '++id',
      plans: '++id, date, mealType, [date+mealType]',
    })
    // v2: 약 복용 알림
    this.version(2).stores({
      meds: '++id, name, active',
      // &[date+medId+time]: 같은 시각의 중복 복용 기록 방지
      medLogs: '++id, date, medId, &[date+medId+time]',
    })
    // v3: 운동 기록
    this.version(3).stores({
      exerciseLogs: '++id, date, exerciseId',
    })
    // v4: 수면 기록 (하루 한 건이므로 date를 유니크로)
    this.version(4).stores({
      sleepLogs: '++id, &date',
    })
    // v5: 혈압 기록
    this.version(5).stores({
      bpLogs: '++id, date',
    })
    // v6: 물 마시기 (하루 한 건)
    this.version(6).stores({
      waterLogs: '++id, &date',
    })
    // v7: 보상 쿠폰 사용 기록 (쿠폰당 한 번)
    this.version(7).stores({
      rewardClaims: '++id, &rewardId',
    })
  }
}

export const db = new HealthDB()

// 동시 호출(React StrictMode의 이펙트 이중 실행 등) 시 시드가 중복 삽입되지 않도록
// 진행 중인 작업을 공유한다.
let seedingPromise: Promise<void> | null = null

// 기본 음식 데이터를 동기화한다.
// «비어 있을 때만 삽입»이 아니라 «없는 것만 골라 추가»하는 방식이라,
// 앱을 업데이트해서 기본 목록에 음식이 늘어나면 이미 쓰던 기기에도 새 음식이 들어온다.
// (사용자가 직접 등록한 음식과 기존 기록은 건드리지 않는다)
export function seedFoodsIfEmpty(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = db
      // 확인과 삽입을 하나의 트랜잭션으로 묶어 경쟁 상태를 막는다.
      .transaction('rw', db.foods, async () => {
        const existingKeys = new Set(
          (await db.foods.toArray()).map((f) => f.seedKey).filter(Boolean)
        )
        const missing: Food[] = SEED_FOODS.filter((f) => !existingKeys.has(f.seedKey)).map(
          (f) => ({ ...f, isCustom: false })
        )
        if (missing.length > 0) await db.foods.bulkAdd(missing)
      })
      .catch((err) => {
        // 실패 시 다음 호출에서 재시도할 수 있도록 캐시를 비운다.
        seedingPromise = null
        throw err
      })
  }
  return seedingPromise
}

// 프로필은 단일 레코드로 관리한다.
export async function getProfile(): Promise<Profile | undefined> {
  return db.profile.toCollection().first()
}

export async function saveProfile(profile: Profile): Promise<void> {
  // 읽기와 쓰기를 한 트랜잭션으로 묶는다.
  // 묶지 않으면 저장이 동시에 두 번 호출될 때(리액트 StrictMode의 이펙트 이중 실행,
  // 복구 로직과 사용자 저장이 겹치는 경우 등) 둘 다 «없음»으로 보고 각각 추가해
  // 프로필이 중복으로 쌓인다.
  await db.transaction('rw', db.profile, async () => {
    const rows = await db.profile.toArray()
    const first = rows[0]
    if (first?.id == null) {
      await db.profile.add(profile)
      return
    }
    await db.profile.update(first.id, profile)
    // 이전 버전에서 중복 저장된 행이 있으면 정리한다 (프로필은 항상 한 건).
    const extras = rows
      .slice(1)
      .map((r) => r.id)
      .filter((id): id is number => id != null)
    if (extras.length > 0) await db.profile.bulkDelete(extras)
  })
}
