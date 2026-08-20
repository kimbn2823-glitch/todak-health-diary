import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { FOOD_CATEGORIES, type Food, type FoodCategory } from '../types'
import { CATEGORY_EMOJI } from '../lib/emoji'
import CustomFoodForm from './CustomFoodForm'

interface Props {
  onPick: (food: Food, servings: number) => void
  onClose: () => void
}

// 음식 검색 → 섭취량 선택 → 추가. 커스텀 음식 등록도 지원.
export default function FoodSearch({ onPick, onClose }: Props) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('전체')
  const [selected, setSelected] = useState<Food | null>(null)
  const [servings, setServings] = useState(1)
  const [showCustom, setShowCustom] = useState(false)

  const foods = useLiveQuery(() => db.foods.toArray(), [], [] as Food[])

  const filtered = useMemo(() => {
    const term = q.trim()
    return (foods ?? [])
      .filter((f) => (category === '전체' ? true : f.category === category))
      .filter((f) => (term ? f.name.includes(term) : true))
      .sort((a, b) => {
        // 커스텀 음식 우선, 그다음 이름순
        if (a.isCustom !== b.isCustom) return a.isCustom ? -1 : 1
        return a.name.localeCompare(b.name, 'ko')
      })
      .slice(0, 60)
  }, [foods, q, category])

  const confirm = () => {
    if (!selected) return
    onPick(selected, servings)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="h-sheet flex w-full max-w-lg flex-col rounded-t-3xl bg-white sm:rounded-3xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <h3 className="text-base font-bold text-brand-800">음식 검색</h3>
          <button onClick={onClose} className="text-sm text-brand-300 hover:text-brand-600">
            닫기
          </button>
        </div>

        {showCustom ? (
          <CustomFoodForm
            onCreated={(food) => {
              setShowCustom(false)
              setSelected(food)
              setServings(1)
              // 검색어·분류를 초기화한다. 안 그러면 «베트남»으로 검색하다가
              // «쌀국수»를 등록했을 때 목록이 여전히 «베트남»으로 걸러져
              // 방금 등록한 음식이 안 보인다 (직접 등록한 음식이 맨 위로 온다).
              setQ('')
              setCategory('전체')
            }}
            onCancel={() => setShowCustom(false)}
          />
        ) : (
          <>
            {/* 검색 */}
            <div className="space-y-3 px-5 py-3">
              <input
                autoFocus
                className="input"
                placeholder="음식 이름을 검색하세요 (예: 김치찌개)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['전체', ...FOOD_CATEGORIES].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`chip whitespace-nowrap ${
                      category === c
                        ? 'bg-brand-800 text-white'
                        : 'bg-cream-200 text-brand-400 hover:bg-cream-300'
                    }`}
                  >
                    {c === '전체' ? '🍱 전체' : `${CATEGORY_EMOJI[c as FoodCategory]} ${c}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 목록 */}
            <div className="flex-1 overflow-y-auto px-5">
              <button
                onClick={() => setShowCustom(true)}
                className="mb-2 w-full rounded-xl border border-dashed border-brand-300 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                + 목록에 없는 음식 직접 추가
              </button>
              <ul className="divide-y divide-cream-200">
                {filtered.map((f) => (
                  <li key={f.id}>
                    <button
                      onClick={() => {
                        setSelected(f)
                        setServings(1)
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-3 text-left transition ${
                        selected?.id === f.id ? 'bg-brand-50' : 'hover:bg-cream-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{CATEGORY_EMOJI[f.category]}</span>
                          <span className="font-medium text-brand-800">{f.name}</span>
                          {f.isCustom && (
                            <span className="chip bg-mango-100 text-mango-600">직접</span>
                          )}
                        </div>
                        <div className="text-xs text-brand-300">
                          {f.category} · {f.unit} ({f.servingSize}g)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand-700">{f.kcal} kcal</div>
                        <div className="text-xs text-brand-300">
                          탄 {f.carbs} · 단 {f.protein} · 지 {f.fat}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="py-10 text-center text-sm text-brand-300">
                    검색 결과가 없어요. 직접 추가해 보세요.
                  </li>
                )}
              </ul>
            </div>

            {/* 선택 후 섭취량 입력 바 */}
            {selected && (
              <div className="border-t border-cream-200 bg-white px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-brand-800">{selected.name}</div>
                    <div className="text-xs text-brand-300">
                      {Math.round(selected.kcal * servings)} kcal · {selected.unit} 기준
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setServings((s) => Math.max(0.5, Math.round((s - 0.5) * 10) / 10))}
                      className="h-9 w-9 rounded-full bg-cream-200 text-lg font-bold text-brand-600"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step={0.5}
                      min={0.1}
                      value={servings}
                      onChange={(e) => setServings(Math.max(0.1, Number(e.target.value) || 0.1))}
                      className="w-16 rounded-lg border border-cream-300 py-1.5 text-center text-sm"
                    />
                    <button
                      onClick={() => setServings((s) => Math.round((s + 0.5) * 10) / 10)}
                      className="h-9 w-9 rounded-full bg-cream-200 text-lg font-bold text-brand-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button onClick={confirm} className="btn-primary w-full">
                  추가하기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
