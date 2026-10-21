import { useEffect, useMemo, useState } from 'react'
import Battle3D from './Battle3D'
import Icon from './Icon'
import { key, within } from './combat/hex'
import { LEVELS } from './combat/enemies'
import { SKILLS, STATUS_INFO } from './combat/skills'
import { WEAPONS } from './combat/weapons'
import { moveOptions, startBattle, targetsFor, unitAt } from './combat/battle'
import { weaponIcon } from './Forge'
import { STAGES } from './engine'

const TARGET_KIND = { enemy: 'attack', ally: 'ally', hex: 'hex' }

if (import.meta.env.DEV) window.__xakStart = startBattle

export default function Battle({ state, me, dispatch }) {
  const b = state.battle
  const level = LEVELS[b.stage]
  const u = b.units[me]
  const [mode, setMode] = useState(null)
  const [hover, setHover] = useState(null)
  const [info, setInfo] = useState(null)
  const [showLog, setShowLog] = useState(false)
  const myTurn = b.turn === 'party' && !b.result && u && !u.dead && !u.down && !u.done

  // Drop a half-chosen skill once it can no longer be used.
  useEffect(() => {
    if (mode && (!myTurn || u.acted || u.cds[mode])) setMode(null)
  }, [b, mode, myTurn, u])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMode(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const options = useMemo(() => {
    if (!myTurn) return { moves: {}, attacks: [], skill: null }
    return {
      moves: moveOptions(b, u),
      attacks: u.acted ? [] : targetsFor(b, u, 'attack').keys,
      skill: mode ? targetsFor(b, u, mode) : null,
    }
  }, [b, u, myTurn, mode])

  const highlights = useMemo(() => {
    const keys = {}
    let aoe = []
    if (mode && options.skill) {
      const s = SKILLS[mode]
      for (const k of options.skill.keys) keys[k] = TARGET_KIND[s.target] || 'hex'
      const hk = hover && key(hover.q, hover.r)
      if (s.kind === 'blast' && hk && options.skill.keys.includes(hk)) aoe = within(hover, s.radius).map((h) => key(h.q, h.r))
      if (s.kind === 'nova' || s.partyBuff || s.kind === 'groupHeal') aoe = within(u, s.radius).map((h) => key(h.q, h.r))
      if (s.aoe === 'adjacent') aoe = within(u, 1).map((h) => key(h.q, h.r))
    } else {
      for (const k of Object.keys(options.moves)) keys[k] = 'move'
      for (const k of options.attacks) keys[k] = 'attack'
    }
    return { keys, aoe }
  }, [options, mode, hover, u])

  function onHex(q, r) {
    const k = key(q, r)
    const clicked = unitAt(b, q, r)
    if (clicked) setInfo(clicked.id)
    if (!myTurn) return
    if (mode) {
      if (options.skill?.keys.includes(k)) dispatch({ type: 'skill', skill: mode, q, r })
      setMode(null)
      return
    }
    if (options.attacks.includes(k)) dispatch({ type: 'attack', q, r })
    else if (options.moves[k]) dispatch({ type: 'move', q, r })
  }

  function chooseSkill(sid) {
    if (!myTurn || u.acted || u.cds[sid]) return
    if (SKILLS[sid].target === 'self') {
      dispatch({ type: 'skill', skill: sid, q: u.q, r: u.r })
      setMode(null)
    } else setMode(mode === sid ? null : sid)
  }

  const heroes = state.order.map((id) => b.units[id]).filter(Boolean)
  const inspected = info && b.units[info] && !b.units[info].dead ? b.units[info] : null
  let hint
  if (b.result) hint = null
  else if (!u) hint = 'You are watching this battle.'
  else if (u.down) hint = 'You have fallen. An ally can heal you back up, or you will rise after the battle.'
  else if (b.turn === 'enemy') hint = 'The enemy is moving…'
  else if (u.done) hint = 'Waiting for the rest of the party…'
  else if (mode) hint = `${SKILLS[mode].name}: ${SKILLS[mode].desc} Pick a highlighted ${SKILLS[mode].target === 'hex' ? 'hex' : 'target'}.`
  else hint = `Move (blue) ${u.moveLeft > 0 ? `up to ${u.moveLeft} hexes` : '— none left'}${u.acted ? '. Action used.' : ', and attack (red) or use a skill.'}`

  return (
    <div className="battle">
      <header className="battle-top">
        <div>
          <p className="kicker">Battle {b.stage + 1} of {STAGES}{b.stage === STAGES - 1 ? ' · Boss' : ''}</p>
          <h2>{level.name}</h2>
        </div>
        <div className={`turn-banner ${b.turn}`}>
          {b.result ? (b.result === 'win' ? 'Victory!' : 'Defeat') : b.turn === 'party' ? `Round ${b.round} · Party's turn` : `Round ${b.round} · Enemy turn`}
        </div>
      </header>

      <div className="battle-stage">
        <Battle3D battle={b} run={state} me={me} highlights={highlights} onHex={onHex} onHover={setHover} />

        <ul className="party-list">
          {heroes.map((h) => (
            <li key={h.id} className={`${h.down ? 'down' : ''} ${h.done && b.turn === 'party' ? 'done' : ''} ${h.id === me ? 'mine' : ''}`} onClick={() => setInfo(h.id)}>
              <span className="pl-name">{h.name}{h.down ? ' (down)' : b.turn === 'party' && h.done ? ' ✓' : ''}</span>
              <span className="hp-bar wide"><span className="hp-fill" style={{ width: `${(h.hp / h.maxHp) * 100}%` }} /></span>
              <span className="pl-hp">{h.hp}/{h.maxHp}</span>
            </li>
          ))}
        </ul>

        {inspected && <Inspect u={inspected} onClose={() => setInfo(null)} />}

        <div className={`battle-log ${showLog ? 'open' : ''}`} onClick={() => setShowLog(!showLog)}>
          {(showLog ? b.log.slice(-14) : b.log.slice(-3)).map((line, i) => <p key={`${b.log.length}-${i}`}>{line}</p>)}
        </div>

        {b.result && (
          <div className="result-card">
            <Icon name={b.result === 'win' ? 'laurel-crown' : 'tombstone'} color={b.result === 'win' ? '#e2b448' : '#b0a0c0'} size={64} />
            <h1>{b.result === 'win' ? (b.stage === STAGES - 1 ? 'The dragon falls!' : 'Victory!') : 'The party has fallen'}</h1>
            <p className="intro">{b.result === 'win' ? (b.stage === STAGES - 1 ? 'Songs will be sung of this day.' : 'Every hero levels up and chooses a reward.') : `Your tale ends in ${level.name}.`}</p>
            <button onClick={() => dispatch({ type: 'advance' })}>{b.result === 'win' ? 'Continue' : 'See the fallen'}</button>
          </div>
        )}
      </div>

      {u && !u.dead && (
        <footer className="battle-hud">
          <div className="hud-hero">
            <strong>{u.name}</strong>
            <span className="hp-bar wide"><span className="hp-fill" style={{ width: `${(u.hp / u.maxHp) * 100}%` }} />{u.shield > 0 && <span className="hp-shield" style={{ width: `${Math.min(100, (u.shield / u.maxHp) * 100)}%` }} />}</span>
            <span className="hud-stats">
              <span>{u.hp}/{u.maxHp} HP</span>
              <span>{u.st.ac + (u.statuses.ward ? 4 : 0)} AC</span>
              <span>{u.moveLeft} move</span>
              <span>Lv {u.st.level}</span>
            </span>
            <Statuses u={u} />
          </div>
          <div className="hud-actions">
            <button type="button" className={`skill-btn ${!myTurn || u.acted ? 'off' : ''}`} title={`${WEAPONS[state.heroes[me].weapon]?.name}: click a red target`} onClick={() => setMode(null)}>
              <Icon name={weaponIcon(state.heroes[me].weapon)} color="#f0e0c0" size={30} />
              <span>Attack</span>
            </button>
            {u.st.skills.map((sid) => {
              const s = SKILLS[sid]
              const cd = u.cds[sid]
              return (
                <button key={sid} type="button" className={`skill-btn ${mode === sid ? 'on' : ''} ${!myTurn || u.acted || cd ? 'off' : ''}`} title={`${s.name}: ${s.desc}`} onClick={() => chooseSkill(sid)}>
                  <Icon name={s.icon} color={s.aura || '#c8a0ff'} size={30} />
                  <span>{s.name}</span>
                  {cd > 0 && <span className="cd">{cd}</span>}
                </button>
              )
            })}
            <button type="button" className="end-turn" disabled={!myTurn} onClick={() => dispatch({ type: 'endTurn' })}>End turn</button>
          </div>
          {hint && <p className="hud-hint">{hint}</p>}
        </footer>
      )}
    </div>
  )
}

function Statuses({ u }) {
  const list = Object.entries(u.statuses || {})
  if (!list.length) return null
  return (
    <span className="hud-statuses">
      {list.map(([s, v]) => <span key={s} style={{ color: STATUS_INFO[s].color }}>{STATUS_INFO[s].name} ({v.turns})</span>)}
    </span>
  )
}

function Inspect({ u, onClose }) {
  return (
    <div className="inspect" onClick={onClose}>
      <strong>{u.name}</strong>
      <span>{u.hp}/{u.maxHp} HP · {u.st.ac} AC · move {u.st.speed} · range {u.st.range}</span>
      <span>Attack +{u.st.toHit}, {u.st.hits > 1 ? `${u.st.hits}×` : ''}{u.st.dice[0]}d{u.st.dice[1]}{u.st.dmg > 0 ? `+${u.st.dmg}` : u.st.dmg < 0 ? u.st.dmg : ''}</span>
      {u.undead && <span className="small muted">Undead: holy damage doubled.</span>}
      {u.brittle && <span className="small muted">Brittle: blunt weapons deal +50%.</span>}
      {u.resist && <span className="small muted">Resists {u.resist.join(', ')}.</span>}
      <Statuses u={u} />
    </div>
  )
}
