import { useState } from 'react'
import { db } from '../db/db'
import { FOOD_CATEGORIES, type Food, type FoodCategory } from '../types'

interface Props {
  onCreated: (food: Food) => void
  onCancel: () => void
}

// 목록에 없는 음식을 사용자가 직접 등록
export default function CustomFoodForm({ onCreated, onCancel }: Props) {
  const [form, setForm] = useState({
    name: '',
    category: '기타' as FoodCategory,
    unit: '1인분',
    servingSize: 100,
    kcal: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    sodium: 0,
  })

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  const canSave = form.name.trim().length > 0 && form.kcal > 0

  const save = async () => {
    if (!canSave) return
    const food: Food = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit.trim() || '1인분',
      servingSize: Number(form.servingSize) || 100,
      kcal: Number(form.kcal) || 0,
      carbs: Number(form.carbs) || 0,
      protein: Number(form.protein) || 0,
      fat: Number(form.fat) || 0,
      sodium: Number(form.sodium) || 0,
      isCustom: true,
    }
    const id = await db.foods.add(food)
    onCreated({ ...food, id })
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
      <div>
        <label className="label">음식 이름 *</label>
        <input
          className="input"
          placeholder="예: 엄마표 미역국"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">분류</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => set('category', e.target.value as FoodCategory)}
          >
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">1회 제공 단위</label>
          <input
            className="input"
            placeholder="예: 1그릇"
            value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl bg-cream-100 p-4">
        <p className="mb-3 text-xs text-brand-300">1회 제공량 기준 영양성분을 입력하세요.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="제공량(g)" value={form.servingSize} onChange={(v) => set('servingSize', v)} />
          <Field label="칼로리(kcal) *" value={form.kcal} onChange={(v) => set('kcal', v)} />
          <Field label="탄수화물(g)" value={form.carbs} onChange={(v) => set('carbs', v)} />
          <Field label="단백질(g)" value={form.protein} onChange={(v) => set('protein', v)} />
          <Field label="지방(g)" value={form.fat} onChange={(v) => set('fat', v)} />
          <Field label="나트륨(mg)" value={form.sodium} onChange={(v) => set('sodium', v)} />
        </div>
      </div>

      <div className="flex gap-2 pb-2">
        <button onClick={onCancel} className="btn-ghost flex-1">
          취소
        </button>
        <button onClick={save} disabled={!canSave} className="btn-primary flex-1">
          등록하고 선택
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-400">{label}</label>
      <input
        type="number"
        min={0}
        className="input py-2"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  )
}
