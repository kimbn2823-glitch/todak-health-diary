interface Props {
  consumed: number
  target: number
  size?: number
}

// 오늘 섭취 칼로리 대비 목표를 나타내는 원형 진행 표시
export default function CalorieRing({ consumed, target, size = 176 }: Props) {
  const stroke = 15
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const pct = target > 0 ? Math.min(1, consumed / target) : 0
  const over = consumed > target
  const remaining = Math.max(0, target - consumed)
  const dash = circ * pct

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3d57a0" />
            <stop offset="100%" stopColor="#5b8fd4" />
          </linearGradient>
          <linearGradient id="ringGradOver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5604a" />
            <stop offset="100%" stopColor="#ffa152" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f7ece1"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? 'url(#ringGradOver)' : 'url(#ringGrad)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold tabular-nums text-brand-800">
          {Math.round(consumed)}
        </span>
        <span className="text-xs text-brand-300">/ {Math.round(target)} kcal</span>
        <span
          className={`mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            over ? 'bg-coral-100 text-coral-600' : 'bg-brand-50 text-brand-600'
          }`}
        >
          {over ? `${Math.round(consumed - target)} 초과` : `${Math.round(remaining)} 남음`}
        </span>
      </div>
    </div>
  )
}
