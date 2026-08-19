// 💾 «다시 처음부터 입력하지 않게» 하는 저장 보조 장치.
//
// 기본 저장소는 IndexedDB(Dexie)지만, 다음 상황에서는 그것만으로 부족하다.
//  ① 브라우저가 저장 공간을 회수 — iOS 사파리는 7일간 안 쓰면 사이트 데이터를 지운다.
//  ② IndexedDB를 못 쓰는 환경 — HTML 파일을 file:// 로 직접 열면 막히는 브라우저가 있다.
//  ③ 입력하다가 중간에 창을 닫음 — 저장 버튼을 누르기 전이라 아무 데도 안 남는다.
//
// 그래서 ①은 «영구 저장 권한»으로, ②는 프로필의 localStorage 사본으로,
// ③은 입력 중 자동 임시저장(초안)으로 각각 막는다.

import type { Profile } from '../types'

const PROFILE_KEY = 'todak-profile'
const DRAFT_PREFIX = 'todak-draft-'

// localStorage는 사생활 보호 모드 등에서 예외를 던질 수 있어 항상 감싼다.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 저장 공간이 꽉 찼거나 차단된 경우 — 조용히 넘어간다 (IndexedDB가 본 저장소)
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* 무시 */
  }
}

// --- ① 영구 저장 권한 -------------------------------------------------------

/**
 * 브라우저에 «이 사이트 데이터를 함부로 지우지 말아 달라»고 요청한다.
 * 허용되면 저장 공간이 부족해도, 오래 안 써도 기록이 유지된다.
 * 사파리는 홈 화면에 추가한 경우, 크롬은 사용 빈도·북마크 등을 보고 자동 판단한다.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    // 이미 허용돼 있으면 다시 묻지 않는다.
    if (await navigator.storage.persisted?.()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

/** 현재 영구 저장이 허용된 상태인지 (설정 화면 안내용) */
export async function isStoragePersisted(): Promise<boolean> {
  try {
    return (await navigator.storage?.persisted?.()) ?? false
  } catch {
    return false
  }
}

// --- ② 프로필 사본 ----------------------------------------------------------

/** 프로필을 localStorage에도 복사해 둔다 (IndexedDB가 비거나 막혔을 때의 대비책). */
export function backupProfile(profile: Profile): void {
  write(PROFILE_KEY, JSON.stringify(profile))
}

/** 사본으로 남겨둔 프로필을 읽는다. 형식이 깨졌으면 null. */
export function restoreProfile(): Profile | null {
  const raw = read(PROFILE_KEY)
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as Profile
    // 최소한의 형태 확인 — 엉뚱한 값으로 앱이 깨지지 않게
    if (typeof p?.heightCm !== 'number' || typeof p?.targetKcal !== 'number') return null
    // id는 IndexedDB의 키라서 되살릴 때 충돌하지 않도록 버린다.
    const { id, ...rest } = p
    void id
    return rest as Profile
  } catch {
    return null
  }
}

/** 데이터 초기화 시 사본도 함께 지운다 (안 지우면 초기화해도 프로필이 되살아난다). */
export function clearProfileBackup(): void {
  remove(PROFILE_KEY)
}

// --- ③ 입력 중 임시저장(초안) ------------------------------------------------

/** 입력 중인 폼 내용을 잠깐 저장해 둔다. 저장 버튼을 누르기 전에 나가도 남는다. */
export function saveDraft(key: string, value: unknown): void {
  write(DRAFT_PREFIX + key, JSON.stringify(value))
}

/** 저장해 둔 초안을 읽는다. 없으면 null. */
export function loadDraft<T>(key: string): T | null {
  const raw = read(DRAFT_PREFIX + key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** 정식 저장이 끝났으면 초안을 지운다. */
export function clearDraft(key: string): void {
  remove(DRAFT_PREFIX + key)
}
