import { useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { seedFoodsIfEmpty } from './db/db'
import { initGreetingSound, initButtonSounds } from './lib/sound'
import { requestPersistentStorage } from './lib/persist'
import { useProfile } from './store/useProfile'
import Dashboard from './pages/Dashboard'
import Diary from './pages/Diary'
import Plan from './pages/Plan'
import Weight from './pages/Weight'
import Report from './pages/Report'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import ArtGallery from './pages/ArtGallery'
import Meds from './pages/Meds'
import Sleep from './pages/Sleep'
import Bp from './pages/Bp'

const NAV = [
  { to: '/', label: '홈', icon: HomeIcon, end: true },
  { to: '/diary', label: '식단', icon: DiaryIcon },
  { to: '/meds', label: '복약', icon: MedsIcon },
  { to: '/sleep', label: '수면', icon: SleepIcon },
  { to: '/bp', label: '혈압', icon: BpIcon },
  { to: '/plan', label: '추천', icon: PlanIcon },
  { to: '/report', label: '리포트', icon: ReportIcon },
  { to: '/settings', label: '설정', icon: SettingsIcon },
]

export default function App() {
  const { profile, loaded, load } = useProfile()

  useEffect(() => {
    seedFoodsIfEmpty()
    load()
    // 브라우저가 저장 공간을 회수해 기록이 사라지지 않도록 영구 저장을 요청한다.
    requestPersistentStorage()
    initGreetingSound()
    initButtonSounds()
  }, [load])

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-brand-300">불러오는 중…</div>
    )
  }

  // 온보딩 미완료 시 프로필 설정 화면
  if (!profile?.onboarded) {
    return <Onboarding />
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col pb-20">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/report" element={<Report />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/meds" element={<Meds />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/bp" element={<Bp />} />
        <Route path="/art" element={<ArtGallery />} />
      </Routes>

      {/* 하단 탭 바 */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2.5 text-[10px] font-semibold transition ${
                  isActive ? 'text-coral-500' : 'text-brand-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

// --- 아이콘 (인라인 SVG) ---
type IconProps = { active?: boolean }
const s = (active?: boolean) => ({
  width: 24,
  height: 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: active ? 2.2 : 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

function HomeIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  )
}
function DiaryIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <path d="M6 3h11a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  )
}
function MedsIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <rect x="2.5" y="8" width="14" height="8" rx="4" transform="rotate(-45 9.5 12)" />
      <path d="M7.4 8.4 13 14" />
      <circle cx="18" cy="18" r="4" />
    </svg>
  )
}
function SleepIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
  )
}
function BpIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6Z" />
      <path d="M7 12h2.5l1.5-2.5 2 4.5 1.5-2H17" />
    </svg>
  )
}
function PlanIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <path d="M12 3v3M5 8h14a1 1 0 0 1 1 1l-1 9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9a1 1 0 0 1 1-1Z" />
      <path d="M9 13h6" />
    </svg>
  )
}
function ReportIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <path d="M4 20V4M4 20h16" />
      <rect x="8" y="11" width="3" height="6" rx="0.5" />
      <rect x="14" y="7" width="3" height="10" rx="0.5" />
    </svg>
  )
}
function SettingsIcon({ active }: IconProps) {
  return (
    <svg {...s(active)} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  )
}
