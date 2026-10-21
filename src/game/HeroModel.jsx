import { CARDS } from './cards'
import Icon from './Icon'

const SKIN = ['#f1d0b0', '#e0b48c', '#c58c62', '#9a6440', '#6e452b', '#b6d48a', '#a8c0e0']
const HAIR = ['#2a1d14', '#5a3a1e', '#a0662a', '#d8b060', '#e8e0d0', '#8a2a1e', '#3a3a5a']

function hash(text) {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

// Hat shapes, drawn around a head centred at (150, 110) with radius 34.
function Headgear({ kind, outfit, trim }) {
  switch (kind) {
    case 'hood':
      return <path d="M110 128 Q104 58 150 54 Q196 58 190 128 L178 130 Q178 82 150 80 Q122 82 122 130 Z" fill={outfit} stroke="#0006" strokeWidth="2" />
    case 'helm':
      return (
        <g stroke="#0007" strokeWidth="2">
          <path d="M112 116 Q112 68 150 68 Q188 68 188 116 L188 124 L176 124 L176 106 L124 106 L124 124 L112 124 Z" fill="#a8aeb8" />
          <rect x="146" y="68" width="8" height="52" fill="#8a9098" />
          <path d="M150 68 Q156 46 176 40 Q166 54 160 70 Z" fill={trim} />
        </g>
      )
    case 'crown':
      return <path d="M122 84 L122 60 L134 72 L142 52 L150 68 L158 52 L166 72 L178 60 L178 84 Z" fill={trim} stroke="#0007" strokeWidth="2" />
    case 'cap':
      return (
        <g stroke="#0006" strokeWidth="2">
          <path d="M116 96 Q116 66 152 66 Q186 68 186 96 Z" fill={trim} />
          <path d="M150 94 Q182 88 206 98 Q182 104 150 100 Z" fill={trim} />
        </g>
      )
    case 'wizardhat':
      return (
        <g stroke="#0006" strokeWidth="2">
          <path d="M118 86 L156 10 Q164 4 168 14 L184 86 Z" fill={outfit} />
          <ellipse cx="150" cy="86" rx="56" ry="11" fill={outfit} />
          <path d="M146 46 l4 -9 l4 9 l-9 -5 h10 Z M164 66 l3 -6 l3 6 l-6 -3 h6 Z" fill={trim} stroke="none" />
        </g>
      )
    case 'tricorn':
      return (
        <g stroke={trim} strokeWidth="3">
          <path d="M112 90 Q114 58 150 58 Q186 58 188 90 Z" fill="#1e1e26" />
          <path d="M96 88 Q150 62 204 88 Q176 80 150 96 Q124 80 96 88 Z" fill="#1e1e26" />
          <circle cx="150" cy="74" r="7" fill="#e8e0d0" stroke="none" />
        </g>
      )
    case 'strawhat':
      return (
        <g stroke="#0005" strokeWidth="2">
          <ellipse cx="150" cy="86" rx="66" ry="13" fill="#e0c070" />
          <path d="M118 86 Q120 56 150 56 Q180 56 182 86 Z" fill="#e0c070" />
          <path d="M119 80 Q150 74 181 80 L182 86 Q150 80 118 86 Z" fill={trim} />
        </g>
      )
    case 'tophat':
      return (
        <g stroke="#0006" strokeWidth="2">
          <ellipse cx="150" cy="84" rx="48" ry="9" fill="#1e1e26" />
          <rect x="124" y="30" width="52" height="54" rx="4" fill="#1e1e26" />
          <rect x="124" y="70" width="52" height="9" fill={trim} />
        </g>
      )
    case 'horns':
      return (
        <g fill="#efe4c8" stroke="#0006" strokeWidth="2">
          <path d="M122 88 Q100 70 104 40 Q114 64 132 78 Z" />
          <path d="M178 88 Q200 70 196 40 Q186 64 168 78 Z" />
        </g>
      )
    case 'feathercap':
      return (
        <g stroke="#0006" strokeWidth="2">
          <path d="M114 94 Q118 64 152 64 Q188 66 190 94 Z" fill={outfit} />
          <path d="M176 76 Q214 30 232 24 Q214 52 186 84 Z" fill={trim} />
        </g>
      )
    case 'jester':
      return (
        <g stroke="#0006" strokeWidth="2">
          <path d="M116 92 Q100 58 76 62 Q100 70 118 96 Z" fill={outfit} />
          <path d="M184 92 Q200 58 224 62 Q200 70 182 96 Z" fill={trim} />
          <path d="M124 90 Q132 46 150 30 Q168 46 176 90 Z" fill={outfit} />
          <path d="M150 30 Q168 46 176 90 L150 90 Z" fill={trim} />
          <circle cx="76" cy="62" r="7" fill="#f0c040" />
          <circle cx="224" cy="62" r="7" fill="#f0c040" />
          <circle cx="150" cy="30" r="7" fill="#f0c040" />
        </g>
      )
    default:
      return null
  }
}

function EmptySlot({ cx, cy, r }) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff30" strokeWidth="2" strokeDasharray="5 6" />
}

export default function HeroModel({ hero, seed = '', className, preview }) {
  const slots = {}
  for (const { cardId } of hero.picks) slots[CARDS[cardId].category] = CARDS[cardId]
  // A card being considered (not yet picked) shows on the model too.
  if (preview) slots[preview.category] = preview

  const h = hash(seed || hero.heroName || 'hero')
  const skin = SKIN[h % SKIN.length]
  const hair = HAIR[(h >> 4) % HAIR.length]
  const look = slots.Origin?.look || { outfit: '#6a6a72', trim: '#8a8a92', headgear: 'none' }
  const { outfit, trim } = look
  const ink = '#0008'

  return (
    <svg className={className} viewBox="0 0 300 400" role="img" aria-label={`Portrait of ${hero.heroName || 'a hero'}`}>
      <defs>
        <radialGradient id={`aura-${h}`}>
          <stop offset="0" stopColor={slots.Secret?.color || '#000'} stopOpacity={slots.Secret ? 0.55 : 0} />
          <stop offset="1" stopColor={slots.Secret?.color || '#000'} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="150" cy="200" rx="140" ry="190" fill={`url(#aura-${h})`} />
      <ellipse cx="150" cy="372" rx="90" ry="14" fill="#0006" />

      {/* Companion stands at the hero's feet */}
      {slots.Companion ? (
        <Icon name={slots.Companion.icon} color={slots.Companion.color} size={96} x={-4} y={272} className="model-item" />
      ) : (
        <EmptySlot cx={44} cy={322} r={34} />
      )}

      {/* Legs and boots */}
      <g stroke={ink} strokeWidth="2">
        <rect x="128" y="280" width="18" height="78" rx="6" fill="#3a2e28" />
        <rect x="154" y="280" width="18" height="78" rx="6" fill="#3a2e28" />
        <path d="M122 352 h26 v14 h-30 Z M152 352 h26 l4 14 h-30 Z" fill="#241a14" />
      </g>

      {/* Back arm, tunic, belt */}
      <path d="M118 164 Q98 210 102 246" stroke={outfit} strokeWidth="18" strokeLinecap="round" fill="none" />
      <circle cx="102" cy="250" r="9" fill={skin} stroke={ink} strokeWidth="2" />
      <path d="M116 150 Q150 138 184 150 L198 298 Q150 310 102 298 Z" fill={outfit} stroke={ink} strokeWidth="2" />
      <path d="M150 146 L150 300" stroke={trim} strokeWidth="5" opacity=".8" />
      <path d="M104 298 Q150 310 198 298" stroke={trim} strokeWidth="6" fill="none" />
      <rect x="108" y="224" width="86" height="12" rx="3" fill="#3a2a1a" stroke={ink} strokeWidth="2" />
      <rect x="144" y="222" width="14" height="16" rx="2" fill="#d8b050" stroke={ink} strokeWidth="2" />

      {/* Trinket hangs from the belt */}
      {slots.Trinket ? (
        <Icon name={slots.Trinket.icon} color={slots.Trinket.color} size={48} x={98} y={232} className="model-item" />
      ) : (
        <EmptySlot cx={122} cy={256} r={18} />
      )}

      {/* Head */}
      <rect x="140" y="132" width="20" height="18" fill={skin} stroke={ink} strokeWidth="2" />
      <circle cx="150" cy="110" r="34" fill={skin} stroke={ink} strokeWidth="2" />
      <path d="M116 108 Q114 72 150 72 Q186 72 184 108 Q172 88 150 90 Q128 88 116 108 Z" fill={hair} />
      <circle cx="138" cy="112" r="3.5" fill="#1a1414" />
      <circle cx="162" cy="112" r="3.5" fill="#1a1414" />
      <path d="M140 126 Q150 134 160 126" stroke="#1a1414" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Headgear kind={look.headgear} outfit={outfit} trim={trim} />

      {/* Weapon arm, raised, with the weapon in hand */}
      <path d="M184 164 Q214 186 222 214" stroke={outfit} strokeWidth="18" strokeLinecap="round" fill="none" />
      {slots.Weapon ? (
        <Icon name={slots.Weapon.icon} color={slots.Weapon.color} size={112} x={180} y={120} className="model-item" />
      ) : (
        <EmptySlot cx={236} cy={176} r={40} />
      )}
      <circle cx="224" cy="218" r="10" fill={skin} stroke={ink} strokeWidth="2" />

      {/* Secret floats above the shoulder like a thought */}
      {slots.Secret ? (
        <g>
          <circle cx="250" cy="52" r="34" fill="#1a1626cc" stroke={slots.Secret.color} strokeWidth="2" />
          <circle cx="214" cy="92" r="6" fill="#1a1626cc" stroke={slots.Secret.color} strokeWidth="1.5" />
          <Icon name={slots.Secret.icon} color={slots.Secret.color} size={44} x={228} y={30} />
        </g>
      ) : (
        <EmptySlot cx={250} cy={52} r={30} />
      )}

      {/* Origin emblem on the chest */}
      {slots.Origin && <Icon name={slots.Origin.icon} color={trim} size={34} x={133} y={176} />}
    </svg>
  )
}
