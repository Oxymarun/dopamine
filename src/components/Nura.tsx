import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

export type NuraMode = 'idle' | 'focus' | 'break' | 'celebrate' | 'neglected'
export interface NuraRef { wiggle: () => void; celebrate: () => void }
interface NuraProps { mode: NuraMode; streak: number }

const PET_MSGS     = ['Woof! 🐾','Tail wag! 🐕','*licks your hand*','Bork!','🐾✨','Good human!','Belly rubs pls!','Awoo! 🐕']
const FOCUS_MSGS   = ['Stay hydrated! 💧','Blink your eyes! 👀',"You're amazing!",'Keep going! 🔥','Deep breath! 🌬','Still here! 🐾']
const START_MSGS   = ["Let's go! 🎯",'You got this! 💪','Focus time! 🐾',"Let's do this! 🚀",'On it! ⚡']
const BREAK_MSGS   = ['You crushed it! 🔥','Rest time! 🐾','Well done! ✨','Take a breath! 🌿','Proud of you! 🎉']
const NEGLECT_MSGS = ['Miss you... 🥺','Come back! 🐾','Anyone there? 👀']

const LABELS: Record<NuraMode, string> = {
  idle:      'Nura is waiting for you 🐾',
  focus:     'Nura is focused too 💤',
  break:     'Nura says take a break! 🐾',
  celebrate: 'Nura is SO proud of you! 🎉',
  neglected: 'Nura misses you... 🥺',
}

// Beagle palette — warm, readable
const TAN    = '#C8782E'   // golden caramel fur
const DARK   = '#3A1A06'   // warm dark brown (saddle, ears)
const CREAM  = '#FFF0D0'   // warm cream (muzzle, belly, paws)
const STROKE = '#2A1205'   // outline
const EAR_MID= '#7B3A10'   // visible mid-brown for ear depth

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function isNight(): boolean { const h = new Date().getHours(); return h >= 22 || h < 6 }

const Nura = forwardRef<NuraRef, NuraProps>(({ mode, streak }, ref) => {
  const [bubble, setBubble]             = useState('')
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [bouncing, setBouncing]         = useState(false)
  const [zoomies, setZoomies]           = useState(false)
  const [nightCap, setNightCap]         = useState(isNight())
  const bubbleTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const motivTimer   = useRef<ReturnType<typeof setInterval> | null>(null)

  function showBubble(msg: string) {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    setBubble(msg); setBubbleVisible(true)
    bubbleTimer.current = setTimeout(() => setBubbleVisible(false), 2400)
  }

  useImperativeHandle(ref, () => ({
    wiggle:    () => showBubble(rand(BREAK_MSGS)),
    celebrate: () => showBubble(rand(BREAK_MSGS)),
  }))

  useEffect(() => {
    if (mode === 'focus')                        showBubble(rand(START_MSGS))
    if (mode === 'break' || mode === 'celebrate') showBubble(rand(BREAK_MSGS))
    if (mode === 'neglected')                    showBubble(rand(NEGLECT_MSGS))
  }, [mode])

  useEffect(() => {
    if (mode !== 'focus') return
    motivTimer.current = setInterval(() => showBubble(rand(FOCUS_MSGS)), 8 * 60 * 1000)
    return () => { if (motivTimer.current) clearInterval(motivTimer.current) }
  }, [mode])

  useEffect(() => {
    const id = setInterval(() => setNightCap(isNight()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    (window as Window & { nuraZoomies?: () => void }).nuraZoomies = () => {
      showBubble('ZOOMIES!! 🌀')
      setZoomies(true)
      setTimeout(() => setZoomies(false), 1200)
    }
    return () => { delete (window as Window & { nuraZoomies?: () => void }).nuraZoomies }
  }, [])

  function petNura() {
    showBubble(rand(PET_MSGS))
    setBouncing(true)
    setTimeout(() => setBouncing(false), 900)
  }

  const modeClass   = bouncing ? 'nura-break' : `nura-${mode}`
  const eyeLidRy    = mode === 'focus' ? 13 : 0
  const isNeglected = mode === 'neglected'
  const isCelebrate = mode === 'celebrate'
  const isFocus     = mode === 'focus'
  const showCollar  = streak >= 3
  const showBandana = streak >= 7
  const showCrown   = streak >= 30

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <style>{`
        .nura-idle      .nura-tail { animation: nura-tail-idle 2s ease-in-out infinite }
        .nura-idle      .nura-body { animation: nura-bob     3.2s ease-in-out infinite }
        .nura-focus     .nura-tail { animation: nura-tail-slow 7s ease-in-out infinite }
        .nura-focus     .nura-body { animation: nura-breathe 4.5s ease-in-out infinite }
        .nura-break     .nura-tail { animation: nura-tail-fast 0.4s ease-in-out infinite }
        .nura-break     .nura-body { animation: nura-bounce  0.55s ease-in-out infinite }
        .nura-celebrate .nura-tail { animation: nura-tail-fast 0.28s ease-in-out infinite }
        .nura-celebrate .nura-body { animation: nura-jump    0.42s ease-in-out 5 }
        .nura-neglected .nura-tail { animation: nura-tail-sad 5s ease-in-out infinite }
        .nura-neglected .nura-body { animation: nura-sag     6s ease-in-out infinite }

        .nura-zzz              { opacity:0; transition:opacity .6s }
        .nura-zzz.show         { opacity:1; animation:nura-zzz-rise 2.8s ease-in-out infinite }
        .nura-hearts           { opacity:0; pointer-events:none }
        .nura-hearts.show      { opacity:1; animation:nura-hearts-rise 2s ease-out forwards }
        .nura-tear             { animation:nura-tear-drip 2.2s ease-in-out infinite }
        .nura-svg.nura-zoomies { animation:nura-zoomies 1.1s ease-in-out }

        .nura-tail { transform-box:fill-box; transform-origin:10% 80% }
        .nura-body { transform-box:fill-box; transform-origin:50% 100% }

        @keyframes nura-tail-idle    { 0%,100%{transform:rotate(-5deg)}  50%{transform:rotate(18deg)} }
        @keyframes nura-tail-slow    { 0%,100%{transform:rotate(0deg)}   50%{transform:rotate(8deg)} }
        @keyframes nura-tail-fast    { 0%,100%{transform:rotate(-14deg)} 50%{transform:rotate(28deg)} }
        @keyframes nura-tail-sad     { 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(-4deg)} }
        @keyframes nura-bob          { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-2px)} }
        @keyframes nura-breathe      { 0%,100%{transform:scaleY(1)}      50%{transform:scaleY(1.02)} }
        @keyframes nura-bounce       { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-6px)} }
        @keyframes nura-jump         { 0%,100%{transform:translateY(0)}  40%{transform:translateY(-12px)} }
        @keyframes nura-sag          { 0%,100%{transform:translateY(0)}  50%{transform:translateY(3px)} }
        @keyframes nura-tear-drip    { 0%,100%{transform:translateY(0)}  50%{transform:translateY(5px)} }
        @keyframes nura-zzz-rise     { 0%{transform:translateY(0);opacity:.5} 50%{transform:translateY(-7px);opacity:1} 100%{transform:translateY(0);opacity:.5} }
        @keyframes nura-hearts-rise  { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-20px);opacity:0} }
        @keyframes nura-zoomies      { 0%{transform:translateX(0) scaleX(1)} 22%{transform:translateX(42px) scaleX(-1)} 50%{transform:translateX(-42px) scaleX(1)} 75%{transform:translateX(28px) scaleX(-1)} 100%{transform:translateX(0) scaleX(1)} }
      `}</style>

      <div
        className={`relative flex flex-col items-center cursor-pointer ${modeClass}`}
        onClick={petNura}
        title="Pet Nura!"
      >
        {/* Speech bubble */}
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[9px] whitespace-nowrap pointer-events-none z-10 transition-opacity duration-200"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            opacity: bubbleVisible ? 1 : 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}
        >
          {bubble}
        </div>

        {/* ── SVG ─────────────────────────────────────────────────────── */}
        {/*
          ViewBox 0 0 130 126
          Head:  cx=65 cy=52 r=36  (big chibi head, tan face dominant)
          Body:  small ellipse below
          Ears:  visible floppy paths, two-tone (dark outside, mid-brown inner stripe)
          Saddle: SMALL — just the crown of the head, not half the face
        */}
        <svg
          className={`nura-svg${zoomies ? ' nura-zoomies' : ''}`}
          viewBox="0 0 130 126"
          width="108"
          height="105"
          overflow="visible"
        >
          {/* ZZZ */}
          <g className={`nura-zzz${isFocus ? ' show' : ''}`}>
            <text x="102" y="36" fontSize="9"  fill="#7B61FF" fontWeight="800" fontFamily="system-ui">z</text>
            <text x="112" y="24" fontSize="11" fill="#7B61FF" fontWeight="800" fontFamily="system-ui" opacity={0.75}>z</text>
            <text x="123" y="12" fontSize="13" fill="#7B61FF" fontWeight="800" fontFamily="system-ui" opacity={0.5}>z</text>
          </g>

          {/* Hearts */}
          <g className={`nura-hearts${isCelebrate ? ' show' : ''}`}>
            <text x="8"   y="48" fontSize="12">❤️</text>
            <text x="102" y="36" fontSize="10">💛</text>
            <text x="52"  y="12" fontSize="10">❤️</text>
          </g>

          {/* Shadow */}
          <ellipse cx="65" cy="122" rx="24" ry="4" fill="rgba(0,0,0,0.18)" />

          {/* Tail */}
          <g className="nura-tail">
            <path d="M 90,96 Q 112,80 106,58" stroke={STROKE} strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 90,96 Q 112,80 106,58" stroke={TAN}    strokeWidth="6"  fill="none" strokeLinecap="round" />
            <circle cx="106" cy="58" r="6" fill={CREAM} stroke={STROKE} strokeWidth="1.5" />
          </g>

          {/* ── MAIN BODY GROUP ─────────────────────────────────────── */}
          <g className="nura-body">

            {/* Body */}
            <ellipse cx="65" cy="104" rx="26" ry="16" fill={TAN}   stroke={STROKE} strokeWidth="2.2" />
            {/* Body saddle */}
            <ellipse cx="65" cy="94"  rx="22" ry="11" fill={DARK} />
            {/* Belly */}
            <ellipse cx="65" cy="106" rx="16" ry="10" fill={CREAM} stroke={STROKE} strokeWidth="1.5" />

            {/* Paws */}
            <ellipse cx="48" cy="116" rx="9" ry="5.5" fill={TAN}   stroke={STROKE} strokeWidth="1.8" />
            <ellipse cx="48" cy="118" rx="6" ry="3.5" fill={CREAM} />
            <ellipse cx="82" cy="116" rx="9" ry="5.5" fill={TAN}   stroke={STROKE} strokeWidth="1.8" />
            <ellipse cx="82" cy="118" rx="6" ry="3.5" fill={CREAM} />

            {/* ── LEFT EAR
                Two-tone: dark outer shell + visible mid-brown inner stripe
                Renders before head so head circle sits on top of ear root ── */}
            {/* Outer ear (dark, but visible against bg via stroke) */}
            <path
              d="M 34,34 C 16,46 10,76 20,104 C 24,112 38,112 42,104 C 46,94 44,56 36,30 Z"
              fill={DARK} stroke="#6B3418" strokeWidth="1.5" strokeLinejoin="round"
            />
            {/* Inner ear stripe (mid-brown — gives depth) */}
            <path
              d="M 34,42 C 22,56 18,82 26,104 C 30,110 38,108 40,102 C 42,90 40,62 34,42 Z"
              fill={EAR_MID} opacity={0.7}
            />

            {/* ── RIGHT EAR ── */}
            <path
              d="M 96,34 C 114,46 120,76 110,104 C 106,112 92,112 88,104 C 84,94 86,56 94,30 Z"
              fill={DARK} stroke="#6B3418" strokeWidth="1.5" strokeLinejoin="round"
            />
            <path
              d="M 96,42 C 108,56 112,82 104,104 C 100,110 92,108 90,102 C 88,90 90,62 96,42 Z"
              fill={EAR_MID} opacity={0.7}
            />

            {/* ── HEAD ────────────────────────────────────────────────── */}
            {/* Full head — tan, ears render behind this */}
            <circle cx="65" cy="52" r="36" fill={TAN} stroke={STROKE} strokeWidth="2.2" />

            {/* Crown saddle — SMALL, just the top cap, tan face stays visible */}
            <path
              d="M 38,44 Q 40,16 65,16 Q 90,16 92,44 Q 82,36 65,34 Q 48,36 38,44 Z"
              fill={DARK}
            />

            {/* ── MUZZLE ─────────────────────────────────────────── */}
            <ellipse cx="65" cy="66" rx="18" ry="12" fill={CREAM} stroke={STROKE} strokeWidth="1.8" />

            {/* ── NOSE ──────────────────────────────────────────── */}
            <path d="M 58,60 Q 65,57 72,60 Q 72,67 65,68 Q 58,67 58,60 Z" fill={STROKE} />
            <ellipse cx="61" cy="61" rx="2.5" ry="1.5" fill="white" opacity={0.38} />

            {/* ── MOUTH ─────────────────────────────────────────── */}
            <path d="M 58,72 Q 65,78 72,72" stroke={STROKE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 65,68 L 65,72"        stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />

            {/* ── LEFT EYE ──────────────────────────────────────── */}
            <circle cx="51" cy="46" r="11.5" fill="white" stroke={STROKE} strokeWidth="2" />
            <circle cx="51" cy="46" r="8"    fill="#3D1E00" />
            <circle cx="51" cy="46" r="4.5"  fill="#0D0500" />
            <circle cx="55" cy="42" r="3.8"  fill="white" />
            <circle cx="47" cy="50" r="1.5"  fill="white" opacity={0.5} />
            {/* Eyelid — closes in focus mode */}
            <ellipse cx="51" cy="46" rx="11.5" ry={eyeLidRy} fill={TAN} style={{ transition: 'ry 0.5s ease' }} />

            {/* ── RIGHT EYE ─────────────────────────────────────── */}
            <circle cx="79" cy="46" r="11.5" fill="white" stroke={STROKE} strokeWidth="2" />
            <circle cx="79" cy="46" r="8"    fill="#3D1E00" />
            <circle cx="79" cy="46" r="4.5"  fill="#0D0500" />
            <circle cx="83" cy="42" r="3.8"  fill="white" />
            <circle cx="75" cy="50" r="1.5"  fill="white" opacity={0.5} />
            <ellipse cx="79" cy="46" rx="11.5" ry={eyeLidRy} fill={TAN} style={{ transition: 'ry 0.5s ease' }} />

            {/* Cheeks */}
            <ellipse cx="34" cy="60" rx="8" ry="5.5" fill="#E05838" opacity={0.2} />
            <ellipse cx="96" cy="60" rx="8" ry="5.5" fill="#E05838" opacity={0.2} />

            {/* Sad brows — neglected */}
            <path d="M 42,34 Q 51,30 58,32" stroke={STROKE} strokeWidth="2.2" fill="none" strokeLinecap="round"
              opacity={isNeglected ? 1 : 0} style={{ transition: 'opacity 0.4s' }} />
            <path d="M 88,34 Q 79,30 72,32" stroke={STROKE} strokeWidth="2.2" fill="none" strokeLinecap="round"
              opacity={isNeglected ? 1 : 0} style={{ transition: 'opacity 0.4s' }} />

            {/* Tears — neglected */}
            <ellipse cx="42" cy="58" rx="2.8" ry="5" fill="#74B9FF"
              opacity={isNeglected ? 0.85 : 0} className={isNeglected ? 'nura-tear' : ''}
              style={{ transition: 'opacity 0.5s' }} />
            <ellipse cx="88" cy="58" rx="2.8" ry="5" fill="#74B9FF"
              opacity={isNeglected ? 0.85 : 0} className={isNeglected ? 'nura-tear' : ''}
              style={{ transition: 'opacity 0.5s' }} />

            {/* ── ACCESSORIES ─────────────────────────────────── */}

            {/* Collar (streak ≥ 3) */}
            {showCollar && !showBandana && <>
              <rect x="46" y="82" width="38" height="8" rx="4" fill="#D42828" stroke={STROKE} strokeWidth="1.5" />
              <circle cx="65" cy="90" r="4" fill="#F0A010" stroke={STROKE} strokeWidth="1.2" />
            </>}

            {/* Bandana (streak ≥ 7) */}
            {showBandana && !showCrown && (
              <path d="M 48,84 L 82,84 L 65,104 Z"
                fill="#E07018" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
            )}

            {/* Crown (streak ≥ 30) */}
            {showCrown && <g>
              <rect x="46" y="8"  width="38" height="11" rx="3" fill="#F0C018" stroke={STROKE} strokeWidth="1.5" />
              <polygon points="46,8 53,1 60,8"  fill="#F0C018" stroke={STROKE} strokeWidth="1.2" />
              <polygon points="58,8 65,2 72,8"  fill="#F0C018" stroke={STROKE} strokeWidth="1.2" />
              <polygon points="70,8 77,1 84,8"  fill="#F0C018" stroke={STROKE} strokeWidth="1.2" />
              <circle cx="53" cy="8" r="2.5" fill="#E02828" />
              <circle cx="65" cy="4" r="2.5" fill="#E02828" />
              <circle cx="77" cy="8" r="2.5" fill="#E02828" />
            </g>}

            {/* Night cap */}
            {nightCap && <g>
              <polygon points="44,22 86,22 76,-6" fill="#5B8DD9" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="42" y="17" width="46" height="9" rx="4.5" fill="white" stroke={STROKE} strokeWidth="1.5" />
              <circle cx="76" cy="-6" r="5.5" fill="white" stroke={STROKE} strokeWidth="1.5" />
              <text x="50" y="18" fontSize="6.5" fill="#5B8DD9" fontWeight="700" fontFamily="system-ui">★ ★</text>
            </g>}

          </g>{/* end nura-body */}
        </svg>

        <p className="text-[9px] text-text-muted uppercase tracking-wider text-center">
          {LABELS[mode]}
        </p>
      </div>
    </div>
  )
})

Nura.displayName = 'Nura'
export default Nura
