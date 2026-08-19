import type { WeightPlan } from '../lib/weightLoss'
import { formatKorean } from '../lib/dates'
import { ArtTrophy, ArtScale } from './HealthArt'
import Character from './Character'

interface Props {
  plan: WeightPlan
  targetDate?: string
  onEditGoal: () => void
}

// 감량 진행 상황 + 속도 코칭
export default function WeightPlanCard({ plan, targetDate, onEditGoal }: Props) {
  const tone =
    plan.assessment.tone === 'good'
      ? { box: 'bg-ocean-50', text: 'text-ocean-600' }
      : plan.assessment.tone === 'warn'
        ? { box: 'bg-coral-50', text: 'text-coral-600' }
        : { box: 'bg-cream-200', text: 'text-brand-500' }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <ArtTrophy size={26} />
          <p className="text-sm font-bold text-brand-800">감량 목표</p>
        </div>
        <button onClick={onEditGoal} className="text-xs font-semibold text-brand-600">
          목표 수정
        </button>
      </div>

      {plan.reached ? (
        <div className="flex flex-col items-center py-4 text-center">
          <Character name="celebrate" size={120} />
          <p className="mt-2 font-bold text-ocean-600">목표 체중에 도달했어요! 🎉</p>
          <p className="mt-1 text-xs text-brand-400">
            이제 유지가 중요해요. 목표를 새로 잡아도 좋아요.
          </p>
        </div>
      ) : (
        <>
          {/* 진행 바 */}
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="text-brand-400">시작 {plan.start}kg</span>
            <span className="font-bold text-ocean-600">{Math.round(plan.percent)}%</span>
            <span className="text-brand-400">목표 {plan.target}kg</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-ocean-500 transition-all duration-700"
              style={{ width: `${plan.percent}%` }}
            />
          </div>

          {/* 수치 요약 */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Metric
              label="감량"
              value={plan.lostKg > 0 ? `-${plan.lostKg.toFixed(1)}` : plan.lostKg.toFixed(1)}
              unit="kg"
              highlight={plan.lostKg > 0}
            />
            <Metric label="남은 목표" value={plan.remainingKg.toFixed(1)} unit="kg" />
            <Metric
              label="주간 속도"
              value={
                plan.actualPace !== null
                  ? `${plan.actualPace > 0 ? '+' : ''}${plan.actualPace.toFixed(1)}`
                  : '—'
              }
              unit="kg"
            />
          </div>

          {/* 도달 예상 */}
          {plan.etaDate && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-cream-100 p-3.5">
              <ArtScale size={26} className="shrink-0" />
              <p className="text-xs leading-relaxed text-brand-600">
                지금 속도라면{' '}
                <span className="font-bold text-brand-800">{formatKorean(plan.etaDate)}</span>쯤
                목표에 도달해요
                {plan.etaWeeks != null && ` (약 ${Math.round(plan.etaWeeks)}주)`}.
                {targetDate && (
                  <>
                    <br />
                    <span className="text-brand-400">
                      설정한 목표일은 {formatKorean(targetDate)}
                      {plan.etaDate > targetDate ? ' — 조금 더 분발해야 해요.' : ' — 앞당겨지고 있어요!'}
                    </span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* 속도 코칭 */}
          <div className={`mt-2.5 rounded-2xl p-3.5 ${tone.box}`}>
            <p className={`text-xs font-bold ${tone.text}`}>{plan.assessment.label}</p>
            <p className={`mt-1 text-xs leading-relaxed ${tone.text}`}>
              {plan.assessment.advice}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  unit,
  highlight,
}: {
  label: string
  value: string
  unit: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl bg-cream-100 py-3">
      <p className="text-[11px] text-brand-400">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${highlight ? 'text-ocean-600' : 'text-brand-800'}`}>
        {value}
        <span className="text-xs font-normal text-brand-300"> {unit}</span>
      </p>
    </div>
  )
}
