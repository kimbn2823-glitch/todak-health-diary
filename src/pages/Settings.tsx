import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import { useProfile } from '../store/useProfile'
import ProfileForm from '../components/ProfileForm'
import PageHeader from '../components/PageHeader'
import DataImport from '../components/DataImport'
import CloudSyncCard from '../components/CloudSyncCard'
import { isSoundOn, setSoundOn, playGreeting, playBarkTwice } from '../lib/sound'
import {
  clearDraft,
  clearProfileBackup,
  isStoragePersisted,
  requestPersistentStorage,
} from '../lib/persist'
import type { Profile } from '../types'

export default function Settings() {
  const { profile, save } = useProfile()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [soundOn, setSoundOnState] = useState(isSoundOn())
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    isStoragePersisted().then(setPersisted)
  }, [])

  const onSubmit = async (p: Profile) => {
    await save(p)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = async () => {
    const [foods, logs, weights, plans, prof, meds, medLogs, exerciseLogs, sleepLogs, bpLogs, waterLogs, rewardClaims] = await Promise.all([
      db.foods.filter((f) => f.isCustom).toArray(),
      db.logs.toArray(),
      db.weights.toArray(),
      db.plans.toArray(),
      db.profile.toArray(),
      db.meds.toArray(),
      db.medLogs.toArray(),
      db.exerciseLogs.toArray(),
      db.sleepLogs.toArray(),
      db.bpLogs.toArray(),
      db.waterLogs.toArray(),
      db.rewardClaims.toArray(),
    ])
    const blob = new Blob(
      [
        JSON.stringify(
          { version: 7, foods, logs, weights, plans, profile: prof, meds, medLogs, exerciseLogs, sleepLogs, bpLogs, waterLogs, rewardClaims },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `건강식단_백업_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetAll = async () => {
    if (!confirm('모든 기록(식단·운동·수면·혈압·체중·계획·복약·프로필)이 삭제됩니다. 계속할까요?')) return
    await Promise.all([
      db.logs.clear(),
      db.weights.clear(),
      db.plans.clear(),
      db.profile.clear(),
      db.meds.clear(),
      db.medLogs.clear(),
      db.exerciseLogs.clear(),
      db.sleepLogs.clear(),
      db.bpLogs.clear(),
      db.waterLogs.clear(),
      db.rewardClaims.clear(),
      db.foods.filter((f) => f.isCustom).delete(),
    ])
    // 프로필 사본·임시저장본까지 지워야 초기화 후 프로필이 되살아나지 않는다.
    clearProfileBackup()
    clearDraft('onboarding')
    location.reload()
  }

  if (!profile) return null

  return (
    <div>
      <PageHeader title="⚙️ 설정" />

      {saved && (
        <div className="mx-5 mb-3 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          ✓ 저장되었어요
        </div>
      )}

      {editing ? (
        <div className="mx-5 card p-5">
          <ProfileForm initial={profile} submitLabel="저장" onSubmit={onSubmit} />
          <button onClick={() => setEditing(false)} className="btn-ghost mt-2 w-full">
            취소
          </button>
        </div>
      ) : (
        <>
          {/* 프로필 요약 */}
          <div className="mx-5 mb-4 card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-brand-800">내 프로필</h2>
              <button onClick={() => setEditing(true)} className="text-sm font-semibold text-brand-600">
                수정
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="이름" value={profile.name} />
              <Row label="성별 / 나이" value={`${profile.gender} · ${profile.age}세`} />
              <Row label="키 / 체중" value={`${profile.heightCm}cm · ${profile.currentWeightKg}kg`} />
              <Row label="목표 체중" value={`${profile.targetWeightKg}kg`} />
              <Row label="활동량" value={profile.activityLevel} />
              <Row label="목표" value={profile.goalType} />
              <div className="!mt-3 border-t border-cream-200 pt-3">
                <Row
                  label="하루 목표 칼로리"
                  value={<span className="font-bold text-brand-600">{profile.targetKcal} kcal</span>}
                />
                <Row
                  label="탄·단·지 목표"
                  value={`${profile.targetMacros.carbs} · ${profile.targetMacros.protein} · ${profile.targetMacros.fat} g`}
                />
              </div>
            </dl>
          </div>

          {/* 클라우드 동기화 */}
          <CloudSyncCard />

          {/* 저장 상태 */}
          <div className="mx-5 mb-4 card p-4">
            <p className="text-sm font-bold text-brand-800">💾 기록 보관 상태</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-400">
              입력한 정보는 이 기기에 저장되며, 앱을 껐다 켜도 다시 입력할 필요가 없어요.
            </p>
            {persisted === true ? (
              <p className="mt-2 rounded-xl bg-ocean-50 px-3 py-2 text-xs font-semibold text-ocean-600">
                ✓ 영구 보관 중 — 브라우저가 기록을 임의로 지우지 않아요
              </p>
            ) : persisted === false ? (
              <div className="mt-2 rounded-xl bg-mango-100 px-3 py-2">
                <p className="text-xs leading-relaxed text-mango-600">
                  브라우저가 저장 공간을 회수하면 기록이 사라질 수 있어요. 아래 버튼을 눌러
                  영구 보관을 요청하고, 휴대폰에서는 <b>홈 화면에 추가</b>해서 쓰면 더 안전해요.
                </p>
                <button
                  onClick={async () => setPersisted(await requestPersistentStorage())}
                  className="mt-2 rounded-lg bg-mango-500 px-3 py-1.5 text-xs font-bold text-white"
                >
                  영구 보관 요청하기
                </button>
              </div>
            ) : null}
          </div>

          {/* 소리 설정 */}
          <div className="mx-5 mb-4 card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-brand-800">🔔 앱 소리</p>
                <p className="mt-0.5 text-xs text-brand-400">
                  시작 인사음 "띠링~" + 버튼 소리 "멍!" 🐶
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !soundOn
                  setSoundOn(next)
                  setSoundOnState(next)
                  if (next) playGreeting()
                }}
                aria-label="시작 소리 켜기/끄기"
                className={`relative h-7 w-12 rounded-full transition ${
                  soundOn ? 'bg-ocean-500' : 'bg-cream-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                    soundOn ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            {soundOn && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={playGreeting}
                  className="flex-1 rounded-xl bg-cream-100 py-2 text-xs font-semibold text-brand-600 hover:bg-cream-200"
                >
                  🎵 인사음 듣기
                </button>
                <button
                  onClick={playBarkTwice}
                  className="flex-1 rounded-xl bg-cream-100 py-2 text-xs font-semibold text-brand-600 hover:bg-cream-200"
                >
                  🐶 멍멍 듣기
                </button>
              </div>
            )}
          </div>

          {/* 데이터 관리 */}
          <div className="mx-5 mb-4 card p-2">
            <MenuItem label="체중 기록 관리" to="/weight" />
            <MenuItem label="약 복용 알림" to="/meds" />
            <MenuItem label="운동 추천·기록" to="/plan" />
            <MenuItem label="수면 기록" to="/sleep" />
            <MenuItem label="혈압 관리" to="/bp" />
            <button
              onClick={exportData}
              className="flex w-full items-center justify-between px-3 py-3 text-left text-sm hover:bg-cream-100"
            >
              <span className="text-brand-700">데이터 백업 (JSON 내보내기)</span>
              <span className="text-cream-400">↓</span>
            </button>
            <DataImport />
          </div>

          <div className="mx-5 mb-4">
            <button
              onClick={resetAll}
              className="w-full rounded-xl border border-coral-200 bg-coral-50 py-3 text-sm font-medium text-coral-600 hover:bg-coral-100"
            >
              모든 데이터 초기화
            </button>
          </div>

          <p className="px-8 pb-4 text-center text-xs leading-relaxed text-brand-300">
            모든 데이터는 이 브라우저(기기)에만 저장되며 외부로 전송되지 않습니다.
            <br />
            브라우저 데이터를 삭제하면 기록도 함께 사라질 수 있으니 주기적으로 백업하세요.
          </p>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-brand-300">{label}</dt>
      <dd className="font-medium text-brand-700">{value}</dd>
    </div>
  )
}

function MenuItem({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-3 py-3 text-sm hover:bg-cream-100"
    >
      <span className="text-brand-700">{label}</span>
      <span className="text-cream-400">›</span>
    </Link>
  )
}
