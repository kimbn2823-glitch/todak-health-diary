import { useState, useSyncExternalStore } from 'react'
import {
  disableSync,
  enableSync,
  getSyncId,
  getSyncStatus,
  isSyncOn,
  isValidSyncId,
  subscribeSyncStatus,
  syncNow,
} from '../lib/cloudSync'

// ☁️ 설정 화면의 클라우드 동기화 카드
export default function CloudSyncCard() {
  const status = useSyncExternalStore(subscribeSyncStatus, getSyncStatus)
  const [on, setOn] = useState(isSyncOn())
  const [linkMode, setLinkMode] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const code = getSyncId()

  const toggle = async () => {
    if (on) {
      disableSync()
      setOn(false)
      return
    }
    setBusy(true)
    try {
      // 이미 발급받은 코드가 있으면 그대로 다시 쓴다.
      await enableSync(code ?? undefined)
      setOn(true)
    } finally {
      setBusy(false)
    }
  }

  const linkDevice = async () => {
    const v = codeInput.trim().toUpperCase()
    if (!isValidSyncId(v)) {
      alert('코드 형식이 올바르지 않아요. 예: TODAK-3F7K-9Q2M-X8PL')
      return
    }
    if (
      !confirm(
        '입력한 코드의 기록과 이 기기의 기록을 하나로 합칩니다.\n계속할까요?'
      )
    )
      return
    setBusy(true)
    try {
      await enableSync(v)
      setOn(true)
      setLinkMode(false)
      setCodeInput('')
    } finally {
      setBusy(false)
    }
  }

  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 클립보드가 막힌 환경 — 코드가 화면에 보이므로 직접 적으면 된다 */
    }
  }

  const statusLine = () => {
    if (!on) return null
    if (status.state === 'syncing') return <p className="mt-2 text-xs text-brand-400">동기화 중…</p>
    if (status.state === 'error')
      return <p className="mt-2 text-xs text-coral-600">⚠️ {status.message}</p>
    if (status.state === 'no-server')
      return (
        <p className="mt-2 text-xs text-mango-600">
          이 주소에는 동기화 서버가 없어요. Vercel에 배포된 주소에서 열면 자동으로 동작합니다.
        </p>
      )
    if (status.lastSyncAt)
      return (
        <p className="mt-2 text-xs text-ocean-600">
          ✓ 마지막 동기화 {new Date(status.lastSyncAt).toLocaleTimeString('ko-KR')}
        </p>
      )
    return null
  }

  return (
    <div className="mx-5 mb-4 card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-brand-800">☁️ 클라우드 동기화</p>
          <p className="mt-0.5 text-xs text-brand-400">
            기록을 서버에 보관하고 PC·휴대폰에서 이어서 써요
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          aria-label="클라우드 동기화 켜기/끄기"
          className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-ocean-500' : 'bg-cream-300'}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
              on ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {on && code && (
        <>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex-1 rounded-xl bg-cream-100 px-3 py-2 text-center font-mono text-sm font-bold tracking-wide text-brand-800">
              {code}
            </span>
            <button
              onClick={copyCode}
              className="rounded-xl bg-cream-200 px-3 py-2 text-xs font-semibold text-brand-600 hover:bg-cream-300"
            >
              {copied ? '✓ 복사됨' : '복사'}
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-brand-300">
            이 코드가 내 기록의 열쇠예요. 다른 기기(휴대폰 등)의 설정에서 같은 코드를 입력하면
            기록이 이어집니다. 다른 사람에게는 알려주지 마세요.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => void syncNow()}
              className="flex-1 rounded-xl bg-cream-100 py-2 text-xs font-semibold text-brand-600 hover:bg-cream-200"
            >
              지금 동기화
            </button>
            <button
              onClick={() => setLinkMode((v) => !v)}
              className="flex-1 rounded-xl bg-cream-100 py-2 text-xs font-semibold text-brand-600 hover:bg-cream-200"
            >
              다른 기기 코드 입력
            </button>
          </div>
        </>
      )}

      {on && linkMode && (
        <div className="mt-2 flex gap-2">
          <input
            className="input flex-1 font-mono text-sm uppercase"
            placeholder="TODAK-XXXX-XXXX-XXXX"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <button
            onClick={linkDevice}
            disabled={busy}
            className="rounded-xl bg-ocean-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            연결
          </button>
        </div>
      )}

      {statusLine()}
    </div>
  )
}
