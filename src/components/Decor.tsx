// 배너의 심전도 라인·하트 모티프를 재사용 가능한 장식 요소로 정리

interface HeartbeatProps {
  className?: string
  color?: string
  opacity?: number
}

// 심전도(EKG) 라인
export function Heartbeat({
  className = '',
  color = '#ff7d63',
  opacity = 0.5,
}: HeartbeatProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 40"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 20h38l8-13 9 26 8-19 7 6h30l8-13 9 26 8-19 7 6h30l8-13 9 26 8-19 7 6h31"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </svg>
  )
}

interface HeartProps {
  className?: string
  color?: string
  size?: number
}

// 둥근 하트
export function Heart({ className = '', color = '#ff7d63', size = 20 }: HeartProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3 5 6.4 5c2 0 3.4 1.1 4.3 2.3l1.3 1.7 1.3-1.7C14.2 6.1 15.6 5 17.6 5 21 5 23 8.3 21.5 11.8 19.5 16.4 12 21 12 21Z" />
    </svg>
  )
}

// 반짝임(별) — 배너의 스파클 요소
export function Sparkle({ className = '', color = '#ffc98a', size = 14 }: HeartProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M12 2c.5 4.8 2.7 7 7.5 7.5C14.7 10 12.5 12.2 12 17c-.5-4.8-2.7-7-7.5-7.5C9.3 9 11.5 6.8 12 2Z" />
    </svg>
  )
}
