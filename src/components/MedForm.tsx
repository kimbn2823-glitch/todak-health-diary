import { useState } from 'react'
import { db } from '../db/db'
import { MEAL_RELATIONS, type MealRelation, type Medication } from '../types'
import { TIME_PRESETS, timeToMinutes } from '../lib/meds'
import { todayKey } from '../lib/dates'

interface Props {
  initial?: Medication | null
  onDone: () => void
  onCancel: () => void
}

// 약 추가·수정 폼
export default function MedForm({ initial, onDone, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dose, setDose] = useState(initial?.dose ?? '1정')
  const [times, setTimes] = useState<string[]>(initial?.times ?? ['08:00'])
  const [mealRelation, setMealRelation] = useState<MealRelation>(
    initial?.mealRelation ?? '식후'
  )
  const [memo, setMemo] = useState(initial?.memo ?? '')

  const canSave = name.trim().length > 0 && times.length > 0

  const sortTimes = (list: string[]) =>
    [...new Set(list)].sort((a, b) => timeToMinutes(a) - timeToMinutes(b))

  const addTime = () => setTimes((t) => sortTimes([...t, '12:00']))
  const updateTime = (i: number, v: string) =>
    setTimes((t) => t.map((x, idx) => (idx === i ? v : x)))
  const removeTime = (i: number) => setTimes((t) => t.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!canSave) return
    const payload: Omit<Medication, 'id'> = {
      name: name.trim(),
      dose: dose.trim() || '1정',
      times: sortTimes(times),
      mealRelation,
      memo: memo.trim() || undefined,
      active: initial?.active ?? true,
      createdAt: initial?.createdAt ?? Date.now(),
    }
    if (initial?.id != null) {
      const medId = initial.id
      const removed = initial.times.filter((t) => !payload.times.includes(t))
      await db.transaction('rw', db.meds, db.medLogs, async () => {
        await db.meds.update(medId, payload)
        // 삭제된 시각의 오늘·이후 복용 기록을 정리한다.
        // 남겨두면 같은 시각을 다시 추가했을 때 이미 복용한 것으로 표시된다.
        // (지난 날짜의 기록은 실제 복용 이력이므로 보존한다.)
        if (removed.length > 0) {
          const today = todayKey()
          await db.medLogs
            .where('medId')
            .equals(medId)
            .filter((l) => removed.includes(l.time) && l.date >= today)
            .delete()
        }
      })
    } else {
      await db.meds.add(payload as Medication)
    }
    onDone()
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="label">약 이름 *</label>
        <input
          autoFocus
          className="input"
          placeholder="예: 혈압약, 오메가3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="label">1회 복용량</label>
        <input
          className="input"
          placeholder="예: 1정, 5ml, 2캡슐"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
        />
      </div>

      <div>
        <label className="label">복용 시각 *</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {TIME_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setTimes(p.times)}
              className="chip bg-cream-200 text-brand-500 hover:bg-cream-300"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {times.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                className="input flex-1"
                value={t}
                onChange={(e) => updateTime(i, e.target.value)}
              />
              <button
                onClick={() => removeTime(i)}
                disabled={times.length === 1}
                className="rounded-xl bg-cream-200 px-3 py-2.5 text-sm text-brand-500 disabled:opacity-30"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addTime}
          className="mt-2 w-full rounded-xl border border-dashed border-brand-300 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
        >
          + 시각 추가
        </button>
      </div>

      <div>
        <label className="label">식사와의 관계</label>
        <div className="flex gap-2">
          {MEAL_RELATIONS.map((r) => (
            <button
              key={r}
              onClick={() => setMealRelation(r)}
              className={`btn flex-1 ${
                mealRelation === r ? 'bg-brand-800 text-white' : 'bg-cream-200 text-brand-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">메모 (선택)</label>
        <input
          className="input"
          placeholder="예: 물과 함께 복용"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-ghost flex-1">
          취소
        </button>
        <button onClick={save} disabled={!canSave} className="btn-primary flex-1">
          저장
        </button>
      </div>
    </div>
  )
}
