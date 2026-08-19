// 홈트레이닝 장면 일러스트 (움직이는 버전)
// 모바일 트레이너 화면 + 덤벨 + 복근 운동 자세를 플랫 스타일로 구성

const INK = '#14395e'
const RED = '#e8524a'
const SKIN = '#f6c9a4'
const HAIR = '#8b4a2f'
const DARK = '#2f3542'
const TEAL = '#2e9b9b'
const BLUE = '#6ba8e8'
const YELLOW = '#ffd84d'
const WOOD = '#f0d9a8'
const WHITE = '#ffffff'

interface Props {
  className?: string
  width?: number
  /** 말풍선 문구 (비우면 말풍선을 숨김) */
  caption?: string
}

export default function WorkoutScene({
  className = '',
  width = 240,
  caption = '으쌰으쌰!',
}: Props) {
  return (
    <svg
      className={className}
      width={width}
      viewBox="0 0 220 165"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="홈트레이닝 하는 사람과 모바일 트레이너 화면"
    >
      <style>{`
        /* 복근 운동 — 다리를 끌어올렸다 내리는 크런치 동작 */
        .ws-leg { animation: wsKick 1.5s ease-in-out infinite; transform-origin: 150px 130px; }
        @keyframes wsKick {
          0%, 100% { transform: rotate(0deg); }
          45%      { transform: rotate(-16deg); }
        }
        /* 뻗은 팔도 다리를 따라 살짝 */
        .ws-arm { animation: wsReach 1.5s ease-in-out infinite; transform-origin: 136px 110px; }
        @keyframes wsReach {
          0%, 100% { transform: rotate(0deg); }
          45%      { transform: rotate(-9deg); }
        }
        /* 상체·머리 — 크런치에 맞춰 살짝 들썩 */
        .ws-torso { animation: wsRock 1.5s ease-in-out infinite; transform-origin: 150px 130px; }
        @keyframes wsRock {
          0%, 100% { transform: rotate(0deg); }
          45%      { transform: rotate(-4deg); }
        }
        /* 말풍선 — 기합처럼 통통 */
        .ws-bubble { animation: wsShout 1.5s ease-in-out infinite; transform-origin: 142px 58px; }
        @keyframes wsShout {
          0%, 100% { transform: scale(1); }
          45%      { transform: scale(1.08) rotate(-2deg); }
        }
        /* 재생 버튼 — 은은한 펄스 */
        .ws-play { animation: wsPulse 2.2s ease-in-out infinite; transform-origin: 66px 66px; }
        @keyframes wsPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
        /* 덤벨 — 이따금 들썩 */
        .ws-bell { animation: wsHop 3s ease-in-out infinite; }
        .ws-bell2 { animation: wsHop 3s ease-in-out infinite 0.4s; }
        @keyframes wsHop {
          0%, 82%, 100% { transform: translateY(0); }
          88%           { transform: translateY(-3px); }
          94%           { transform: translateY(0.5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ws-leg, .ws-arm, .ws-torso, .ws-bubble, .ws-play, .ws-bell, .ws-bell2 { animation: none; }
        }
      `}</style>

      {/* 바닥 그림자 */}
      <ellipse cx="148" cy="146" rx="58" ry="9" fill={INK} opacity="0.12" />
      <ellipse cx="40" cy="143" rx="34" ry="7" fill={INK} opacity="0.12" />

      {/* --- 모바일 트레이너 보드 --- */}
      <rect x="36" y="86" width="7" height="52" rx="3" fill={WOOD} stroke={INK} strokeWidth="3" />
      <rect x="20" y="134" width="40" height="8" rx="4" fill={WOOD} stroke={INK} strokeWidth="3" />
      <rect x="6" y="34" width="84" height="56" rx="6" fill={WHITE} stroke={INK} strokeWidth="3.5" />
      <rect x="12" y="40" width="72" height="44" rx="3" fill={BLUE} />
      {/* 화면 속 텍스트 바 */}
      <rect x="18" y="46" width="30" height="4.5" rx="2.2" fill={WHITE} />
      <rect x="18" y="54" width="22" height="4.5" rx="2.2" fill={WHITE} />
      <rect x="18" y="66" width="26" height="4" rx="2" fill={YELLOW} />
      <rect x="18" y="73" width="34" height="4" rx="2" fill={INK} opacity="0.55" />
      {/* 재생 버튼 */}
      <g className="ws-play">
        <circle cx="66" cy="66" r="13" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <path d="M62.5 60.5 74 66l-11.5 5.5Z" fill={INK} />
      </g>

      {/* --- 덤벨 --- */}
      <g className="ws-bell">
        <path d="M16 124h13" stroke={INK} strokeWidth="4" />
        <rect x="6" y="118" width="10" height="13" rx="3" fill={TEAL} stroke={INK} strokeWidth="2.6" />
        <rect x="29" y="118" width="10" height="13" rx="3" fill={TEAL} stroke={INK} strokeWidth="2.6" />
      </g>
      <g className="ws-bell2">
        <path d="M50 134h12" stroke={INK} strokeWidth="4" />
        <rect x="41" y="129" width="9" height="11" rx="2.6" fill={TEAL} stroke={INK} strokeWidth="2.6" />
        <rect x="62" y="129" width="9" height="11" rx="2.6" fill={TEAL} stroke={INK} strokeWidth="2.6" />
      </g>

      {/* --- 운동하는 사람 (V자 복근 자세) --- */}
      {/* 뒤쪽 지지 팔 */}
      <path d="M150 130 L176 141" stroke={SKIN} strokeWidth="9" />
      {/* 다리 — 허벅지(반바지) + 정강이 + 신발 (크런치 동작) */}
      <g className="ws-leg">
        <path d="M150 130 L172 112" stroke={DARK} strokeWidth="15" />
        <path d="M172 112 L192 94" stroke={SKIN} strokeWidth="9.5" />
        <rect
          x="188"
          y="82"
          width="17"
          height="11"
          rx="4.5"
          fill={WHITE}
          stroke={INK}
          strokeWidth="2.6"
          transform="rotate(-42 196 88)"
        />
      </g>
      {/* 상체 + 머리 (살짝 들썩) */}
      <g className="ws-torso">
        {/* 상체 (빨간 티셔츠) */}
        <path d="M150 130 L131 105" stroke={RED} strokeWidth="17" />
        {/* 뻗은 팔 */}
        <g className="ws-arm">
          <path d="M136 110 L166 100" stroke={SKIN} strokeWidth="8" />
        </g>
        {/* 머리 */}
        <circle cx="126" cy="98" r="11" fill={SKIN} stroke={INK} strokeWidth="3" />
        {/* 머리카락 */}
        <path
          d="M116 94c1-7 6-11 12-10 5 .6 8 4 8 7-3-2-6-2-9-1-4 1-8 3-11 4Z"
          fill={HAIR}
          stroke={INK}
          strokeWidth="2.6"
        />
        {/* 표정 */}
        <circle cx="131" cy="99" r="1.6" fill={INK} />
        <path d="M129 103.5c1.6 1.2 3.4 1 4.6-.4" stroke={INK} strokeWidth="1.8" />
      </g>

      {/* --- 말풍선 --- */}
      {caption && (
        <g className="ws-bubble">
          <rect
            x="106"
            y="42"
            width="72"
            height="32"
            rx="12"
            fill={WHITE}
            stroke={INK}
            strokeWidth="3"
          />
          <path d="M124 72l-3 12 13-10Z" fill={WHITE} stroke={INK} strokeWidth="3" />
          <text
            x="142"
            y="63"
            textAnchor="middle"
            fontSize="16"
            fontWeight="800"
            fill={INK}
            fontFamily="'Gamja Flower', Pretendard, system-ui, sans-serif"
          >
            {caption}
          </text>
        </g>
      )}
    </svg>
  )
}
