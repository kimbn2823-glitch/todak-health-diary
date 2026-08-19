// 캐릭터 일러스트 — 실제 SVG 이미지 파일을 불러와 쓴다 (src/assets/characters)
import stretch from '../assets/characters/stretch.svg'
import cheer from '../assets/characters/cheer.svg'
import healthyMeal from '../assets/characters/healthy-meal.svg'
import weighIn from '../assets/characters/weigh-in.svg'
import takeMedicine from '../assets/characters/take-medicine.svg'
import celebrate from '../assets/characters/celebrate.svg'
import writeLog from '../assets/characters/write-log.svg'
import sleeping from '../assets/characters/sleeping.svg'

export const CHARACTER_SRC = {
  stretch,
  cheer,
  healthyMeal,
  weighIn,
  takeMedicine,
  celebrate,
  writeLog,
  sleeping,
} as const

export type CharacterName = keyof typeof CHARACTER_SRC

const ALT: Record<CharacterName, string> = {
  stretch: '스트레칭하는 캐릭터',
  cheer: '응원하는 캐릭터',
  healthyMeal: '건강한 식사를 든 캐릭터',
  weighIn: '체중을 재는 캐릭터',
  takeMedicine: '약을 챙겨 먹는 캐릭터',
  celebrate: '축하하는 캐릭터',
  writeLog: '식단을 기록하는 캐릭터',
  sleeping: '잠자는 캐릭터',
}

interface Props {
  name: CharacterName
  size?: number
  className?: string
}

export default function Character({ name, size = 120, className = '' }: Props) {
  return (
    <img
      src={CHARACTER_SRC[name]}
      alt={ALT[name]}
      width={size}
      height={Math.round((size * 170) / 120)}
      className={className}
    />
  )
}
