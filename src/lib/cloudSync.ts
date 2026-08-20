// ☁️ 클라우드 동기화 — 기록을 서버(Postgres)에 자동 보관하고 기기 간에 이어준다.
//
// 로그인 대신 «동기화 코드»(예: TODAK-3F7K-9Q2M-X8PL)를 쓴다.
// 같은 코드를 넣은 기기들은 같은 기록을 공유한다. 코드가 곧 열쇠이므로
// 다른 사람에게 알려주면 그 사람도 기록을 볼 수 있다.
//
// 동작 원리
//  · 기록이 바뀌면 2.5초 뒤 스냅샷(기록 전체)을 서버로 올린다.
//  · 앱을 열거나 화면에 돌아오면 서버 스냅샷을 내려받아 비교한다.
//  · 서버가 «내가 마지막으로 올린 그대로»면 → 내 기기 기준으로 덮어쓴다(삭제도 반영).
//  · 서버가 다른 기기에 의해 바뀌어 있으면 → 양쪽을 합친다(기록을 잃지 않는 방향).
//  · 식단 사진은 용량 문제로 동기화에서 제외한다(기기에만 저장).

import { db } from '../db/db'
import type {
  BpLog,
  ExerciseLog,
  Food,
  MealLog,
  MedLog,
  Medication,
  PlanEntry,
  Profile,
  RewardClaim,
  SleepLog,
  WaterLog,
} from '../types'

const KEY_ID = 'todak-sync-id'
const KEY_ON = 'todak-sync-on'
const KEY_LAST_SYNC = 'todak-sync-last' // 마지막 성공 시각 (표시용)
const KEY_LOCAL_CHANGE = 'todak-sync-localchange' // 마지막 로컬 변경 시각
const KEY_SERVER_STAMP = 'todak-sync-serverstamp' // 내가 마지막으로 올린 스냅샷의 updatedAt

const API = '/api/sync'
const PUSH_DELAY_MS = 2500

// ---------- 저장소 헬퍼 (사생활 보호 모드 등에서 예외가 나도 앱이 죽지 않게) ----------

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function lsSet(key: string, v: string): void {
  try {
    localStorage.setItem(key, v)
  } catch {
    /* 무시 */
  }
}
function lsDel(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* 무시 */
  }
}

// ---------- 상태 (설정 화면 표시용) ----------

export type SyncState = 'off' | 'idle' | 'syncing' | 'error' | 'no-server'

export interface SyncStatus {
  state: SyncState
  lastSyncAt: number | null
  message: string
}

let status: SyncStatus = {
  state: lsGet(KEY_ON) === '1' ? 'idle' : 'off',
  lastSyncAt: lsGet(KEY_LAST_SYNC) ? Number(lsGet(KEY_LAST_SYNC)) : null,
  message: '',
}

const listeners = new Set<() => void>()

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch }
  listeners.forEach((fn) => fn())
}

export function subscribeSyncStatus(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getSyncStatus(): SyncStatus {
  return status
}

// ---------- 동기화 코드 ----------

export function getSyncId(): string | null {
  return lsGet(KEY_ID)
}

export function isSyncOn(): boolean {
  return lsGet(KEY_ON) === '1' && !!getSyncId()
}

function randomCode(): string {
  // 헷갈리는 글자(O/0, I/1)를 뺀 문자셋
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buf = new Uint8Array(12)
  crypto.getRandomValues(buf)
  const pick = (i: number) => chars[buf[i] % chars.length]
  const g = (s: number) => pick(s) + pick(s + 1) + pick(s + 2) + pick(s + 3)
  return `TODAK-${g(0)}-${g(4)}-${g(8)}`
}

export function isValidSyncId(code: string): boolean {
  return /^TODAK(-[A-Z0-9]{4}){3}$/.test(code)
}

// 다른 기기의 코드로 «연결»한 직후 한 번은 서버 쪽 프로필을 우선한다.
// (새 기기에서 대충 만든 임시 프로필이 원래 프로필을 덮어쓰지 않게)
let preferRemoteProfileOnce = false

/** 동기화를 켠다. 코드를 넘기면 그 코드로(다른 기기와 연결), 없으면 새 코드 발급. */
export async function enableSync(existingCode?: string): Promise<void> {
  const code = existingCode?.trim().toUpperCase() || randomCode()
  if (!isValidSyncId(code)) throw new Error('동기화 코드 형식이 올바르지 않습니다.')
  if (existingCode) preferRemoteProfileOnce = true
  lsSet(KEY_ID, code)
  lsSet(KEY_ON, '1')
  // 다른 코드로 갈아탄 것일 수 있으니 서버 기준점을 초기화한다.
  lsDel(KEY_SERVER_STAMP)
  setStatus({ state: 'idle', message: '' })
  await syncNow()
}

export function disableSync(): void {
  lsSet(KEY_ON, '0')
  setStatus({ state: 'off', message: '' })
}

// ---------- 스냅샷 ----------

interface Snapshot {
  version: 7
  updatedAt: number
  profile: Profile | null
  logs: MealLog[]
  weights: { date: string; weightKg: number; note?: string }[]
  plans: PlanEntry[]
  meds: Medication[]
  medLogs: MedLog[]
  exerciseLogs: ExerciseLog[]
  sleepLogs: SleepLog[]
  bpLogs: BpLog[]
  waterLogs: WaterLog[]
  rewardClaims: RewardClaim[]
  foods: Food[] // 직접 등록한 음식만
}

function lastLocalChangeAt(): number {
  const v = lsGet(KEY_LOCAL_CHANGE)
  return v ? Number(v) : 0
}

async function buildSnapshot(): Promise<Snapshot> {
  const [profileRows, logs, weights, plans, meds, medLogs, exerciseLogs, sleepLogs, bpLogs, waterLogs, rewardClaims, customFoods] =
    await Promise.all([
      db.profile.toArray(),
      db.logs.toArray(),
      db.weights.toArray(),
      db.plans.toArray(),
      db.meds.toArray(),
      db.medLogs.toArray(),
      db.exerciseLogs.toArray(),
      db.sleepLogs.toArray(),
      db.bpLogs.toArray(),
      db.waterLogs.toArray(),
      db.rewardClaims.toArray(),
      db.foods.filter((f) => f.isCustom).toArray(),
    ])

  const stripId = <T extends { id?: number }>(rows: T[]): T[] =>
    rows.map((r) => {
      const { id, ...rest } = r
      void id
      return rest as T
    })

  const profile = profileRows[0]
    ? (() => {
        const { id, ...rest } = profileRows[0]
        void id
        return rest as Profile
      })()
    : null

  return {
    version: 7,
    updatedAt: lastLocalChangeAt() || Date.now(),
    profile,
    // 사진(photo)은 용량이 커서 동기화에서 제외한다 — 기기에만 남는다.
    logs: stripId(logs).map((r) => {
      const { photo, ...rest } = r
      void photo
      return rest as MealLog
    }),
    weights: stripId(weights),
    plans: stripId(plans),
    // 약은 medLogs가 meds의 id를 참조하므로 id를 유지한다.
    meds,
    medLogs,
    exerciseLogs: stripId(exerciseLogs),
    sleepLogs: stripId(sleepLogs),
    bpLogs: stripId(bpLogs),
    waterLogs: stripId(waterLogs),
    rewardClaims: stripId(rewardClaims),
    foods: stripId(customFoods),
  }
}

// ---------- 병합 (기록을 잃지 않는 방향으로 합친다) ----------

function unionBy<T>(newer: T[], older: T[], key: (r: T) => string): T[] {
  const seen = new Set(newer.map(key))
  const extras = older.filter((r) => !seen.has(key(r)))
  return [...newer, ...extras]
}

/** newer.updatedAt >= older.updatedAt 를 전제로 두 스냅샷을 합친다. */
export function mergeSnapshots(newer: Snapshot, older: Snapshot): Snapshot {
  return {
    version: 7,
    updatedAt: Math.max(newer.updatedAt, older.updatedAt),
    // 프로필은 최신 쪽. 단, 최신 쪽이 비어 있으면(새 기기 연결 직후) 기존 것을 지킨다.
    profile: newer.profile ?? older.profile,
    logs: unionBy(newer.logs, older.logs, (r) => `${r.createdAt}|${r.foodName}|${r.date}|${r.mealType}`),
    weights: unionBy(newer.weights, older.weights, (r) => r.date),
    plans: unionBy(newer.plans, older.plans, (r) => `${r.date}|${r.mealType}|${r.foodName}`),
    // 약(meds/medLogs)은 id 참조가 얽혀 있어 쌍으로 최신 쪽을 쓴다.
    // 최신 쪽에 약이 하나도 없으면(새 기기) 기존 것을 지킨다.
    ...(newer.meds.length > 0
      ? { meds: newer.meds, medLogs: newer.medLogs }
      : { meds: older.meds, medLogs: older.medLogs }),
    exerciseLogs: unionBy(newer.exerciseLogs, older.exerciseLogs, (r) => `${r.createdAt}|${r.exerciseId}`),
    sleepLogs: unionBy(newer.sleepLogs, older.sleepLogs, (r) => r.date),
    bpLogs: unionBy(newer.bpLogs, older.bpLogs, (r) => `${r.createdAt}`),
    waterLogs: unionBy(newer.waterLogs, older.waterLogs, (r) => r.date),
    rewardClaims: unionBy(newer.rewardClaims, older.rewardClaims, (r) => r.rewardId),
    foods: unionBy(newer.foods, older.foods, (r) => r.name),
  }
}

/** updatedAt을 뺀 내용 비교 (적용 필요 여부 판단용) */
function sameContent(a: Snapshot, b: Snapshot): boolean {
  const strip = (s: Snapshot) => {
    const { updatedAt, ...rest } = s
    void updatedAt
    return rest
  }
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b))
}

// ---------- 스냅샷 적용 ----------

// 적용 중에는 변경 감지 훅이 «로컬 변경»으로 오해하지 않게 막는다.
let applying = false

async function applySnapshot(s: Snapshot): Promise<void> {
  applying = true
  try {
    await db.transaction(
      'rw',
      [db.profile, db.logs, db.weights, db.plans, db.meds, db.medLogs, db.exerciseLogs, db.sleepLogs, db.bpLogs, db.waterLogs, db.rewardClaims, db.foods],
      async () => {
        // 서버 스냅샷에는 사진이 없으므로, 이 기기에 있던 사진은 살려서 다시 붙인다.
        const photoByKey = new Map<string, string>()
        for (const r of await db.logs.toArray()) {
          if (r.photo) photoByKey.set(`${r.createdAt}|${r.foodName}`, r.photo)
        }

        await Promise.all([
          db.profile.clear(),
          db.logs.clear(),
          db.weights.clear(),
          db.plans.clear(),
          db.meds.clear(),
          db.medLogs.clear(),
          db.exerciseLogs.clear(),
          db.sleepLogs.clear(),
          db.bpLogs.clear(),
          db.waterLogs.clear(),
          db.rewardClaims.clear(),
          db.foods.filter((f) => f.isCustom).delete(),
        ])

        if (s.profile) await db.profile.add(s.profile)
        if (s.logs.length)
          await db.logs.bulkAdd(
            s.logs.map((r) => {
              const photo = photoByKey.get(`${r.createdAt}|${r.foodName}`)
              return photo ? { ...r, photo } : r
            })
          )
        if (s.weights.length) await db.weights.bulkAdd(s.weights)
        if (s.plans.length) await db.plans.bulkAdd(s.plans)
        if (s.meds.length) await db.meds.bulkAdd(s.meds)
        if (s.medLogs.length) await db.medLogs.bulkAdd(s.medLogs)
        if (s.exerciseLogs.length) await db.exerciseLogs.bulkAdd(s.exerciseLogs)
        if (s.sleepLogs.length) await db.sleepLogs.bulkAdd(s.sleepLogs)
        if (s.bpLogs.length) await db.bpLogs.bulkAdd(s.bpLogs)
        if (s.waterLogs.length) await db.waterLogs.bulkAdd(s.waterLogs)
        if (s.rewardClaims.length) await db.rewardClaims.bulkAdd(s.rewardClaims)
        if (s.foods.length) await db.foods.bulkAdd(s.foods.map((f) => ({ ...f, isCustom: true })))
      }
    )
  } finally {
    applying = false
  }
}

// ---------- 서버 통신 ----------

async function fetchServer(id: string): Promise<Snapshot | null | 'no-server'> {
  let res: Response
  try {
    res = await fetch(`${API}?id=${encodeURIComponent(id)}`)
  } catch {
    return 'no-server' // 오프라인이거나 서버가 없는 환경(localhost 개발 등)
  }
  if (res.status === 404 || res.status === 405) return 'no-server'
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `서버 오류 (${res.status})`)
  return (body?.data as Snapshot | null) ?? null
}

async function pushServer(id: string, data: Snapshot): Promise<void> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, data }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `업로드 실패 (${res.status})`)
}

// ---------- 동기화 실행 ----------

let syncing = false
let pushTimer: ReturnType<typeof setTimeout> | null = null

export async function syncNow(): Promise<void> {
  if (!isSyncOn() || syncing) return
  const id = getSyncId()
  if (!id) return

  syncing = true
  setStatus({ state: 'syncing', message: '' })
  try {
    const local = await buildSnapshot()
    const server = await fetchServer(id)

    if (server === 'no-server') {
      setStatus({ state: 'no-server', message: 'Vercel에 배포된 주소에서 동작합니다.' })
      return
    }

    const lastSeen = Number(lsGet(KEY_SERVER_STAMP) ?? 0)
    let final: Snapshot

    if (!server) {
      // 서버가 비어 있음 → 내 기록을 처음 올린다.
      final = local
    } else if (server.updatedAt === lastSeen) {
      // 서버가 내가 마지막으로 올린 그대로 → 내 기기 기준(삭제도 그대로 반영).
      final = local
    } else {
      // 다른 기기가 올린 게 있음 → 합친다 (기록을 잃지 않는 방향).
      final =
        server.updatedAt >= local.updatedAt
          ? mergeSnapshots(server, local)
          : mergeSnapshots(local, server)
      if (preferRemoteProfileOnce) {
        if (server.profile) final.profile = server.profile
        if (server.meds.length > 0) {
          final.meds = server.meds
          final.medLogs = server.medLogs
        }
      }
      if (!sameContent(final, local)) await applySnapshot(final)
    }

    final.updatedAt = Math.max(final.updatedAt, Date.now())
    await pushServer(id, final)

    preferRemoteProfileOnce = false
    lsSet(KEY_SERVER_STAMP, String(final.updatedAt))
    lsSet(KEY_LAST_SYNC, String(Date.now()))
    setStatus({ state: 'idle', lastSyncAt: Date.now(), message: '' })
  } catch (err) {
    setStatus({
      state: 'error',
      message: err instanceof Error ? err.message : '동기화에 실패했습니다.',
    })
  } finally {
    syncing = false
  }
}

function schedulePush(): void {
  if (!isSyncOn()) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushTimer = null
    void syncNow()
  }, PUSH_DELAY_MS)
}

function onLocalChange(): void {
  if (applying) return
  lsSet(KEY_LOCAL_CHANGE, String(Date.now()))
  schedulePush()
}

// ---------- 초기화 (앱 시작 시 한 번) ----------

let inited = false

export function initCloudSync(): void {
  if (inited) return
  inited = true

  // 모든 테이블의 생성·수정·삭제를 감지한다.
  for (const table of db.tables) {
    table.hook('creating', function (_key, obj) {
      // 기본 음식 시드 삽입은 «내 기록 변경»이 아니다.
      if (table.name === 'foods' && !(obj as Food).isCustom) return
      onLocalChange()
    })
    table.hook('updating', function () {
      onLocalChange()
      return undefined
    })
    table.hook('deleting', function () {
      onLocalChange()
    })
  }

  // 화면에 다시 돌아왔을 때(휴대폰에서 앱 전환 등) 최신 상태를 맞춘다.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void syncNow()
  })

  if (isSyncOn()) void syncNow()
}
