import { useEffect, useRef, useState } from 'react'
import type { DoseSlot } from '../types'
import { nowHHmm, timeToMinutes } from './meds'

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

export function notificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function currentPermission(): PermissionState {
  if (!notificationSupported()) return 'unsupported'
  return Notification.permission as PermissionState
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!notificationSupported()) return 'unsupported'
  const result = await Notification.requestPermission()
  return result as PermissionState
}

const CHECK_INTERVAL_MS = 30_000
// 예정 시각 이후 이 시간(분) 안에는 알림을 띄운다(탭을 늦게 연 경우 대비).
const GRACE_MINUTES = 10

/**
 * 앱이 열려 있는 동안 복용 예정 시각에 브라우저 알림을 띄운다.
 * 백그라운드 푸시가 아니므로 앱(탭)이 닫혀 있으면 알림이 오지 않는다.
 */
export function useMedReminder(slots: DoseSlot[], enabled: boolean) {
  // 이미 알림을 띄운 슬롯 키(날짜|약|시각)를 기억해 중복 알림을 막는다.
  const notified = useRef<Set<string>>(new Set())
  const slotsRef = useRef(slots)
  slotsRef.current = slots

  useEffect(() => {
    if (!enabled || !notificationSupported() || Notification.permission !== 'granted') {
      return
    }

    const check = () => {
      const now = new Date()
      const cur = timeToMinutes(nowHHmm(now))
      const dateKey = now.toISOString().slice(0, 10)

      for (const slot of slotsRef.current) {
        if (slot.taken) continue
        const due = timeToMinutes(slot.time)
        if (cur < due || cur > due + GRACE_MINUTES) continue

        const key = `${dateKey}|${slot.med.id}|${slot.time}`
        if (notified.current.has(key)) continue
        notified.current.add(key)

        try {
          new Notification('💊 약 복용 시간이에요', {
            body: `${slot.time} · ${slot.med.name} ${slot.med.dose}${
              slot.med.mealRelation !== '무관' ? ` (${slot.med.mealRelation})` : ''
            }`,
            tag: key, // 같은 복용 건은 하나의 알림으로 대체
          })
        } catch {
          // 알림 생성 실패는 조용히 무시한다.
        }
      }
    }

    check()
    const id = window.setInterval(check, CHECK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [enabled])
}

// 권한 상태를 컴포넌트에서 반응형으로 다루기 위한 훅
export function useNotificationPermission() {
  const [permission, setPermission] = useState<PermissionState>(currentPermission)

  const request = async () => {
    const next = await requestNotificationPermission()
    setPermission(next)
    return next
  }

  useEffect(() => {
    setPermission(currentPermission())
  }, [])

  return { permission, request }
}
