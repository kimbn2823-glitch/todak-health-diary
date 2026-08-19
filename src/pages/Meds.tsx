import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { DoseSlot, MedLog, Medication } from '../types'
import { todayKey, shiftDay, formatKorean, isToday } from '../lib/dates'
import {
  buildDoseSlots,
  toggleDose,
  isOverdue,
  nextDose,
  doseProgress,
  nowHHmm,
} from '../lib/meds'
import { useMedReminder, useNotificationPermission } from '../lib/useMedReminder'
import PageHeader from '../components/PageHeader'
import MedForm from '../components/MedForm'
import { ArtPill, ArtPillBottle, ArtBell } from '../components/HealthArt'
import Character from '../components/Character'

export default function Meds() {
  const [date, setDate] = useState(todayKey())
  const [editing, setEditing] = useState<Medication | null | 'new'>(null)
  const { permission, request } = useNotificationPermission()

  const meds = useLiveQuery(() => db.meds.toArray(), [], [] as Medication[])
  const logs = useLiveQuery(
    () => db.medLogs.where('date').equals(date).toArray(),
    [date],
    [] as MedLog[]
  )

  const slots = buildDoseSlots(meds ?? [], logs ?? [])
  const { taken, total } = doseProgress(slots)
  const upcoming = isToday(date) ? nextDose(slots) : undefined

  // 오늘 화면을 보고 있을 때만 알림을 예약한다.
  useMedReminder(slots, isToday(date) && permission === 'granted')

  const activeMeds = (meds ?? []).filter((m) => m.active)
  const pausedMeds = (meds ?? []).filter((m) => !m.active)

  const removeMed = async (med: Medication) => {
    if (med.id == null) return
    if (!confirm(`'${med.name}'을(를) 삭제할까요? 복용 기록도 함께 지워집니다.`)) return
    await db.transaction('rw', db.meds, db.medLogs, async () => {
      await db.medLogs.where('medId').equals(med.id!).delete()
      await db.meds.delete(med.id!)
    })
  }

  const togglePause = async (med: Medication) => {
    if (med.id == null) return
    await db.meds.update(med.id, { active: !med.active })
  }

  if (editing) {
    return (
      <div>
        <PageHeader title={editing === 'new' ? '약 추가' : '약 수정'} />
        <div className="mx-5 card p-5">
          <MedForm
            initial={editing === 'new' ? null : editing}
            onDone={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="💊 약 복용 알림" subtitle="복용 시간을 놓치지 않게 챙겨드려요" />

      {/* 날짜 이동 */}
      <div className="flex items-center justify-between px-5 pb-3">
        <button
          onClick={() => setDate((d) => shiftDay(d, -1))}
          className="rounded-lg px-3 py-1.5 text-brand-300 hover:bg-cream-200"
        >
          ‹ 이전
        </button>
        <div className="text-center">
          <div className="font-semibold text-brand-800">{formatKorean(date)}</div>
          {!isToday(date) && (
            <button onClick={() => setDate(todayKey())} className="text-xs text-coral-600">
              오늘로
            </button>
          )}
        </div>
        <button
          onClick={() => setDate((d) => shiftDay(d, 1))}
          disabled={isToday(date)}
          className="rounded-lg px-3 py-1.5 text-brand-300 hover:bg-cream-200 disabled:opacity-30"
        >
          다음 ›
        </button>
      </div>

      {/* 오늘 복용 요약 */}
      {total > 0 && (
        <div className="mx-5 mb-4 overflow-hidden rounded-3xl bg-ocean-500 px-5 py-4 text-white shadow-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ocean-100">복용 진행</p>
              <p className="text-2xl font-bold tabular-nums">
                {taken}
                <span className="text-sm font-normal text-ocean-100"> / {total}회</span>
              </p>
              {upcoming ? (
                <p className="mt-0.5 text-xs text-ocean-100">
                  다음 {upcoming.time} · {upcoming.med.name}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-ocean-100">
                  {taken === total ? '오늘 복용을 모두 마쳤어요 🎉' : '남은 복용을 확인하세요'}
                </p>
              )}
            </div>
            <ArtPillBottle size={52} />
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${total ? (taken / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 알림 권한 안내 */}
      {total > 0 && permission !== 'granted' && (
        <div className="mx-5 mb-4 flex items-start gap-3 rounded-2xl bg-mango-100 p-4">
          <ArtBell size={32} />
          <div className="flex-1">
            {permission === 'unsupported' ? (
              <p className="text-sm text-mango-600">
                이 브라우저는 알림을 지원하지 않아요. 화면에서 직접 확인해 주세요.
              </p>
            ) : permission === 'denied' ? (
              <p className="text-sm text-mango-600">
                알림이 차단되어 있어요. 브라우저 주소창의 자물쇠 아이콘에서 알림을 허용해 주세요.
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-mango-600">알림을 받아보세요</p>
                <p className="mt-0.5 text-xs text-mango-600/90">
                  복용 시간이 되면 알려드려요. (앱이 열려 있을 때만 동작)
                </p>
                <button
                  onClick={request}
                  className="mt-2 rounded-lg bg-mango-500 px-3 py-1.5 text-xs font-bold text-white"
                >
                  알림 허용하기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 오늘의 복용 일정 */}
      {total > 0 ? (
        <div className="mx-5 mb-4 space-y-2.5">
          <p className="text-sm font-bold text-brand-800">⏰ 복용 일정</p>
          {slots.map((slot) => (
            <DoseRow
              key={`${slot.med.id}-${slot.time}`}
              slot={slot}
              date={date}
              showOverdue={isToday(date)}
            />
          ))}
        </div>
      ) : (
        <div className="mx-5 mb-4 flex flex-col items-center rounded-3xl bg-ocean-50 px-6 py-9 text-center">
          <Character name="takeMedicine" size={110} />
          <p className="mt-2 text-sm font-semibold text-brand-700">💊 등록된 약이 없어요</p>
          <p className="mt-1 text-xs text-brand-400">
            복용 중인 약을 추가하면 시간에 맞춰 알려드려요.
          </p>
        </div>
      )}

      <div className="mx-5 mb-4">
        <button onClick={() => setEditing('new')} className="btn-coral w-full py-3">
          + 약 추가하기
        </button>
      </div>

      {/* 등록된 약 목록 */}
      {(activeMeds.length > 0 || pausedMeds.length > 0) && (
        <div className="mx-5 mb-4">
          <p className="mb-2 text-sm font-bold text-brand-800">💊 내 약 목록</p>
          <div className="space-y-2">
            {[...activeMeds, ...pausedMeds].map((med) => (
              <div key={med.id} className={`card p-4 ${med.active ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <ArtPill size={30} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-brand-800">{med.name}</span>
                        <span className="text-xs text-brand-400">{med.dose}</span>
                        {!med.active && (
                          <span className="chip bg-cream-300 text-brand-500">중단</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-brand-400">
                        {med.times.join(' · ')}
                        {med.mealRelation !== '무관' && ` · ${med.mealRelation}`}
                      </p>
                      {med.memo && (
                        <p className="mt-1 text-xs text-brand-300">{med.memo}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      onClick={() => setEditing(med)}
                      className="text-xs font-semibold text-brand-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => togglePause(med)}
                      className="text-xs text-brand-400"
                    >
                      {med.active ? '중단' : '재개'}
                    </button>
                    <button
                      onClick={() => removeMed(med)}
                      className="text-xs text-coral-500"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="px-8 pb-4 text-center text-[11px] leading-relaxed text-brand-300">
        알림은 앱이 열려 있을 때만 표시됩니다. 처방·복용법은 반드시 의사·약사의 안내를 따르세요.
      </p>
    </div>
  )
}

function DoseRow({
  slot,
  date,
  showOverdue,
}: {
  slot: DoseSlot
  date: string
  showOverdue: boolean
}) {
  const overdue = showOverdue && isOverdue(slot)
  const isNow = showOverdue && !slot.taken && slot.time === nowHHmm().slice(0, 5)

  return (
    <button
      onClick={() => toggleDose(date, slot)}
      className={`card flex w-full items-center gap-3 p-4 text-left transition ${
        slot.taken ? 'bg-ocean-50' : overdue ? 'ring-2 ring-coral-200' : ''
      }`}
    >
      {/* 체크 원 */}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold transition ${
          slot.taken
            ? 'border-ocean-500 bg-ocean-500 text-white'
            : 'border-cream-400 text-transparent'
        }`}
      >
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-bold tabular-nums ${
              slot.taken ? 'text-brand-400 line-through' : 'text-brand-800'
            }`}
          >
            {slot.time}
          </span>
          {isNow && <span className="chip bg-coral-100 text-coral-600">지금</span>}
          {overdue && !isNow && <span className="chip bg-coral-50 text-coral-600">지남</span>}
        </div>
        <p
          className={`truncate text-sm ${
            slot.taken ? 'text-brand-300 line-through' : 'text-brand-600'
          }`}
        >
          {slot.med.name} {slot.med.dose}
          {slot.med.mealRelation !== '무관' && (
            <span className="text-brand-300"> · {slot.med.mealRelation}</span>
          )}
        </p>
      </div>
    </button>
  )
}
