// 운동별 MET(대사당량) 데이터
// MET는 안정 시 대비 에너지 소비 배수로, 소모 칼로리 계산의 표준 지표입니다.
// 출처: Compendium of Physical Activities의 통용값을 반올림해 사용.

export type ExerciseCategory = '유산소' | '근력' | '스포츠' | '생활' | '이완'

export interface Exercise {
  id: string
  name: string
  emoji: string
  met: number
  category: ExerciseCategory
  /** 집·실내에서 장비 없이 가능한지 (접근성 높은 운동 우선 추천용) */
  easy: boolean
  desc: string
}

export const EXERCISES: Exercise[] = [
  // 유산소
  { id: 'walk-slow', name: '천천히 걷기', emoji: '🚶', met: 2.8, category: '유산소', easy: true, desc: '시속 3km 산책' },
  { id: 'walk', name: '걷기', emoji: '🚶‍♀️', met: 3.5, category: '유산소', easy: true, desc: '시속 5km 보통 걸음' },
  { id: 'walk-fast', name: '빠르게 걷기', emoji: '🏃‍♀️', met: 5.0, category: '유산소', easy: true, desc: '시속 6.5km 파워워킹' },
  { id: 'jog', name: '조깅', emoji: '🏃', met: 8.0, category: '유산소', easy: true, desc: '시속 8km' },
  { id: 'run', name: '달리기', emoji: '🏃‍♂️', met: 10.0, category: '유산소', easy: true, desc: '시속 10km' },
  { id: 'bike', name: '자전거', emoji: '🚴', met: 6.8, category: '유산소', easy: false, desc: '평지 보통 속도' },
  { id: 'bike-fast', name: '자전거(빠르게)', emoji: '🚴‍♂️', met: 10.0, category: '유산소', easy: false, desc: '시속 20km 이상' },
  { id: 'swim', name: '수영', emoji: '🏊', met: 8.3, category: '유산소', easy: false, desc: '자유형 보통 속도' },
  { id: 'hike', name: '등산', emoji: '🥾', met: 7.0, category: '유산소', easy: false, desc: '완만한 산길' },
  { id: 'stairs', name: '계단 오르기', emoji: '🪜', met: 8.0, category: '유산소', easy: true, desc: '엘리베이터 대신' },
  { id: 'jumprope', name: '줄넘기', emoji: '🪢', met: 11.0, category: '유산소', easy: true, desc: '보통 속도' },
  { id: 'dance', name: '댄스·에어로빅', emoji: '💃', met: 6.5, category: '유산소', easy: true, desc: '신나게 몸풀기' },

  // 근력
  { id: 'home-training', name: '홈트레이닝', emoji: '🤸', met: 5.5, category: '근력', easy: true, desc: '맨몸 운동 위주' },
  { id: 'weight', name: '웨이트 트레이닝', emoji: '🏋️', met: 5.0, category: '근력', easy: false, desc: '기구 사용 근력운동' },
  { id: 'core', name: '복근 운동', emoji: '💪', met: 4.5, category: '근력', easy: true, desc: '플랭크·크런치' },
  { id: 'squat', name: '스쿼트', emoji: '🦵', met: 5.5, category: '근력', easy: true, desc: '하체 집중' },
  { id: 'pilates', name: '필라테스', emoji: '🧎', met: 3.0, category: '근력', easy: true, desc: '코어 안정화' },

  // 스포츠
  { id: 'badminton', name: '배드민턴', emoji: '🏸', met: 5.5, category: '스포츠', easy: false, desc: '가볍게 랠리' },
  { id: 'tabletennis', name: '탁구', emoji: '🏓', met: 4.0, category: '스포츠', easy: false, desc: '실내 라켓 운동' },
  { id: 'tennis', name: '테니스', emoji: '🎾', met: 7.3, category: '스포츠', easy: false, desc: '단식 경기' },
  { id: 'soccer', name: '축구', emoji: '⚽', met: 7.0, category: '스포츠', easy: false, desc: '동호회 경기' },
  { id: 'basketball', name: '농구', emoji: '🏀', met: 6.5, category: '스포츠', easy: false, desc: '하프코트 경기' },
  { id: 'golf', name: '골프', emoji: '⛳', met: 4.8, category: '스포츠', easy: false, desc: '카트 없이 라운딩' },

  // 생활
  { id: 'housework', name: '집안일', emoji: '🧹', met: 3.3, category: '생활', easy: true, desc: '청소·정리' },
  { id: 'shopping', name: '장보기', emoji: '🛒', met: 3.0, category: '생활', easy: true, desc: '걸어서 장보기' },
  { id: 'gardening', name: '정원 가꾸기', emoji: '🪴', met: 3.8, category: '생활', easy: false, desc: '화단·텃밭 손질' },

  // 이완
  { id: 'yoga', name: '요가', emoji: '🧘', met: 2.5, category: '이완', easy: true, desc: '기본 자세 위주' },
  { id: 'stretch', name: '스트레칭', emoji: '🙆', met: 2.3, category: '이완', easy: true, desc: '자기 전 몸풀기' },
]

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  '유산소',
  '근력',
  '스포츠',
  '생활',
  '이완',
]
