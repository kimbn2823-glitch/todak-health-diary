// 건강 테마 플랫 일러스트 세트
// 스타일: 굵은 딥네이비 외곽선 + 코랄/화이트/시안 면채움 (둥근 마감)

const INK = '#14395e'
const CORAL = '#f4756e'
const CORAL_D = '#e05f58'
const WHITE = '#ffffff'
const OCEAN = '#1a8fc7'
const OCEAN_D = '#12658f'
const MANGO = '#ffb257'
const LEAF = '#5cba7d'

export interface ArtProps {
  size?: number
  className?: string
}

// 공통 SVG 래퍼
function Art({
  size = 48,
  className = '',
  children,
}: ArtProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** 심박 하트 — 코랄 하트 안에 흰 심전도 라인 */
export function ArtHeartPulse(p: ArtProps) {
  return (
    <Art {...p}>
      <path
        d="M24 41C24 41 7 30.5 7 19.8 7 14.4 11.4 10 16.8 10c3 0 5.6 1.4 7.2 3.6C25.6 11.4 28.2 10 31.2 10 36.6 10 41 14.4 41 19.8 41 30.5 24 41 24 41Z"
        fill={CORAL}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M12 23h5.5l3-6.5 4.5 13 3-6.5H36" stroke={WHITE} strokeWidth="3" />
    </Art>
  )
}

/** 알약 캡슐 — 흰색/코랄 반반, 대각선 배치 */
export function ArtPill(p: ArtProps) {
  return (
    <Art {...p}>
      <g transform="rotate(-45 24 24)">
        <path
          d="M15 16h18a8 8 0 0 1 0 16H15a8 8 0 0 1 0-16Z"
          fill={WHITE}
          stroke={INK}
          strokeWidth="3"
        />
        <path d="M24 16h9a8 8 0 0 1 0 16h-9Z" fill={CORAL} stroke={INK} strokeWidth="3" />
      </g>
    </Art>
  )
}

/** 스마트워치 — 화면 안에 코랄 하트 */
export function ArtWatch(p: ArtProps) {
  return (
    <Art {...p}>
      <rect x="16" y="5" width="16" height="9" rx="2.5" fill={OCEAN} stroke={INK} strokeWidth="3" />
      <rect x="16" y="34" width="16" height="9" rx="2.5" fill={OCEAN} stroke={INK} strokeWidth="3" />
      <rect x="9" y="12" width="30" height="24" rx="7" fill={OCEAN_D} stroke={INK} strokeWidth="3" />
      <path
        d="M24 30c0 0-7-4.3-7-8.7 0-2.2 1.8-4 4-4 1.2 0 2.3.6 3 1.5.7-.9 1.8-1.5 3-1.5 2.2 0 4 1.8 4 4C31 25.7 24 30 24 30Z"
        fill={CORAL}
      />
      <path d="M41 20v6" stroke={INK} strokeWidth="3" />
    </Art>
  )
}

/** 약병 — 복약 관리 */
export function ArtPillBottle(p: ArtProps) {
  return (
    <Art {...p}>
      <rect x="14" y="5" width="20" height="8" rx="2.5" fill={OCEAN} stroke={INK} strokeWidth="3" />
      <path
        d="M12 15c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v24a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V15Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M24 22v10M19 27h10" stroke={CORAL} strokeWidth="4" />
    </Art>
  )
}

/** 알림 벨 — 복용 알림 */
export function ArtBell(p: ArtProps) {
  return (
    <Art {...p}>
      <path
        d="M24 6c-6.6 0-12 5.4-12 12v8l-3 6h30l-3-6v-8c0-6.6-5.4-12-12-12Z"
        fill={MANGO}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M19 32a5 5 0 0 0 10 0" fill={CORAL} stroke={INK} strokeWidth="3" />
      <path d="M24 6V3" stroke={INK} strokeWidth="3" />
    </Art>
  )
}

/** 물방울 — 수분 섭취 */
export function ArtDroplet(p: ArtProps) {
  return (
    <Art {...p}>
      <path
        d="M24 6c0 0 12 13.2 12 20.6C36 33.6 30.6 39 24 39s-12-5.4-12-12.4C12 19.2 24 6 24 6Z"
        fill={OCEAN}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M18 27c0 3.3 2.7 6 6 6" stroke={WHITE} strokeWidth="3" />
    </Art>
  )
}

/** 샐러드 그릇 — 건강한 식단 */
export function ArtSalad(p: ArtProps) {
  return (
    <Art {...p}>
      <circle cx="17" cy="20" r="6" fill={LEAF} stroke={INK} strokeWidth="3" />
      <circle cx="30" cy="19" r="5.5" fill={CORAL} stroke={INK} strokeWidth="3" />
      <circle cx="24" cy="24" r="4.5" fill={MANGO} stroke={INK} strokeWidth="3" />
      <path
        d="M7 26h34c0 7.7-6.3 14-14 14h-6c-7.7 0-14-6.3-14-14Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M14 32h20" stroke={INK} strokeWidth="2.5" opacity="0.35" />
    </Art>
  )
}

/** 체중계 */
export function ArtScale(p: ArtProps) {
  return (
    <Art {...p}>
      <rect x="6" y="11" width="36" height="28" rx="7" fill={OCEAN} stroke={INK} strokeWidth="3" />
      <rect x="15" y="18" width="18" height="11" rx="3.5" fill={WHITE} stroke={INK} strokeWidth="3" />
      <path d="M24 27l3.5-5.5" stroke={CORAL_D} strokeWidth="3" />
      <path d="M19 33h10" stroke={INK} strokeWidth="2.5" opacity="0.4" />
    </Art>
  )
}

/** 덤벨 — 운동 */
export function ArtDumbbell(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M16 24h16" stroke={INK} strokeWidth="4" />
      <rect x="6" y="16" width="10" height="16" rx="3.5" fill={CORAL} stroke={INK} strokeWidth="3" />
      <rect x="32" y="16" width="10" height="16" rx="3.5" fill={CORAL} stroke={INK} strokeWidth="3" />
      <path d="M3 20v8M45 20v8" stroke={INK} strokeWidth="3" />
    </Art>
  )
}

/** 사과 — 과일·간식 */
export function ArtApple(p: ArtProps) {
  return (
    <Art {...p}>
      <path
        d="M24 14c-2-2-6-3-9-1-4 2.6-4.6 9-2.2 15.2C14.6 33.6 18 40 22 40c1.2 0 2-.6 2-.6s.8.6 2 .6c4 0 7.4-6.4 9.2-11.8C37.6 22 37 15.6 33 13c-3-2-7-1-9 1Z"
        fill={CORAL}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M24 14V8" stroke={INK} strokeWidth="3" />
      <path d="M24 10c3-4 8-4 8-4s0 5-4 6c-2 .5-4-2-4-2Z" fill={LEAF} stroke={INK} strokeWidth="3" />
    </Art>
  )
}

/** 초승달 — 수면·휴식 */
export function ArtMoon(p: ArtProps) {
  return (
    <Art {...p}>
      <path
        d="M32 28.5C22.9 28.5 15.5 21.1 15.5 12c0-1.6.2-3.1.6-4.5C9.4 10 5 16.4 5 23.8 5 33.3 12.7 41 22.2 41c7.4 0 13.8-4.7 16.3-11.2-1.4.4-2.9.7-4.5.7Z"
        fill={OCEAN}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M34 8l1.4 3.6L39 13l-3.6 1.4L34 18l-1.4-3.6L29 13l3.6-1.4Z" fill={MANGO} stroke={INK} strokeWidth="2.5" />
    </Art>
  )
}

/** 트로피 — 목표 달성 */
export function ArtTrophy(p: ArtProps) {
  return (
    <Art {...p}>
      <path
        d="M14 8h20v10c0 5.5-4.5 10-10 10s-10-4.5-10-10V8Z"
        fill={MANGO}
        stroke={INK}
        strokeWidth="3"
      />
      <path d="M14 11H9v3c0 3.3 2.7 6 6 6M34 11h5v3c0 3.3-2.7 6-6 6" stroke={INK} strokeWidth="3" />
      <path d="M24 28v6" stroke={INK} strokeWidth="3" />
      <path d="M16 40h16" stroke={INK} strokeWidth="3" />
      <rect x="18" y="34" width="12" height="6" rx="2" fill={CORAL} stroke={INK} strokeWidth="3" />
    </Art>
  )
}

/** 클립보드 — 기록 없음(빈 상태) */
export function ArtClipboard(p: ArtProps) {
  return (
    <Art {...p}>
      <rect x="9" y="8" width="30" height="34" rx="5" fill={WHITE} stroke={INK} strokeWidth="3" />
      <rect x="17" y="4" width="14" height="8" rx="3" fill={OCEAN} stroke={INK} strokeWidth="3" />
      <path d="M16 22h16M16 29h11" stroke={INK} strokeWidth="3" opacity="0.5" />
      <path
        d="M31 33c0 0-5-3.1-5-6.3 0-1.6 1.3-2.9 2.9-2.9.9 0 1.7.4 2.1 1.1.5-.7 1.3-1.1 2.1-1.1 1.6 0 2.9 1.3 2.9 2.9C36 29.9 31 33 31 33Z"
        fill={CORAL}
        stroke={INK}
        strokeWidth="2.5"
      />
    </Art>
  )
}

/** 차트 — 리포트 빈 상태 */
export function ArtChart(p: ArtProps) {
  return (
    <Art {...p}>
      <rect x="6" y="8" width="36" height="32" rx="6" fill={WHITE} stroke={INK} strokeWidth="3" />
      <rect x="13" y="24" width="6" height="10" rx="2" fill={OCEAN} stroke={INK} strokeWidth="2.5" />
      <rect x="21" y="18" width="6" height="16" rx="2" fill={CORAL} stroke={INK} strokeWidth="2.5" />
      <rect x="29" y="21" width="6" height="13" rx="2" fill={MANGO} stroke={INK} strokeWidth="2.5" />
    </Art>
  )
}

// 끼니 아이콘 (아침/점심/저녁/간식)
export function ArtSunrise(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M6 34h36" stroke={INK} strokeWidth="3" />
      <path d="M14 34a10 10 0 0 1 20 0Z" fill={MANGO} stroke={INK} strokeWidth="3" />
      <path d="M24 10v5M11 16l3 3M37 16l-3 3M4 27h4M40 27h4" stroke={INK} strokeWidth="3" />
    </Art>
  )
}

export function ArtSun(p: ArtProps) {
  return (
    <Art {...p}>
      <circle cx="24" cy="24" r="9" fill={MANGO} stroke={INK} strokeWidth="3" />
      <path
        d="M24 6v4M24 38v4M6 24h4M38 24h4M11 11l3 3M34 34l3 3M37 11l-3 3M14 34l-3 3"
        stroke={INK}
        strokeWidth="3"
      />
    </Art>
  )
}

export function ArtNightMeal(p: ArtProps) {
  return (
    <Art {...p}>
      <path
        d="M30 26c-6.6 0-12-5.4-12-12 0-1.3.2-2.5.6-3.6C13 12.3 9 17.4 9 23.4 9 31 15.3 37.2 23 37.2c6 0 11.2-3.8 13.2-9.2-1.9.6-4 .8-6.2 0Z"
        fill={OCEAN}
        stroke={INK}
        strokeWidth="3"
      />
      <circle cx="35" cy="12" r="2.5" fill={MANGO} stroke={INK} strokeWidth="2.5" />
    </Art>
  )
}

export function ArtSnack(p: ArtProps) {
  return (
    <Art {...p}>
      <circle cx="24" cy="24" r="15" fill={MANGO} stroke={INK} strokeWidth="3" />
      <circle cx="19" cy="19" r="2.5" fill={INK} />
      <circle cx="29" cy="22" r="2.5" fill={INK} />
      <circle cx="21" cy="30" r="2.5" fill={INK} />
      <circle cx="30" cy="31" r="2" fill={INK} />
    </Art>
  )
}
