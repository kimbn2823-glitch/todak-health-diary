import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import type { MealLog, WeightLog, Medication, MedLog, ExerciseLog, SleepLog } from '../types'
import { todayKey, lastNDays, formatShort, formatKorean } from '../lib/dates'
import { sumNutrition, calcBMI, bmiCategory, computeGoals } from '../lib/nutrition'
import { buildDoseSlots, doseProgress, nextDose } from '../lib/meds'
import { buildWeightPlan } from '../lib/weightLoss'
import { recommendExercises, sumBurned } from '../lib/exercise'
import { assessSleep, QUALITY_EMOJI } from '../lib/sleep'
import { useProfile } from '../store/useProfile'
import CalorieRing from '../components/CalorieRing'
import { MacroGroup } from '../components/MacroBar'
import { Heartbeat } from '../components/Decor'
import {
  ArtHeartPulse,
  ArtScale,
  ArtTrophy,
  ArtSalad,
  ArtDroplet,
  ArtDumbbell,
  ArtMoon,
  ArtPillBottle,
} from '../components/HealthArt'
import WorkoutScene from '../components/WorkoutScene'
import Character from '../components/Character'
import LiveClock from '../components/LiveClock'
import BpCard from '../components/BpCard'
import WaterCard from '../components/WaterCard'
import StreakCard from '../components/StreakCard'

// 시간대에 맞는 인사말
function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '🌙 늦은 시간까지 고생 많아요'
  if (h < 11) return '🌅 상쾌한 아침이에요'
  if (h < 15) return '☀️ 활기찬 오후예요'
  if (h < 19) return '🌤️ 오늘 하루 어떠셨나요'
  return '🌙 편안한 저녁 되세요'
}

// 오늘 섭취 상황에 따른 한 줄 응원
function cheerLine(consumed: number, target: number): string {
  if (consumed === 0) return '오늘 첫 끼를 기록해 볼까요?'
  const ratio = consumed / target
  if (ratio > 1.1) return '오늘은 조금 넉넉했어요. 가볍게 움직여요!'
  if (ratio > 0.85) return '목표에 딱 맞게 잘 드셨어요 👍'
  if (ratio > 0.5) return '순조롭게 가고 있어요!'
  return '아직 여유 있어요. 든든하게 챙겨 드세요'
}

export default function Dashboard() {
  const profile = useProfile((s) => s.profile)!
  const today = todayKey()

  const todayLogs = useLiveQuery(
    () => db.logs.where('date').equals(today).toArray(),
    [today],
    [] as MealLog[]
  )
  const latestWeight = useLiveQuery(
    () => db.weights.orderBy('date').last(),
    [],
    undefined as WeightLog | undefined
  )

  const total = sumNutrition(todayLogs ?? [])
  const m = profile.targetMacros
  const currentWeight = latestWeight?.weightKg ?? profile.currentWeightKg
  const bmi = calcBMI(currentWeight, profile.heightCm)
  const bmiCat = bmiCategory(bmi)
  const toGoal = currentWeight - profile.targetWeightKg

  return (
    <div>
      {/* 배너풍 헤더 — 시안 배경 + 건강 일러스트 */}
      <header className="font-cute relative overflow-hidden rounded-b-[2rem] bg-ocean-500 px-6 pb-16 pt-8 text-white">
        <Heartbeat
          className="absolute inset-x-0 bottom-5 h-10 w-full"
          color="#ffffff"
          opacity={0.28}
        />
        {/* 실시간 날짜·시계 — 화면 최상단 */}
        <div className="relative">
          <LiveClock />
        </div>

        <div className="relative flex items-end justify-between">
          <div className="pb-2">
            <p className="text-sm text-ocean-100">{greeting()}</p>
            <h1 className="mt-1 text-2xl font-bold">
              안녕하세요, {profile.name}님
            </h1>
            <p className="mt-1.5 text-xs text-ocean-100">{cheerLine(total.kcal, profile.targetKcal)}</p>
          </div>
          {/* 인사하는 캐릭터 — 항상 표시 */}
          <Character name="cheer" size={96} className="-mb-6 -mr-1 shrink-0 drop-shadow-lg" />
        </div>
      </header>

      {/* 오늘 칼로리 링 — 헤더 위로 겹치게 */}
      <div className="-mt-10 px-5">
        <div className="card flex flex-col items-center p-6">
          <CalorieRing consumed={total.kcal} target={profile.targetKcal} />
          <div className="mt-6 w-full">
            <MacroGroup
              carbs={[total.carbs, m.carbs]}
              protein={[total.protein, m.protein]}
              fat={[total.fat, m.fat]}
            />
          </div>
          <Link to="/diary" className="btn-coral mt-6 w-full py-3">
            🍽️ 오늘 식단 기록하기
          </Link>
        </div>
      </div>

      {/* 오늘의 목표 달성 여부 */}
      <TodayVerdict consumed={total.kcal} target={profile.targetKcal} hasLog={(todayLogs ?? []).length > 0} />

      {/* 스트릭·뱃지 */}
      <StreakCard />

      {/* 혈압 기록 */}
      <BpCard />

      {/* 물 마시기 */}
      <WaterCard />

      {/* 식단 기록 안내 — 캐릭터 상시 노출 */}
      <div className="mx-5 mt-4">
        <Link
          to="/diary"
          className="card flex items-center gap-3 p-4 transition hover:shadow-lift"
        >
          <Character name="healthyMeal" size={72} className="-my-2 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-800">🥗 오늘 뭐 드셨어요?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-brand-400">
              먹은 음식을 남기면 칼로리와 영양소를 자동으로 계산해 드려요.
            </p>
          </div>
        </Link>
      </div>

      {/* 요약 카드 */}
      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        <Link to="/weight" className="card p-4 transition hover:shadow-lift">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-brand-300">현재 체중</p>
            <ArtScale size={28} />
          </div>
          <p className="text-xl font-bold text-brand-800">
            {currentWeight}
            <span className="text-sm font-normal text-brand-300"> kg</span>
          </p>
          <p className="mt-0.5 text-xs">
            <span className={`font-bold ${bmiCat.color}`}>BMI {bmi.toFixed(1)}</span>{' '}
            <span className="text-brand-300">{bmiCat.label}</span>
          </p>
        </Link>
        <Link to="/weight" className="card p-4 transition hover:shadow-lift">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-brand-300">목표까지</p>
            <ArtTrophy size={28} />
          </div>
          {Math.abs(toGoal) < 0.1 ? (
            <p className="mt-1 text-xl font-bold text-coral-500">달성! 🎉</p>
          ) : (
            <p className="mt-1 text-xl font-bold text-brand-800">
              {Math.abs(toGoal).toFixed(1)}
              <span className="text-sm font-normal text-brand-300">
                {' '}
                kg {toGoal > 0 ? '감량' : '증량'}
              </span>
            </p>
          )}
          <p className="mt-0.5 text-xs text-brand-300">
            목표 {profile.targetWeightKg}kg · {profile.goalType}
          </p>
        </Link>
      </div>

      <WeightProgress />

      <MedSummary />

      <ExerciseSummary consumed={total.kcal} target={profile.targetKcal} />

      <SleepSummary />

      <RecentTrend />

      <HealthTips />

      <div className="px-5 pb-2 text-center">
        <Link to="/report" className="text-sm font-semibold text-brand-600">
          자세한 리포트 보기 →
        </Link>
      </div>
    </div>
  )
}

/**
 * 오늘 목표를 지켰는지 한눈에 보여주는 배너.
 * 판정 기준은 «순 섭취(먹은 것 − 운동으로 태운 것)»가 하루 목표 칼로리 이내인지다.
 * 체중 목표를 이미 달성했다면 그것을 우선해서 축하한다.
 */
function TodayVerdict({
  consumed,
  target,
  hasLog,
}: {
  consumed: number
  target: number
  hasLog: boolean
}) {
  const profile = useProfile((s) => s.profile)!
  const today = todayKey()

  const exLogs = useLiveQuery(
    () => db.exerciseLogs.where('date').equals(today).toArray(),
    [today],
    [] as ExerciseLog[]
  )
  const weights = useLiveQuery(
    () => db.weights.orderBy('date').toArray(),
    [],
    [] as WeightLog[]
  )

  const burned = sumBurned(exLogs ?? [])
  const net = consumed - burned
  const diff = net - target

  const list = weights ?? []
  const currentWeight = list.length
    ? list[list.length - 1].weightKg
    : profile.currentWeightKg
  // 감량 목표를 이미 이룬 경우 (감량 목표일 때만 따진다)
  const weightGoalReached =
    profile.goalType === '감량' && currentWeight <= profile.targetWeightKg + 0.05

  // --- 상태 결정 ---
  let tone: 'success' | 'effort' | 'neutral'
  let title: string
  let desc: string
  let character: 'celebrate' | 'stretch' | 'writeLog'

  if (weightGoalReached) {
    tone = 'success'
    character = 'celebrate'
    title = '🏆 목표 달성, 성공이에요!'
    desc = `목표 체중 ${profile.targetWeightKg}kg에 도달했어요. 정말 대단해요!`
  } else if (!hasLog) {
    tone = 'neutral'
    character = 'writeLog'
    title = '📝 오늘 기록을 시작해볼까요?'
    desc = '먹은 음식을 남기면 목표 달성 여부를 알려드려요.'
  } else if (diff <= 0) {
    tone = 'success'
    character = 'celebrate'
    title = '🎉 성공! 오늘 목표를 지켰어요'
    desc =
      burned > 0
        ? `목표까지 ${Math.abs(Math.round(diff))}kcal 남았어요. 운동으로 ${burned}kcal도 태웠고요!`
        : `목표까지 ${Math.abs(Math.round(diff))}kcal 여유가 있어요. 이 페이스 좋아요!`
  } else {
    tone = 'effort'
    character = 'stretch'
    title = '💪 좀 더 노력하세요!'
    desc = `목표보다 ${Math.round(diff)}kcal 많아요. 가벼운 운동으로 채워볼까요?`
  }

  const style =
    tone === 'success'
      ? { bg: 'bg-ocean-500', text: 'text-white', sub: 'text-ocean-100' }
      : tone === 'effort'
        ? { bg: 'bg-coral-500', text: 'text-white', sub: 'text-coral-100' }
        : { bg: 'bg-cream-200', text: 'text-brand-800', sub: 'text-brand-400' }

  return (
    <div className="mx-5 mt-4">
      <div
        className={`flex items-center gap-2 overflow-hidden rounded-3xl px-4 py-3 shadow-lift ${style.bg}`}
      >
        <Character name={character} size={76} className="-my-3 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={`text-base font-extrabold leading-snug ${style.text}`}>{title}</p>
          <p className={`mt-1 text-xs leading-relaxed ${style.sub}`}>{desc}</p>
        </div>
      </div>
    </div>
  )
}

// 감량 진행 요약 — 목표가 «감량»일 때만 표시
function WeightProgress() {
  const profile = useProfile((s) => s.profile)!
  const weights = useLiveQuery(
    () => db.weights.orderBy('date').toArray(),
    [],
    [] as WeightLog[]
  )
  if (profile.goalType !== '감량') return null

  const list = weights ?? []
  const current = list.length ? list[list.length - 1].weightKg : profile.currentWeightKg
  const { tdee } = computeGoals({
    gender: profile.gender,
    weightKg: current,
    heightCm: profile.heightCm,
    age: profile.age,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
  })
  const plan = buildWeightPlan(list, profile, tdee)

  return (
    <Link to="/weight" className="mx-5 mb-4 card block p-5 transition hover:shadow-lift">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArtTrophy size={26} />
          <p className="text-sm font-bold text-brand-800">🎯 감량 진행</p>
        </div>
        <span className="text-sm font-bold text-ocean-600">{Math.round(plan.percent)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full bg-ocean-500 transition-all duration-700"
          style={{ width: `${plan.percent}%` }}
        />
      </div>
      <div className="mt-2.5 flex items-baseline justify-between text-xs text-brand-400">
        <span>
          {plan.lostKg > 0 ? (
            <>
              <span className="font-bold text-ocean-600">-{plan.lostKg.toFixed(1)}kg</span> 감량
            </>
          ) : (
            '아직 변화 없음'
          )}
        </span>
        <span>
          {plan.reached ? '목표 달성! 🎉' : `남은 목표 ${plan.remainingKg.toFixed(1)}kg`}
        </span>
      </div>
      {plan.etaDate && !plan.reached && (
        <p className="mt-2 text-xs text-brand-400">
          이 속도면 <span className="font-bold text-brand-700">{formatKorean(plan.etaDate)}</span>{' '}
          도달 예상
        </p>
      )}
    </Link>
  )
}

// 운동 요약 + 추천 — 오늘 섭취·소모 칼로리에 맞춰 실제 MET로 계산한다.
function ExerciseSummary({ consumed, target }: { consumed: number; target: number }) {
  const profile = useProfile((s) => s.profile)!
  const today = todayKey()

  const exLogs = useLiveQuery(
    () => db.exerciseLogs.where('date').equals(today).toArray(),
    [today],
    [] as ExerciseLog[]
  )
  const latestWeight = useLiveQuery(
    () => db.weights.orderBy('date').last(),
    [],
    undefined as WeightLog | undefined
  )

  const weightKg = latestWeight?.weightKg ?? profile.currentWeightKg
  const burned = sumBurned(exLogs ?? [])
  const net = consumed - burned
  const over = net - target
  const isOver = over > 30
  const targetBurn = isOver ? Math.round(over) : 200

  // 접근성 높은 운동 3가지만 간단히 제안
  const picks = recommendExercises({ targetKcal: targetBurn, weightKg, onlyEasy: true, limit: 3 })

  return (
    <Link to="/plan" className="mx-5 mb-4 block overflow-hidden card transition hover:shadow-lift">
      <div className="flex justify-center bg-cream-200 pt-3">
        <WorkoutScene width={230} />
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-bold text-brand-800">
            {isOver ? '🔥 오늘은 조금 더 움직여볼까요?' : '💪 가볍게 몸을 풀어볼까요?'}
          </p>
          {burned > 0 && (
            <span className="text-xs font-bold text-ocean-600">-{burned} kcal</span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-brand-400">
          {isOver
            ? `순 섭취가 목표보다 ${Math.round(over)}kcal 많아요. 아래 운동으로 채울 수 있어요.`
            : `가볍게 ${targetBurn}kcal만 태워도 몸이 달라져요.`}
        </p>

        <div className="mt-3 space-y-1.5">
          {picks.map((p) => (
            <div
              key={p.exercise.id}
              className="flex items-center gap-2 rounded-xl bg-ocean-50 px-3 py-2"
            >
              <span className="text-base">{p.exercise.emoji}</span>
              <span className="flex-1 text-xs font-medium text-brand-700">
                {p.exercise.name}
              </span>
              <span className="text-xs font-bold text-ocean-600">{p.minutes}분</span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-center text-xs font-semibold text-coral-600">
          운동 기록하러 가기 →
        </p>
      </div>
    </Link>
  )
}

// 오늘의 복약 현황 요약 (등록된 약이 있을 때만 표시)
function MedSummary() {
  const today = todayKey()
  const meds = useLiveQuery(() => db.meds.toArray(), [], [] as Medication[])
  const medLogs = useLiveQuery(
    () => db.medLogs.where('date').equals(today).toArray(),
    [today],
    [] as MedLog[]
  )

  const slots = buildDoseSlots(meds ?? [], medLogs ?? [])
  if (slots.length === 0) return null

  const { taken, total } = doseProgress(slots)
  const upcoming = nextDose(slots)
  const done = taken === total

  return (
    <Link to="/meds" className="mx-5 mb-4 card block p-5 transition hover:shadow-lift">
      <div className="flex items-center gap-3">
        <ArtPillBottle size={40} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-bold text-brand-800">💊 오늘의 복약</p>
            <span className="text-sm font-bold tabular-nums text-ocean-600">
              {taken}
              <span className="text-xs font-normal text-brand-300"> / {total}회</span>
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-brand-400">
            {done
              ? '오늘 복용을 모두 마쳤어요 🎉'
              : upcoming
                ? `다음 ${upcoming.time} · ${upcoming.med.name} ${upcoming.med.dose}`
                : '남은 복용을 확인해 주세요'}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-ocean-500 transition-all duration-500"
              style={{ width: `${(taken / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

// 오늘 수면 요약 (기록이 있을 때만 표시)
function SleepSummary() {
  const today = todayKey()
  const log = useLiveQuery(
    () => db.sleepLogs.where('date').equals(today).first(),
    [today],
    undefined as SleepLog | undefined
  )
  if (!log) return null

  const a = assessSleep(log.hours)
  return (
    <Link to="/sleep" className="mx-5 mb-4 card block p-5 transition hover:shadow-lift">
      <div className="flex items-center gap-3">
        <Character name="sleeping" size={64} className="-my-2 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-bold text-brand-800">😴 오늘의 수면</p>
            <span className="text-sm font-bold text-sky2-600">{log.hours}시간</span>
          </div>
          <p className="mt-0.5 text-xs text-brand-400">
            {log.bedTime} → {log.wakeTime} · {QUALITY_EMOJI[log.quality]} {log.quality}
          </p>
          <p className="mt-1 text-xs font-semibold text-brand-600">{a.label}</p>
        </div>
      </div>
    </Link>
  )
}

// 건강 습관 체크 스트립 — 일러스트 중심의 가벼운 리마인더
const TIPS = [
  { art: ArtSalad, label: '채소 챙기기', color: 'bg-ocean-50' },
  { art: ArtDroplet, label: '물 8잔', color: 'bg-ocean-50' },
  { art: ArtDumbbell, label: '가벼운 운동', color: 'bg-coral-50' },
  { art: ArtMoon, label: '충분한 수면', color: 'bg-cream-200' },
]

function HealthTips() {
  return (
    <div className="mx-5 mb-4 card p-5">
      <div className="mb-3 flex items-center gap-3">
        <Character name="stretch" size={62} className="-my-2 shrink-0" />
        <div>
          <p className="text-sm font-bold text-brand-800">💪 오늘의 건강 습관</p>
          <p className="mt-0.5 text-xs text-brand-400">네 가지만 지켜도 충분해요</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {TIPS.map(({ art: ArtIcon, label, color }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
              <ArtIcon size={34} />
            </div>
            <span className="text-center text-[11px] font-medium leading-tight text-brand-500">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentTrend() {
  const days = lastNDays(7)
  const logs = useLiveQuery(
    () => db.logs.where('date').anyOf(days).toArray(),
    [days.join()],
    [] as MealLog[]
  )
  const profile = useProfile((s) => s.profile)!

  const byDay = days.map((d) => ({
    date: d,
    kcal: (logs ?? []).filter((l) => l.date === d).reduce((s, l) => s + l.kcal, 0),
  }))
  const maxKcal = Math.max(profile.targetKcal, ...byDay.map((b) => b.kcal), 1)

  return (
    <div className="mx-5 my-4 card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-brand-800">📈 최근 7일 섭취 추이</p>
        <span className="chip bg-cream-200 text-brand-500">목표 {profile.targetKcal}</span>
      </div>
      <div className="flex h-28 items-end justify-between gap-1.5">
        {byDay.map((b) => {
          const h = (b.kcal / maxKcal) * 100
          const over = b.kcal > profile.targetKcal
          return (
            <div key={b.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-lg transition-all"
                  style={{
                    height: `${Math.max(4, h)}%`,
                    backgroundColor: b.kcal === 0 ? '#f7ece1' : over ? '#f5604a' : '#3d57a0',
                  }}
                />
              </div>
              <span className="text-[10px] text-brand-300">{formatShort(b.date)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
