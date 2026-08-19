import * as Art from '../components/HealthArt'
import WorkoutScene from '../components/WorkoutScene'

// 일러스트 카탈로그 (디자인 참고용 화면)
const ITEMS: [string, (p: { size?: number }) => JSX.Element][] = [
  ['심박 하트', Art.ArtHeartPulse],
  ['알약', Art.ArtPill],
  ['약병', Art.ArtPillBottle],
  ['알림 벨', Art.ArtBell],
  ['스마트워치', Art.ArtWatch],
  ['물방울', Art.ArtDroplet],
  ['샐러드', Art.ArtSalad],
  ['체중계', Art.ArtScale],
  ['덤벨', Art.ArtDumbbell],
  ['사과', Art.ArtApple],
  ['수면', Art.ArtMoon],
  ['트로피', Art.ArtTrophy],
  ['클립보드', Art.ArtClipboard],
  ['차트', Art.ArtChart],
  ['아침', Art.ArtSunrise],
  ['점심', Art.ArtSun],
  ['저녁', Art.ArtNightMeal],
  ['간식', Art.ArtSnack],
]

export default function ArtGallery() {
  return (
    <div id="art-gallery" className="px-5 py-8">
      <h1 className="mb-1 text-xl font-bold text-brand-800">홈트레이닝 일러스트</h1>
      <p className="mb-3 text-sm text-brand-400">
        보내주신 운동 그림을 앱 스타일로 옮긴 결과입니다.
      </p>
      {/* 크게 보기 */}
      <div className="mb-3 flex justify-center rounded-3xl bg-cream-200 p-4">
        <WorkoutScene width={330} />
      </div>
      {/* 홈 화면에 실제로 들어가는 카드 모습 */}
      <div className="mb-8 card overflow-hidden">
        <div className="flex justify-center bg-cream-200 pt-3">
          <WorkoutScene width={230} />
        </div>
        <div className="p-5">
          <p className="text-sm font-bold text-brand-800">가볍게 몸을 풀어볼까요?</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-400">
            식단 관리에 가벼운 운동을 더하면 효과가 훨씬 좋아져요.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['복근 운동', '가볍게 걷기', '스트레칭'].map((t) => (
              <span key={t} className="chip bg-ocean-50 text-ocean-600">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="mb-1 text-xl font-bold text-brand-800">건강 일러스트 세트</h2>
      <p className="mb-5 text-sm text-brand-400">
        굵은 남색 외곽선 + 코랄·시안 플랫 스타일 ({ITEMS.length}종)
      </p>
      <div className="grid grid-cols-4 gap-3">
        {ITEMS.map(([label, Icon]) => (
          <div key={label} className="card flex flex-col items-center gap-2 p-3">
            <Icon size={46} />
            <span className="text-[11px] font-medium text-brand-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
