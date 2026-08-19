import ProfileForm from '../components/ProfileForm'
import { useProfile } from '../store/useProfile'
import { ArtHeartPulse, ArtPill, ArtWatch } from '../components/HealthArt'
// 캐릭터는 실제 SVG 이미지 파일을 불러와 쓴다 (src/assets/characters)
import charCheer from '../assets/characters/cheer.svg'
import charStretch from '../assets/characters/stretch.svg'
import charMeal from '../assets/characters/healthy-meal.svg'

const CHARACTERS = [
  { src: charStretch, label: '운동으로', accent: '홈트레이닝' },
  { src: charCheer, label: '함께', accent: '건강관리 시작!' },
  { src: charMeal, label: '식단으로', accent: '식단조절' },
]

// 최초 실행 시 프로필 설정 화면
export default function Onboarding() {
  const save = useProfile((s) => s.save)

  return (
    <div className="mx-auto min-h-full max-w-lg pb-10">
      {/* 배너풍 히어로 */}
      <div className="font-cute rounded-b-[2.5rem] bg-ocean-500 px-6 pb-8 pt-9 text-center shadow-lift">
        <p className="text-sm font-semibold text-ocean-100">🌱 매일 기록하는 나의 식습관</p>
        <h1 className="mt-1.5 text-[28px] font-extrabold leading-snug text-white drop-shadow-sm">
          토닥토닥 건강일기
        </h1>
        <p className="mt-1 text-[15px] font-medium text-ocean-100">
          오늘도 잘하고 있어요, 토닥토닥 🤗
        </p>

        <div className="mt-6 flex items-end justify-center gap-5">
          <ArtHeartPulse size={64} />
          <ArtPill size={58} className="mb-1" />
          <ArtWatch size={62} />
        </div>
      </div>

      {/* 캐릭터 3인방 */}
      <div className="px-4 pt-7">
        <h2 className="text-center text-[17px] font-extrabold text-brand-800">
          🎉 날씨 풀렸으니 <span className="text-coral-500">건강관리</span> 시작하자!
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {CHARACTERS.map((c, i) => (
            <div key={c.accent} className="flex flex-col items-center">
              {/* 등장(pop) 후 계속 둥실거리도록 두 겹으로 감싼다 */}
              <div className={`anim-pop ${i === 1 ? 'delay-1' : i === 2 ? 'delay-2' : ''}`}>
                <img
                  src={c.src}
                  alt={c.accent}
                  width={120}
                  height={170}
                  className={`anim-float h-auto w-full max-w-[110px] ${
                    i === 1 ? 'float-fast' : i === 2 ? 'float-slow' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.35}s` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-brand-400">{c.label}</p>
              <p className="text-xs font-bold text-brand-700">{c.accent}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="px-8 pb-5 pt-6 text-center text-xs leading-relaxed text-brand-400">
        기본 정보를 입력하면 나에게 맞는 목표 칼로리를 계산해 드려요.
        <br />
        🔒 모든 정보는 이 기기에만 저장됩니다.
        <br />
        ✍️ 입력하는 중에는 자동으로 임시저장되니, 중간에 나가도 괜찮아요.
      </p>

      <div className="mx-5 card p-5">
        {/* draftKey: 저장 버튼을 누르기 전에도 입력값을 임시 보관한다 */}
        <ProfileForm submitLabel="시작하기 🚀" onSubmit={save} draftKey="onboarding" />
      </div>
    </div>
  )
}
