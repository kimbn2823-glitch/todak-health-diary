import type { BpLog } from '../types'

// 혈압 분류 — 대한고혈압학회 기준
export interface BpCategory {
  label: string
  emoji: string
  /** 배지 색상 클래스 */
  chip: string
  advice: string
}

export function classifyBp(systolic: number, diastolic: number): BpCategory {
  if (systolic < 90 || diastolic < 60) {
    return {
      label: '저혈압',
      emoji: '🥶',
      chip: 'bg-sky2-100 text-sky2-600',
      advice: '어지럼증이 있다면 천천히 일어나고, 수분을 충분히 드세요.',
    }
  }
  if (systolic < 120 && diastolic < 80) {
    return {
      label: '정상',
      emoji: '😊',
      chip: 'bg-ocean-50 text-ocean-600',
      advice: '좋아요! 지금 생활 습관을 유지해 보세요.',
    }
  }
  if (systolic < 130 && diastolic < 80) {
    return {
      label: '주의혈압',
      emoji: '🙂',
      chip: 'bg-cream-200 text-brand-600',
      advice: '아직 괜찮지만 짠 음식을 줄이고 가볍게 운동해 보세요.',
    }
  }
  if (systolic < 140 || diastolic < 90) {
    return {
      label: '고혈압 전단계',
      emoji: '😐',
      chip: 'bg-mango-100 text-mango-600',
      advice: '식단·운동 관리가 필요한 단계예요. 꾸준히 측정해 보세요.',
    }
  }
  if (systolic < 160 || diastolic < 100) {
    return {
      label: '고혈압 1기',
      emoji: '😟',
      chip: 'bg-coral-50 text-coral-600',
      advice: '반복해서 이 수치가 나오면 병원 상담을 권해요.',
    }
  }
  return {
    label: '고혈압 2기',
    emoji: '🚨',
    chip: 'bg-coral-100 text-coral-700',
    advice: '높은 수치예요. 가까운 시일 내 진료를 받아보세요.',
  }
}

/** 최신 기록 (가장 최근 측정) */
export function latestBp(logs: BpLog[]): BpLog | undefined {
  if (logs.length === 0) return undefined
  return [...logs].sort((a, b) => b.createdAt - a.createdAt)[0]
}

/**
 * 워치 동기화 데모 — 실제 워치 연동은 웹에서 불가능하므로
 * 그럴듯한 안정 범위의 측정값을 만들어 채워준다. (반드시 '데모'로 표시)
 */
export function simulateWatchReading(): { systolic: number; diastolic: number; pulse: number } {
  const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min))
  const systolic = rand(104, 134)
  return {
    systolic,
    // 이완기는 수축기와 어느 정도 상관되게
    diastolic: Math.min(89, rand(62, 84)),
    pulse: rand(58, 92),
  }
}
