import type { ReactNode } from 'react'
import { Heartbeat } from './Decor'

interface Props {
  title: string
  subtitle?: string
  right?: ReactNode
}

export default function PageHeader({ title, subtitle, right }: Props) {
  return (
    <header className="relative mb-1 overflow-hidden px-5 pb-4 pt-7">
      <Heartbeat
        className="pointer-events-none absolute -right-6 top-4 h-9 w-40"
        color="#efe0d1"
        opacity={0.9}
      />
      <div className="relative flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-800">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-brand-300">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}
