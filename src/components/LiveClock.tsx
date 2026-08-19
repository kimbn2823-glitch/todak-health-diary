import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * 현재 날짜와 시각을 1초마다 갱신해 보여준다.
 * 자정을 넘겨도 날짜가 자동으로 바뀐다.
 */
export default function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // 다음 '초'가 시작되는 시점에 맞춰 시작해 초 단위가 튀지 않게 한다.
    let interval: number | undefined
    const timeout = window.setTimeout(
      () => {
        setNow(new Date())
        interval = window.setInterval(() => setNow(new Date()), 1000)
      },
      1000 - (Date.now() % 1000)
    )
    return () => {
      window.clearTimeout(timeout)
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [])

  return (
    <div className="mb-3 flex items-center justify-between border-b border-white/20 pb-2.5">
      <span className="text-[13px] font-semibold text-white">
        📅 {format(now, 'yyyy년 M월 d일', { locale: ko })}
        <span className="ml-1 text-ocean-100">({format(now, 'EEEE', { locale: ko })})</span>
      </span>
      <span className="text-[13px] font-bold tabular-nums text-white">
        🕐 {format(now, 'a h:mm:ss', { locale: ko })}
      </span>
    </div>
  )
}
