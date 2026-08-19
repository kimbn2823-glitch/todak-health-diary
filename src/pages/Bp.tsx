import { useLiveQuery } from 'dexie-react-hooks'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from 'recharts'
import { db } from '../db/db'
import type { BpLog } from '../types'
import { classifyBp } from '../lib/bp'
import { formatShort, formatKorean } from '../lib/dates'
import PageHeader from '../components/PageHeader'
import BpCard from '../components/BpCard'

export default function Bp() {
  const logs = useLiveQuery(() => db.bpLogs.toArray(), [], [] as BpLog[])
  const sorted = [...(logs ?? [])].sort((a, b) => a.createdAt - b.createdAt)

  // 차트: 최근 14회 측정
  const chartData = sorted.slice(-14).map((l) => ({
    label: `${formatShort(l.date)} ${l.time}`,
    수축기: l.systolic,
    이완기: l.diastolic,
  }))

  const history = [...sorted].reverse()

  const remove = async (id?: number) => {
    if (id != null) await db.bpLogs.delete(id)
  }

  return (
    <div>
      <PageHeader title="🩺 혈압 관리" subtitle="꾸준한 측정이 혈관 건강의 시작이에요" />

      {/* 최근 측정 + 기록 입력 (홈 카드 재사용) */}
      <div className="-mt-2">
        <BpCard />
      </div>

      {/* 추이 차트 */}
      {chartData.length >= 2 && (
        <div className="mx-5 mt-4 card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-brand-800">📈 혈압 추이</p>
            <span className="text-xs text-brand-300">최근 {chartData.length}회</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={chartData} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f7ece1" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#93a9da' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[40, 180]}
                ticks={[60, 80, 100, 120, 140, 160]}
                tick={{ fontSize: 11, fill: '#93a9da' }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(v: number, name: string) => [`${v} mmHg`, name]}
                contentStyle={{ borderRadius: 12, border: '1px solid #efe0d1', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {/* 고혈압 기준선 */}
              <ReferenceLine y={140} stroke="#f5604a" strokeDasharray="5 4" />
              <ReferenceLine y={90} stroke="#ffa152" strokeDasharray="5 4" />
              <Line
                type="monotone"
                dataKey="수축기"
                stroke="#f5604a"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f5604a' }}
              />
              <Line
                type="monotone"
                dataKey="이완기"
                stroke="#5b8fd4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#5b8fd4' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-1 text-center text-[11px] text-brand-300">
            점선: 고혈압 기준 (수축기 140 · 이완기 90 mmHg)
          </p>
        </div>
      )}

      {/* 전체 기록 */}
      {history.length > 0 && (
        <div className="mx-5 my-4">
          <p className="mb-2 text-sm font-bold text-brand-800">📋 전체 기록 ({history.length}회)</p>
          <div className="card divide-y divide-cream-200 p-1">
            {history.map((l) => {
              const c = classifyBp(l.systolic, l.diastolic)
              return (
                <div key={l.id} className="flex items-center justify-between px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-700">
                      {formatKorean(l.date)} {l.time}
                      {l.source === '워치' && ' ⌚'}
                    </p>
                    {l.pulse != null && (
                      <p className="text-xs text-brand-300">맥박 {l.pulse}회/분</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="font-bold tabular-nums text-brand-800">
                      {l.systolic}/{l.diastolic}
                    </span>
                    <span className={`chip ${c.chip}`}>{c.label}</span>
                    <button
                      onClick={() => remove(l.id)}
                      className="text-cream-400 hover:text-coral-500"
                      aria-label="삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="px-8 pb-4 text-center text-[11px] leading-relaxed text-brand-300">
        분류는 대한고혈압학회 기준의 참고용이며 의료 진단이 아닙니다.
        <br />
        높은 수치가 반복되면 병원에서 정확한 측정을 받아보세요.
      </p>
    </div>
  )
}
