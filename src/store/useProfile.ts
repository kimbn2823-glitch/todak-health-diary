import { create } from 'zustand'
import type { Profile } from '../types'
import { getProfile, saveProfile } from '../db/db'
import { backupProfile, restoreProfile } from '../lib/persist'

interface ProfileState {
  profile: Profile | null
  loaded: boolean
  load: () => Promise<void>
  save: (p: Profile) => Promise<void>
}

// 프로필 전역 상태 (IndexedDB와 동기화 + localStorage 사본으로 이중 보관)
export const useProfile = create<ProfileState>((set) => ({
  profile: null,
  loaded: false,

  load: async () => {
    let p: Profile | undefined
    try {
      p = await getProfile()
    } catch {
      // IndexedDB를 못 쓰는 환경(파일로 직접 열기 등) — 아래 사본으로 넘어간다.
      p = undefined
    }

    if (p) {
      // 읽을 때마다 사본을 최신으로 맞춰 둔다 (백업 불러오기 직후에도 어긋나지 않게).
      backupProfile(p)
    } else {
      // IndexedDB가 비었거나 막혔으면 사본으로 되살린다 → 온보딩을 다시 하지 않는다.
      const backup = restoreProfile()
      if (backup) {
        p = backup
        try {
          await saveProfile(backup)
        } catch {
          // 되살리기에 실패해도 화면은 사본으로 정상 동작한다.
        }
      }
    }

    set({ profile: p ?? null, loaded: true })
  },

  save: async (p: Profile) => {
    // 사본을 먼저 남긴다 — IndexedDB 쓰기가 실패해도 입력한 내용이 사라지지 않게.
    backupProfile(p)
    let fresh: Profile | undefined
    try {
      await saveProfile(p)
      fresh = await getProfile()
    } catch {
      fresh = undefined
    }
    set({ profile: fresh ?? p })
  },
}))
