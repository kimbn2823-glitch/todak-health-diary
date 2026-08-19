import type { RewardClaim } from '../types'

// 뱃지 개수 마일스톤 보상 — 스스로에게 주는 선물 쿠폰
export interface Reward {
  id: string
  need: number // 필요한 뱃지 개수
  emoji: string
  label: string
  desc: string
}

export const REWARDS: Reward[] = [
  {
    id: 'coffee',
    need: 3,
    emoji: '☕',
    label: '커피 한 잔',
    desc: '좋아하는 카페에서 아메리카노 한 잔!',
  },
  {
    id: 'dessert',
    need: 6,
    emoji: '🍰',
    label: '디저트 타임',
    desc: '오늘만큼은 달콤한 디저트 허용!',
  },
  {
    id: 'cheatday',
    need: 10,
    emoji: '🍗',
    label: '치팅데이 한 끼',
    desc: '칼로리 걱정 없이 먹고 싶던 그 메뉴!',
  },
  {
    id: 'special',
    need: 12,
    emoji: '🎁',
    label: '특별 선물',
    desc: '모든 뱃지 달성! 갖고 싶던 것 하나 선물하세요',
  },
]

export type RewardState = '잠김' | '사용가능' | '사용완료'

export function rewardState(
  reward: Reward,
  earnedBadges: number,
  claims: RewardClaim[]
): RewardState {
  if (claims.some((c) => c.rewardId === reward.id)) return '사용완료'
  return earnedBadges >= reward.need ? '사용가능' : '잠김'
}
