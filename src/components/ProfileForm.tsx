import { useEffect, useMemo, useState } from 'react'
import {
  ACTIVITY_LEVELS,
  type ActivityLevel,
  type Gender,
  type GoalType,
  type Profile,
} from '../types'
import { computeGoals } from '../lib/nutrition'
import { ACTIVITY_EMOJI, GOAL_EMOJI, GENDER_EMOJI } from '../lib/emoji'
import { clearDraft, loadDraft, saveDraft } from '../lib/persist'

interface Props {
  initial?: Profile | null
  submitLabel: string
  onSubmit: (p: Profile) => void
  /**
   * 지정하면 입력 중인 내용을 자동 임시저장한다.
   * 저장 버튼을 누르기 전에 창을 닫아도 다시 열었을 때 그대로 남아 있다.
   */
  draftKey?: string
}

const GENDERS: Gender[] = ['남성', '여성']
const GOALS: { key: GoalType; desc: string }[] = [
  { key: '감량', desc: '체중을 줄이고 싶어요 (-500kcal)' },
  { key: '유지', desc: '현재 체중을 유지할래요' },
  { key: '증량', desc: '근육·체중을 늘리고 싶어요 (+300kcal)' },
]

type FormState = {
  name: string
  gender: Gender
  age: number
  heightCm: number
  currentWeightKg: number
  targetWeightKg: number
  activityLevel: ActivityLevel
  goalType: GoalType
}

const baseForm = (initial?: Profile | null): FormState => ({
  name: initial?.name ?? '',
  gender: initial?.gender ?? '남성',
  age: initial?.age ?? 30,
  heightCm: initial?.heightCm ?? 170,
  currentWeightKg: initial?.currentWeightKg ?? 68,
  targetWeightKg: initial?.targetWeightKg ?? 63,
  activityLevel: initial?.activityLevel ?? '보통',
  goalType: initial?.goalType ?? '감량',
})

// 임시저장 값은 손상돼 있을 수 있으므로 타입이 맞는 항목만 받아들인다.
function mergeDraft(base: FormState, draft: unknown): FormState {
  if (typeof draft !== 'object' || draft === null) return base
  const d = draft as Record<string, unknown>
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback
  return {
    name: typeof d.name === 'string' ? d.name : base.name,
    gender: GENDERS.includes(d.gender as Gender) ? (d.gender as Gender) : base.gender,
    age: num(d.age, base.age),
    heightCm: num(d.heightCm, base.heightCm),
    currentWeightKg: num(d.currentWeightKg, base.currentWeightKg),
    targetWeightKg: num(d.targetWeightKg, base.targetWeightKg),
    activityLevel: ACTIVITY_LEVELS.some((a) => a.key === d.activityLevel)
      ? (d.activityLevel as ActivityLevel)
      : base.activityLevel,
    goalType: GOALS.some((g) => g.key === d.goalType)
      ? (d.goalType as GoalType)
      : base.goalType,
  }
}

// 온보딩·설정에서 공용으로 쓰는 프로필 입력 폼
export default function ProfileForm({ initial, submitLabel, onSubmit, draftKey }: Props) {
  const [form, setForm] = useState<FormState>(() => {
    const base = baseForm(initial)
    return draftKey ? mergeDraft(base, loadDraft(draftKey)) : base
  })

  // 값이 바뀔 때마다 임시저장 (입력 도중 앱이 닫혀도 남는다)
  useEffect(() => {
    if (draftKey) saveDraft(draftKey, form)
  }, [draftKey, form])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const goals = useMemo(
    () =>
      computeGoals({
        gender: form.gender,
        weightKg: form.currentWeightKg,
        heightCm: form.heightCm,
        age: form.age,
        activityLevel: form.activityLevel,
        goalType: form.goalType,
      }),
    [form]
  )

  const submit = () => {
    const profile: Profile = {
      ...initial,
      name: form.name.trim() || '사용자',
      gender: form.gender,
      age: Number(form.age) || 30,
      heightCm: Number(form.heightCm) || 170,
      currentWeightKg: Number(form.currentWeightKg) || 68,
      targetWeightKg: Number(form.targetWeightKg) || 63,
      activityLevel: form.activityLevel,
      goalType: form.goalType,
      targetKcal: goals.targetKcal,
      targetMacros: goals.targetMacros,
      onboarded: true,
    }
    // 정식 저장이 끝났으니 임시저장본은 지운다.
    if (draftKey) clearDraft(draftKey)
    onSubmit(profile)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="label">이름 (선택)</label>
        <input
          className="input"
          placeholder="닉네임"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">성별</label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => set('gender', g)}
                className={`btn flex-1 ${
                  form.gender === g ? 'bg-brand-800 text-white' : 'bg-cream-200 text-brand-600'
                }`}
              >
                {GENDER_EMOJI[g]} {g}
              </button>
            ))}
          </div>
        </div>
        <NumberField label="나이" value={form.age} onChange={(v) => set('age', v)} suffix="세" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NumberField label="키" value={form.heightCm} onChange={(v) => set('heightCm', v)} suffix="cm" />
        <NumberField
          label="현재 체중"
          value={form.currentWeightKg}
          onChange={(v) => set('currentWeightKg', v)}
          suffix="kg"
          step={0.1}
        />
        <NumberField
          label="목표 체중"
          value={form.targetWeightKg}
          onChange={(v) => set('targetWeightKg', v)}
          suffix="kg"
          step={0.1}
        />
      </div>

      <div>
        <label className="label">활동량</label>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((a) => (
            <button
              key={a.key}
              onClick={() => set('activityLevel', a.key)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                form.activityLevel === a.key
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-cream-300 hover:bg-cream-100'
              }`}
            >
              <span className="font-medium text-brand-700">{ACTIVITY_EMOJI[a.key]} {a.key}</span>
              <span className="text-xs text-brand-300">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">목표</label>
        <div className="space-y-2">
          {GOALS.map((g) => (
            <button
              key={g.key}
              onClick={() => set('goalType', g.key)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                form.goalType === g.key
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-cream-300 hover:bg-cream-100'
              }`}
            >
              <span className="font-medium text-brand-700">{GOAL_EMOJI[g.key]} {g.key}</span>
              <span className="text-xs text-brand-300">{g.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 계산된 목표 미리보기 */}
      <div className="rounded-2xl bg-brand-50 p-4">
        <p className="text-xs font-medium text-brand-700">🎯 자동 계산된 하루 목표</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-brand-700">{goals.targetKcal}</span>
          <span className="text-sm text-brand-600">kcal</span>
        </div>
        <div className="mt-1 text-xs text-brand-600">
          탄수화물 {goals.targetMacros.carbs}g · 단백질 {goals.targetMacros.protein}g · 지방{' '}
          {goals.targetMacros.fat}g
        </div>
        <p className="mt-2 text-[11px] text-brand-500/80">
          기초대사량 {goals.bmr} · 활동대사량 {goals.tdee} kcal 기준
        </p>
      </div>

      <button onClick={submit} className="btn-primary w-full py-3 text-base">
        {submitLabel}
      </button>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  step?: number
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type="number"
          step={step}
          min={0}
          className="input pr-9"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-300">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
