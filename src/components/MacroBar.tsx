// 배너 팔레트에 맞춘 영양소 색상
export const MACRO_COLORS = {
  carbs: '#ffa152', // 오렌지
  protein: '#5b8fd4', // 하늘색
  fat: '#ff7d63', // 코랄
  over: '#e24a34',
} as const

interface MacroBarProps {
  label: string
  consumed: number
  target: number
  color: string
  unit?: string
}

// 단일 영양소(탄/단/지) 진행 막대
export function MacroBar({ label, consumed, target, color, unit = 'g' }: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0
  const over = consumed > target && target > 0
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-brand-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="tabular-nums text-brand-300">
          <span className={over ? 'font-bold text-coral-600' : 'font-bold text-brand-700'}>
            {Math.round(consumed)}
          </span>{' '}
          / {Math.round(target)}
          {unit}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: over ? MACRO_COLORS.over : color }}
        />
      </div>
    </div>
  )
}

interface MacroGroupProps {
  carbs: [number, number]
  protein: [number, number]
  fat: [number, number]
}

export function MacroGroup({ carbs, protein, fat }: MacroGroupProps) {
  return (
    <div className="space-y-3.5">
      <MacroBar label="탄수화물" consumed={carbs[0]} target={carbs[1]} color={MACRO_COLORS.carbs} />
      <MacroBar
        label="단백질"
        consumed={protein[0]}
        target={protein[1]}
        color={MACRO_COLORS.protein}
      />
      <MacroBar label="지방" consumed={fat[0]} target={fat[1]} color={MACRO_COLORS.fat} />
    </div>
  )
}
