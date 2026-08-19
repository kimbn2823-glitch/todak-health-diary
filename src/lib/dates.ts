import { format, startOfWeek, addDays, subDays, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export const todayKey = (): string => format(new Date(), 'yyyy-MM-dd')

export const toKey = (d: Date): string => format(d, 'yyyy-MM-dd')

export const fromKey = (key: string): Date => parseISO(key)

export const shiftDay = (key: string, days: number): string =>
  toKey(days >= 0 ? addDays(fromKey(key), days) : subDays(fromKey(key), -days))

// 월요일 시작 기준 한 주의 날짜 키 7개
export const weekKeys = (anchor: string): string[] => {
  const start = startOfWeek(fromKey(anchor), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => toKey(addDays(start, i)))
}

// 최근 n일 날짜 키 (오늘 포함, 과거→현재 순)
export const lastNDays = (n: number, anchor = todayKey()): string[] =>
  Array.from({ length: n }, (_, i) => shiftDay(anchor, -(n - 1 - i)))

export const formatKorean = (key: string): string =>
  format(fromKey(key), 'M월 d일 (E)', { locale: ko })

export const formatShort = (key: string): string =>
  format(fromKey(key), 'M/d', { locale: ko })

export const weekdayShort = (key: string): string =>
  format(fromKey(key), 'E', { locale: ko })

export const isToday = (key: string): boolean => key === todayKey()
