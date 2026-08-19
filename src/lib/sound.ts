// 🔔 앱 시작 인사 소리 — 오디오 파일 없이 Web Audio로 직접 합성한다.
// 브라우저 자동재생 정책: 사용자가 화면을 터치하기 전에는 소리가 차단될 수 있어
// «열자마자 시도 → 차단되면 첫 터치 때 재생» 순서로 동작한다.

const STORAGE_KEY = 'todak-sound'

export const isSoundOn = (): boolean => localStorage.getItem(STORAGE_KEY) !== '0'

export const setSoundOn = (on: boolean): void => {
  localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
}

let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

/** 부드러운 종소리 음 하나 */
function chime(c: AudioContext, freq: number, start: number, dur: number, vol: number) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  // 살짝 반짝이는 배음
  const osc2 = c.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2
  const gain2 = c.createGain()
  gain2.gain.value = 0.25

  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(vol, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur)

  osc.connect(gain)
  osc2.connect(gain2)
  gain2.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc2.start(start)
  osc.stop(start + dur + 0.05)
  osc2.stop(start + dur + 0.05)
}

/** 통통 튀는 짧은 멜로디 음 (경쾌한 톤) */
function bounce(c: AudioContext, freq: number, start: number, dur: number, vol: number) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(vol, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

/**
 * 토닥토닥 인사 징글 — 경쾌한 팡파레 (약 1.2초)
 * "솔도미솔~ 라솔 도~!" 밝은 장조 멜로디
 */
export function playGreeting(): void {
  if (!isSoundOn()) return
  const c = ensureCtx()
  if (!c || c.state !== 'running') return
  const t = c.currentTime + 0.03

  // 멜로디 (통통 튀는 톤)
  bounce(c, 392.0, t + 0.0, 0.14, 0.1) // G4
  bounce(c, 523.25, t + 0.11, 0.14, 0.1) // C5
  bounce(c, 659.25, t + 0.22, 0.14, 0.1) // E5
  bounce(c, 783.99, t + 0.33, 0.2, 0.11) // G5
  bounce(c, 880.0, t + 0.52, 0.12, 0.09) // A5
  bounce(c, 783.99, t + 0.63, 0.12, 0.09) // G5
  bounce(c, 1046.5, t + 0.76, 0.45, 0.12) // C6 (피날레)

  // 피날레 화음 — 반짝이는 종소리 톤
  chime(c, 659.25, t + 0.76, 0.45, 0.05) // E5
  chime(c, 1318.5, t + 0.82, 0.4, 0.035) // E6 스파클
  chime(c, 261.63, t + 0.76, 0.5, 0.06) // C4 받침음
}

// 숨소리용 노이즈 버퍼 (한 번만 생성해 재사용)
let noiseBuf: AudioBuffer | null = null
function getNoise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

/**
 * 아기 강아지 «앙!» — 실제 강아지 발성 구조를 흉내 낸 합성음.
 * 성대(피치가 훅 뒤집힘) + 입 공명(포먼트 2겹) + 숨소리(노이즈)로 구성.
 * 매번 음정이 살짝 달라져 반복해도 생동감 있게 들린다.
 */
function bark(c: AudioContext, start: number, vol: number, pitchMul = 1) {
  const p = pitchMul * (0.95 + Math.random() * 0.1) // ±5% 랜덤 음정

  // ① 성대: 짧게 "앙" — 음정이 급히 올라갔다 뚝 떨어짐
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(450 * p, start)
  osc.frequency.exponentialRampToValueAtTime(950 * p, start + 0.022)
  osc.frequency.exponentialRampToValueAtTime(320 * p, start + 0.085)

  // ② 입 모양 공명 — "아→우"로 닫히는 느낌 (포먼트 2겹)
  const f1 = c.createBiquadFilter()
  f1.type = 'bandpass'
  f1.frequency.setValueAtTime(1100 * p, start)
  f1.frequency.exponentialRampToValueAtTime(550 * p, start + 0.09)
  f1.Q.value = 1.6
  const f2 = c.createBiquadFilter()
  f2.type = 'bandpass'
  f2.frequency.setValueAtTime(2400 * p, start)
  f2.frequency.exponentialRampToValueAtTime(1200 * p, start + 0.09)
  f2.Q.value = 3.5
  const f2gain = c.createGain()
  f2gain.gain.value = 0.6

  const voice = c.createGain()
  voice.gain.setValueAtTime(0, start)
  voice.gain.linearRampToValueAtTime(vol, start + 0.008)
  voice.gain.setValueAtTime(vol, start + 0.05)
  voice.gain.exponentialRampToValueAtTime(0.001, start + 0.11)

  // ③ 숨소리 — 짖기 시작의 "흡" 하는 공기 소리
  const noise = c.createBufferSource()
  noise.buffer = getNoise(c)
  const nf = c.createBiquadFilter()
  nf.type = 'bandpass'
  nf.frequency.value = 1600 * p
  nf.Q.value = 0.8
  const ng = c.createGain()
  ng.gain.setValueAtTime(vol * 0.5, start)
  ng.gain.exponentialRampToValueAtTime(0.001, start + 0.05)

  osc.connect(f1)
  osc.connect(f2)
  f2.connect(f2gain)
  f1.connect(voice)
  f2gain.connect(voice)
  voice.connect(c.destination)
  noise.connect(nf)
  nf.connect(ng)
  ng.connect(c.destination)

  osc.start(start)
  osc.stop(start + 0.13)
  noise.start(start)
  noise.stop(start + 0.06)
}

/** 버튼 효과음 — 귀여운 강아지 «멍!» */
export function playTick(): void {
  if (!isSoundOn()) return
  const c = ensureCtx()
  if (!c) return
  if (c.state !== 'running') {
    // 클릭은 사용자 제스처이므로 여기서 재개 가능. 소리는 다음 클릭부터.
    c.resume().catch(() => {})
    return
  }
  // 인사음 직후에는 겹치지 않게 생략
  if (Date.now() - greetedAt < 800) return
  bark(c, c.currentTime, 0.09)
}

/** «멍멍!» 두 번 짖기 — 소리 미리 듣기용 */
export function playBarkTwice(): void {
  if (!isSoundOn()) return
  const c = ensureCtx()
  if (!c || c.state !== 'running') return
  const t = c.currentTime
  bark(c, t, 0.09)
  bark(c, t + 0.2, 0.08)
}

/** 모든 버튼·탭 클릭에 터치음을 붙인다 (이벤트 위임, 한 번만 등록). */
let buttonSoundsInit = false
export function initButtonSounds(): void {
  if (buttonSoundsInit) return
  buttonSoundsInit = true
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target as Element | null
      if (el?.closest?.('button, a')) playTick()
    },
    { capture: true }
  )
}

let greeted = false
let greetedAt = 0

/** 앱 시작 시 한 번만 인사음을 울린다 (차단 시 첫 상호작용에서). */
export function initGreetingSound(): void {
  if (greeted || !isSoundOn()) return
  const c = ensureCtx()
  if (!c) return

  const tryPlay = () => {
    if (greeted) return
    if (c.state === 'running') {
      greeted = true
      greetedAt = Date.now()
      playGreeting()
    }
  }

  // 1차 시도: 정책이 허용하면 즉시 재생
  c.resume()
    .then(tryPlay)
    .catch(() => {})

  // 차단됐다면 첫 터치·키 입력에서 재생
  const onFirstInteract = () => {
    window.removeEventListener('pointerdown', onFirstInteract)
    window.removeEventListener('keydown', onFirstInteract)
    c.resume()
      .then(tryPlay)
      .catch(() => {})
  }
  window.addEventListener('pointerdown', onFirstInteract, { once: true })
  window.addEventListener('keydown', onFirstInteract, { once: true })
}
