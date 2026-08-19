import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { BpLog } from '../types'
import { classifyBp, latestBp, simulateWatchReading } from '../lib/bp'
import { todayKey, formatKorean } from '../lib/dates'
import { nowHHmm } from '../lib/meds'
import { ArtWatch, ArtHeartPulse } from './HealthArt'

/**
 * 혈압 카드 (홈 화면) — 최근 측정값 + 기록 입력.
 * ⌚ 워치 버튼은 스마트워치 연동을 «가정한» 데모로,
 * 실제 기기 측정값이 아닌 시뮬레이션 값을 채워준다.
 */
export default function BpCard() {
  const [open, setOpen] = useState(false)
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [pulse, setPulse] = useState('')
  const [fromWatch, setFromWatch] = useState(false)
  const [error, setError] = useState('')

  const logs = useLiveQuery(() => db.bpLogs.toArray(), [], [] as BpLog[])
  const recent = latestBp(logs ?? [])
  const cat = recent ? classifyBp(recent.systolic, recent.diastolic) : null

  const fillFromWatch = () => {
    const r = simulateWatchReading()
    setSystolic(String(r.systolic))
    setDiastolic(String(r.diastolic))
    setPulse(String(r.pulse))
    setFromWatch(true)
    setError('')
  }

  const save = async () => {
    const sys = Number(systolic)
    const dia = Number(diastolic)
    if (!sys || !dia) {
      setError('수축기·이완기 혈압을 입력해 주세요')
      return
    }
    if (sys < 50 || sys > 250 || dia < 30 || dia > 150 || dia >= sys) {
      setError('혈압 수치를 다시 확인해 주세요 (수축기 > 이완기)')
      return
    }
    await db.bpLogs.add({
      date: todayKey(),
      time: nowHHmm(),
      systolic: sys,
      diastolic: dia,
      pulse: Number(pulse) || undefined,
      source: fromWatch ? '워치' : '직접입력',
      createdAt: Date.now(),
    })
    setOpen(false)
    setSystolic('')
    setDiastolic('')
    setPulse('')
    setFromWatch(false)
    setError('')
  }

  const remove = async (id?: number) => {
    if (id != null) await db.bpLogs.delete(id)
  }

  const recentList = [...(logs ?? [])].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)

  return (
    <div className="mx-5 mt-4 card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArtHeartPulse size={26} />
          <p className="text-sm font-bold text-brand-800">🩺 혈압</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-coral-50 px-3 py-1.5 text-sm font-semibold text-coral-600 hover:bg-coral-100"
        >
          {open ? '닫기' : '+ 기록'}
        </button>
      </div>

      {/* 최근 측정값 */}
      {recent && cat ? (
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums text-brand-800">
              {recent.systolic}
              <span className="text-brand-300"> / </span>
              {recent.diastolic}
              <span className="ml-1 text-sm font-normal text-brand-300">mmHg</span>
            </p>
            <p className="mt-0.5 text-xs text-brand-400">
              {formatKorean(recent.date)} {recent.time}
              {recent.pulse ? ` · 맥박 ${recent.pulse}` : ''}
              {recent.source === '워치' ? ' · ⌚' : ''}
            </p>
          </div>
          <div className="text-right">
            <span className={`chip ${cat.chip}`}>
              {cat.emoji} {cat.label}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-brand-400">
          아직 측정 기록이 없어요. 첫 혈압을 기록해 보세요.
        </p>
      )}
      {recent && cat && <p className="mt-2 text-xs leading-relaxed text-brand-400">{cat.advice}</p>}

      {/* 입력 폼 */}
      {open && (
        <div className="mt-4 rounded-2xl bg-cream-100 p-4">
          {/* 워치 동기화 (데모) */}
          <button
            onClick={fillFromWatch}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900"
          >
            <ArtWatch size={22} />
            워치에서 가져오기
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-normal">
              데모
            </span>
          </button>
          <p className="mt-1.5 text-center text-[10px] leading-relaxed text-brand-300">
            웹 앱은 워치에 직접 연결할 수 없어 데모 값이 채워집니다. 실제 수치는 아래에 직접
            입력해 주세요.
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Field label="수축기" value={systolic} onChange={setSystolic} placeholder="120" />
            <Field label="이완기" value={diastolic} onChange={setDiastolic} placeholder="80" />
            <Field label="맥박" value={pulse} onChange={setPulse} placeholder="72" />
          </div>
          {systolic && diastolic && Number(systolic) > Number(diastolic) && (
            <p className="mt-2 text-center text-xs font-semibold text-brand-600">
              {(() => {
                const c = classifyBp(Number(systolic), Number(diastolic))
                return `${c.emoji} ${c.label} 범위예요`
              })()}
            </p>
          )}
          {error && <p className="mt-2 text-center text-xs text-coral-600">⚠️ {error}</p>}
          <button onClick={save} className="btn-primary mt-3 w-full">
            기록 저장
          </button>
        </div>
      )}

      {/* 최근 기록 목록 */}
      {open && recentList.length > 0 && (
        <ul className="mt-3 divide-y divide-cream-200">
          {recentList.map((l) => {
            const c = classifyBp(l.systolic, l.diastolic)
            return (
              <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-brand-400">
                  {formatKorean(l.date)} {l.time} {l.source === '워치' ? '⌚' : ''}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums text-brand-700">
                    {l.systolic}/{l.diastolic}
                  </span>
                  <span className={`chip ${c.chip}`}>{c.label}</span>
                  <button
                    onClick={() => remove(l.id)}
                    className="text-cream-400 hover:text-coral-500"
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="mb-1 block text-center text-[11px] font-medium text-brand-400">
        {label}
      </label>
      <input
        type="number"
        inputMode="numeric"
        className="input py-2 text-center"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
