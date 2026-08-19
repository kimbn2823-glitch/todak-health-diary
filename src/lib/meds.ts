import { db } from '../db/db'
import type { DoseSlot, MedLog, Medication } from '../types'

// "HH:mm" → 분 단위 숫자 (정렬·비교용)
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function nowHHmm(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 복용 중인 약 + 오늘 복용 기록 → 오늘의 복용 슬롯 목록 (시각순)
export function buildDoseSlots(meds: Medication[], logs: MedLog[]): DoseSlot[] {
  const slots: DoseSlot[] = []
  for (const med of meds) {
    if (!med.active || med.id == null) continue
    for (const time of med.times) {
      const log = logs.find((l) => l.medId === med.id && l.time === time)
      slots.push({ med, time, taken: !!log, logId: log?.id })
    }
  }
  return slots.sort((a, b) => {
    const d = timeToMinutes(a.time) - timeToMinutes(b.time)
    return d !== 0 ? d : a.med.name.localeCompare(b.med.name, 'ko')
  })
}

// 복용 완료/취소 토글
export async function toggleDose(date: string, slot: DoseSlot): Promise<void> {
  if (slot.med.id == null) return
  if (slot.taken && slot.logId != null) {
    await db.medLogs.delete(slot.logId)
    return
  }
  try {
    await db.medLogs.add({
      date,
      medId: slot.med.id,
      time: slot.time,
      takenAt: Date.now(),
    })
  } catch {
    // 유니크 인덱스 충돌(이미 기록됨)은 무시한다.
  }
}

// 예정 시각이 지났는데 아직 복용하지 않은 슬롯
export function isOverdue(slot: DoseSlot, now = new Date()): boolean {
  return !slot.taken && timeToMinutes(slot.time) < timeToMinutes(nowHHmm(now))
}

// 다음 복용 예정 슬롯
export function nextDose(slots: DoseSlot[], now = new Date()): DoseSlot | undefined {
  const cur = timeToMinutes(nowHHmm(now))
  return slots.find((s) => !s.taken && timeToMinutes(s.time) >= cur)
}

export function doseProgress(slots: DoseSlot[]): { taken: number; total: number } {
  return { taken: slots.filter((s) => s.taken).length, total: slots.length }
}

// 기본 복용 시각 프리셋
export const TIME_PRESETS: { label: string; times: string[] }[] = [
  { label: '하루 1번 (아침)', times: ['08:00'] },
  { label: '하루 2번 (아침·저녁)', times: ['08:00', '19:00'] },
  { label: '하루 3번 (매 식후)', times: ['08:00', '13:00', '19:00'] },
  { label: '취침 전', times: ['22:00'] },
]
