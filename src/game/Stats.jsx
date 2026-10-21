import { ABILITIES, ABILITY_NAMES } from './data/classes'

const mod = (score) => {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

export function AbilityBlock({ stats }) {
  return (
    <div className="abilities">
      {ABILITIES.map((a) => (
        <div key={a} className="ability" title={ABILITY_NAMES[a]}>
          <span className="ab-name">{a}</span>
          <span className="ab-score">{stats[a]}</span>
          <span className="ab-mod">{mod(stats[a])}</span>
        </div>
      ))}
    </div>
  )
}

export function Bonus({ stats }) {
  return (
    <span className="stats">
      {Object.entries(stats).map(([k, v]) => (
        <span key={k} title={ABILITY_NAMES[k]}>+{v} {k}</span>
      ))}
    </span>
  )
}
