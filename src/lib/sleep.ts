import type { SleepLog, SleepQuality } from '../types'

// 성인 권장 수면 시간 (시간)
export const IDEAL_MIN = 7
export const IDEAL_MAX = 9

/**
 * 취침~기상 시각으로 수면 시간을 계산한다.
 * 자정을 넘기는 경우(23:00 → 07:00)를 자동으로 처리한다.
 */
export function calcSleepHours(bedTime: string, wakeTime: string): number {
  const [bh, bm] = bedTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  const bed = (bh || 0) * 60 + (bm || 0)
  const wake = (wh || 0) * 60 + (wm || 0)
  // 기상이 취침보다 이르면 자정을 넘긴 것으로 본다.
  const minutes = wake >= bed ? wake - bed : 24 * 60 - bed + wake
  return Math.round((minutes / 60) * 10) / 10
}

export interface SleepAssessment {
  label: string
  tone: 'good' | 'warn' | 'info'
  advice: string
}

/** 수면 시간이 권장 범위인지 평가 */
export function assessSleep(hours: number | null): SleepAssessment {
  if (hours === null) {
    return {
      label: '📝 기록 없음',
      tone: 'info',
      advice: '수면을 기록하면 패턴을 분석해 드려요.',
    }
  }
  if (hours < 5) {
    return {
      label: '😵 많이 부족',
      tone: 'warn',
      advice: `${hours}시간은 너무 짧아요. 수면 부족은 식욕 조절 호르몬을 흐트러뜨려 체중 관리에도 불리해요.`,
    }
  }
  if (hours < IDEAL_MIN) {
    return {
      label: '😪 조금 부족',
      tone: 'warn',
      advice: `권장(${IDEAL_MIN}~${IDEAL_MAX}시간)보다 짧아요. 30분만 일찍 누워보는 건 어떨까요?`,
    }
  }
  if (hours <= IDEAL_MAX) {
    return {
      label: '😊 적정 수면',
      tone: 'good',
      advice: `${hours}시간, 권장 범위 안이에요. 이 리듬을 유지해 보세요!`,
    }
  }
  return {
    label: '😴 다소 많음',
    tone: 'info',
    advice: `${hours}시간은 권장보다 길어요. 수면의 질이 낮으면 오래 자도 개운하지 않을 수 있어요.`,
  }
}

/** 평균 수면 시간 (기록이 있는 날만) */
export function averageHours(logs: SleepLog[]): number | null {
  if (logs.length === 0) return null
  const sum = logs.reduce((s, l) => s + l.hours, 0)
  return Math.round((sum / logs.length) * 10) / 10
}

/** 수면의 질 분포 */
export function qualityCounts(logs: SleepLog[]): Record<SleepQuality, number> {
  return logs.reduce(
    (acc, l) => {
      acc[l.quality] = (acc[l.quality] ?? 0) + 1
      return acc
    },
    { 좋음: 0, 보통: 0, 나쁨: 0 } as Record<SleepQuality, number>
  )
}

export const QUALITY_EMOJI: Record<SleepQuality, string> = {
  좋음: '😊',
  보통: '😐',
  나쁨: '😞',
}

export const QUALITY_COLOR: Record<SleepQuality, string> = {
  좋음: '#5b8fd4',
  보통: '#ffa152',
  나쁨: '#f5604a',
}
