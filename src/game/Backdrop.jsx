import Icon from './Icon'

// Painted night scene behind every screen. The sky shifts with the phase.
const SKIES = {
  lobby: ['#0d0b1e', '#2a1f4a', '#6b3a5a'],
  forge: ['#140a10', '#3a1a1a', '#b0502a'],
  battle: ['#0d0b1e', '#1a1428', '#2a1a2a'],
  loot: ['#140d24', '#3a2350', '#a0583a'],
  victory: ['#1a1408', '#5a3a14', '#e0a040'],
  defeat: ['#0a0a12', '#1a1424', '#3a2a3a'],
}

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 97) % 1600,
  y: (i * 53) % 420,
  r: (i % 3) * 0.6 + 0.6,
  d: (i % 5) * 0.8,
}))

export default function Backdrop({ phase = 'lobby' }) {
  const [top, mid, low] = SKIES[phase] || SKIES.lobby
  return (
    <svg className="backdrop" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset=".6" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <radialGradient id="moonglow">
          <stop offset="0" stopColor="#fff6d8" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)" style={{ transition: 'all 1s' }} />
      {STARS.map((s, i) => (
        <circle key={i} className="star" cx={s.x} cy={s.y} r={s.r} fill="#fff" style={{ animationDelay: `${s.d}s` }} />
      ))}
      <circle cx="1260" cy="160" r="160" fill="url(#moonglow)" />
      <circle cx="1260" cy="160" r="52" fill="#f6ecd0" />
      <circle cx="1282" cy="146" r="10" fill="#e6dab8" />
      <circle cx="1244" cy="178" r="7" fill="#e6dab8" />
      <path d="M0 640 L180 470 L300 560 L460 400 L640 590 L820 450 L1000 600 L1180 430 L1380 580 L1600 470 L1600 900 L0 900 Z" fill="#1c1630" opacity=".9" />
      <Icon name="elven-castle" color="#120e20" size={300} x={1080} y={400} />
      <path d="M0 720 Q200 660 420 700 T860 690 T1300 700 T1600 680 L1600 900 L0 900 Z" fill="#120e1c" />
      <g fill="#0c0914">
        {[60, 140, 330, 520, 760, 980, 1420, 1530].map((x, i) => (
          <path key={x} d={`M${x} ${760 - (i % 3) * 20} l-34 90 h68 Z M${x} ${720 - (i % 3) * 20} l-26 70 h52 Z`} />
        ))}
      </g>
    </svg>
  )
}
