import { useMemo, useState } from 'react'
import type { Profile } from '../types'
import { computeGoals, calcMacroTargets } from '../lib/nutrition'
import { computeGoalPlan } from '../lib/weightLoss'
import { todayKey, shiftDay, formatKorean } from '../lib/dates'
import { ArtTrophy } from './HealthArt'

interface Props {
  profile: Profile
  /** 최신 체중 (체중 기록이 있으면 그 값) */
  currentWeight: number
  onSave: (p: Profile) => void
  onCancel: () => void
}

// 감량 목표(목표 체중 + 목표 날짜)를 설정하고
// 필요한 감량 속도·목표 칼로리를 역산해 보여준다.
export default function GoalForm({ profile, currentWeight, onSave, onCancel }: Props) {
  const [targetWeight, setTargetWeight] = useState(profile.targetWeightKg)
  const [targetDate, setTargetDate] = useState(
    profile.targetDate ?? shiftDay(todayKey(), 84) // 기본 12주 뒤
  )

  const { tdee } = useMemo(
    () =>
      computeGoals({
        gender: profile.gender,
        weightKg: currentWeight,
        heightCm: profile.heightCm,
        age: profile.age,
        activityLevel: profile.activityLevel,
        goalType: profile.goalType,
      }),
    [profile, currentWeight]
  )

  const plan = useMemo(
    () =>
      computeGoalPlan({
        currentWeight,
        targetWeight,
        targetDate,
        heightCm: profile.heightCm,
        tdee,
      }),
    [currentWeight, targetWeight, targetDate, profile.heightCm, tdee]
  )

  const tone =
    plan.verdict === 'ok'
      ? { box: 'bg-ocean-50', text: 'text-ocean-600' }
      : plan.verdict === 'impossible' || plan.verdict === 'invalid'
        ? { box: 'bg-coral-50', text: 'text-coral-600' }
        : { box: 'bg-mango-100', text: 'text-mango-600' }

  const blocked = plan.verdict === 'invalid'

  const save = () => {
    if (blocked) return
    onSave({
      ...profile,
      goalType: '감량',
      targetWeightKg: targetWeight,
      targetDate,
      targetKcal: plan.targetKcal,
      targetMacros: calcMacroTargets(plan.targetKcal, '감량'),
    })
  }

  const [hMin, hMax] = plan.healthyRange

  return (
    <div className="space-y-5">
      {/* 현재 → 목표 */}
      <div className="flex items-center justify-between rounded-2xl bg-cream-200 p-4">
        <div className="text-center">
          <p className="text-xs text-brand-400">현재</p>
          <p className="text-xl font-bold text-brand-800">{currentWeight}kg</p>
        </div>
        <div className="text-center">
          <p className="text-lg text-brand-300">→</p>
          {plan.deltaKg > 0 && (
            <p className="text-xs font-bold text-coral-600">-{plan.deltaKg.toFixed(1)}kg</p>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-brand-400">목표</p>
          <p className="text-xl font-bold text-ocean-600">{targetWeight}kg</p>
        </div>
      </div>

      {/* 목표 체중 */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label className="label mb-0">목표 체중</label>
          <span className="text-xs text-brand-300">
            정상 체중 {hMin}~{hMax}kg
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={Math.max(35, Math.round(hMin - 8))}
            max={Math.round(currentWeight)}
            step={0.5}
            value={targetWeight}
            onChange={(e) => setTargetWeight(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-cream-300 accent-ocean-500"
          />
          <div className="relative w-24">
            <input
              type="number"
              step={0.1}
              className="input pr-8 text-center"
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value) || 0)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-300">
              kg
            </span>
          </div>
        </div>
        {plan.targetBelowHealthy && (
          <p className="mt-2 text-xs text-coral-600">
            목표가 정상 체중 범위({hMin}kg)보다 낮아요. 저체중은 건강에 좋지 않으니 다시 생각해
            보세요.
          </p>
        )}
      </div>

      {/* 목표 날짜 */}
      <div>
        <label className="label">목표 날짜</label>
        <input
          type="date"
          className="input"
          min={shiftDay(todayKey(), 1)}
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { label: '4주', days: 28 },
            { label: '8주', days: 56 },
            { label: '12주', days: 84 },
            { label: '6개월', days: 182 },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => setTargetDate(shiftDay(todayKey(), p.days))}
              className={`chip ${
                targetDate === shiftDay(todayKey(), p.days)
                  ? 'bg-brand-800 text-white'
                  : 'bg-cream-200 text-brand-500 hover:bg-cream-300'
              }`}
            >
              {p.label} 뒤
            </button>
          ))}
        </div>
      </div>

      {/* 실현 가능성 판정 */}
      <div className={`rounded-2xl p-4 ${tone.box}`}>
        <div className="flex items-start gap-2.5">
          <ArtTrophy size={28} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className={`text-sm font-bold ${tone.text}`}>
              {plan.verdict === 'ok'
                ? '건강한 목표예요'
                : plan.verdict === 'aggressive'
                  ? '조금 빠듯한 목표예요'
                  : plan.verdict === 'impossible'
                    ? '무리한 목표예요'
                    : plan.verdict === 'slow'
                      ? '아주 여유로운 목표예요'
                      : '목표를 확인해 주세요'}
            </p>
            <p className={`mt-1 text-xs leading-relaxed ${tone.text}`}>{plan.message}</p>
          </div>
        </div>

        {!blocked && plan.deltaKg > 0.05 && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/60 pt-3">
            <div>
              <p className="text-[11px] text-brand-400">하루 목표 칼로리</p>
              <p className="text-lg font-bold text-brand-800">{plan.targetKcal}</p>
            </div>
            <div>
              <p className="text-[11px] text-brand-400">하루 적자</p>
              <p className="text-lg font-bold text-brand-800">-{plan.dailyDeficit}</p>
            </div>
          </div>
        )}

        {plan.suggestedDate && plan.verdict === 'impossible' && (
          <button
            onClick={() => setTargetDate(plan.suggestedDate!)}
            className="mt-3 w-full rounded-xl bg-white py-2 text-xs font-bold text-brand-700"
          >
            {formatKorean(plan.suggestedDate)}로 바꾸기 (주 0.5kg)
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-ghost flex-1">
          취소
        </button>
        <button onClick={save} disabled={blocked} className="btn-primary flex-1">
          목표 저장
        </button>
      </div>
    </div>
  )
}
