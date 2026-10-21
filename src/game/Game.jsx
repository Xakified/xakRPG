import { useState } from 'react'
import { heroSpec, heroStats, heroTitle, STAGES } from './engine'
import Battle from './Battle'
import Forge, { CombatLine, weaponIcon } from './Forge'
import HeroViewer from './HeroViewer'
import Icon from './Icon'
import { AbilityBlock } from './Stats'
import { ITEMS, lootTags } from './combat/loot'
import { SKILLS } from './combat/skills'
import { WEAPONS } from './combat/weapons'
import { LEVELS } from './combat/enemies'
import { TAG_COLORS, heroCombat, heroTags } from './combat/battle'

export default function Game({ state, me, isHost, dispatch, onLeave }) {
  const playing = state.order.includes(me)

  if (state.phase === 'battle') {
    return (
      <>
        <Battle state={state} me={me} dispatch={dispatch} />
        <button className="link leave-corner" onClick={onLeave}>Leave</button>
      </>
    )
  }

  return (
    <main className="card wide">
      {!playing && <p className="muted center">A run is already underway. You're watching, and you'll join the next one.</p>}
      {state.phase === 'forge' && (
        <>
          <Heading icon="anvil-impact" kicker="Prologue" title="Forge your hero" intro="Pick a race, a look, a class and a weapon. Then fight." />
          {playing && <Forge hero={state.heroes[me]} done={state.submitted[me]} onSubmit={(hero) => dispatch({ type: 'forge', ...hero })} />}
          <Waiting state={state} done={state.submitted} />
        </>
      )}
      {state.phase === 'loot' && <LevelUp key={state.stage} state={state} me={me} playing={playing} dispatch={dispatch} />}
      {(state.phase === 'victory' || state.phase === 'defeat') && <Ending state={state} isHost={isHost} dispatch={dispatch} />}
      <button className="link" onClick={onLeave}>Leave room</button>
    </main>
  )
}

function Heading({ icon, kicker, title, intro }) {
  return (
    <header className="heading">
      <Icon name={icon} color="#e2b448" size={52} className="crest" />
      {kicker && <p className="kicker">{kicker}</p>}
      <h1>{title}</h1>
      {intro && <p className="intro">{intro}</p>}
      <div className="flourish" />
    </header>
  )
}

function Waiting({ state, done }) {
  return (
    <ul className="players">
      {state.order.map((id) => (
        <li key={id}>
          <span>{state.heroes[id].heroName || state.heroes[id].player}</span>
          <span className={done[id] ? 'ready' : 'muted'}>{done[id] ? '✓ ready' : 'choosing…'}</span>
        </li>
      ))}
    </ul>
  )
}

const RARITY = { common: '#6a5a40', rare: '#1f5ab0', epic: '#8a2ac0' }
const SLOT = { weapon: 'Weapon enchant', armor: 'Armor', relic: 'Relic', pet: 'Companion', tome: 'Tome' }

export function offerInfo(offer) {
  if (offer.kind === 'skill') {
    const s = SKILLS[offer.id]
    return { name: s.name, icon: s.icon, desc: s.desc, type: `Skill · cooldown ${s.cd}`, color: s.aura || '#c8a0ff' }
  }
  const it = ITEMS[offer.id]
  return { name: it.name, icon: it.icon, desc: it.desc, type: SLOT[it.slot], color: it.glow || it.model?.color || '#e2b448' }
}

function Tags({ tags, owned }) {
  if (!tags.length) return null
  return (
    <span className="tags">
      {tags.map((t) => <span key={t} className={`tag-chip ${owned?.has(t) ? 'synergy' : ''}`} style={{ borderColor: TAG_COLORS[t] || '#888', color: TAG_COLORS[t] || '#ccc' }}>{t}</span>)}
    </span>
  )
}

function LevelUp({ state, me, playing, dispatch }) {
  const [chosen, setChosen] = useState(null)
  const hero = state.heroes[me]
  const offers = state.offers[me] || []
  const done = state.submitted[me]
  const preview = !done && chosen !== null ? offers[chosen] : null
  const owned = new Set(hero ? heroTags(hero) : [])
  const next = LEVELS[state.stage + 1]
  const previewHero = hero && preview ? { ...hero, ...(preview.kind === 'item' ? { items: [...hero.items, preview.id] } : { skills: [...hero.skills, preview.id] }) } : hero

  return (
    <>
      <Heading icon="upgrade" kicker={`Victory in ${LEVELS[state.stage].name}`} title={hero ? `Level ${hero.level}!` : 'Level up'} intro="Choose one reward. Rewards that share a tag with your gear stack into synergies." />
      {playing && (
        <div className="split">
          <div className="model-col">
            <HeroViewer spec={heroSpec(hero, preview)} className="viewer" />
            <p className="model-name">{heroTitle(hero)}</p>
            <AbilityBlock stats={heroStats(previewHero)} />
            <CombatLine st={heroCombat(previewHero)} />
          </div>
          <div className="play-col">
            {done ? (
              <p className="intro center">Reward claimed. Waiting for the party…</p>
            ) : (
              <>
                <div className="hand">
                  {offers.map((o, i) => {
                    const info = offerInfo(o)
                    const tags = lootTags(o)
                    const synergy = tags.some((t) => owned.has(t))
                    return (
                      <button key={`${o.kind}-${o.id}`} type="button" className={`draw offer ${chosen === i ? 'on' : ''}`} onClick={() => setChosen(i)}>
                        <span className="card-art"><Icon name={info.icon} color={info.color} size={70} /></span>
                        <span className="rarity" style={{ color: RARITY[o.rarity] }}>{o.rarity} {info.type}</span>
                        <strong>{info.name}</strong>
                        <span className="small">{info.desc}</span>
                        <Tags tags={tags} owned={owned} />
                        {synergy && <span className="synergy-badge">Synergy!</span>}
                      </button>
                    )
                  })}
                </div>
                <button disabled={chosen === null} onClick={() => dispatch({ type: 'pick', index: chosen })}>Claim reward</button>
              </>
            )}
            <Kit hero={hero} />
            {next && <p className="muted center">Next: <strong>{next.name}</strong>. {next.intro}</p>}
          </div>
        </div>
      )}
      <Waiting state={state} done={state.submitted} />
    </>
  )
}

function Kit({ hero }) {
  if (!hero) return null
  const entries = [
    { icon: weaponIcon(hero.weapon), name: WEAPONS[hero.weapon]?.name, color: '#f0e0c0' },
    ...hero.items.map((id) => offerInfo({ kind: 'item', id })),
    ...hero.skills.map((id) => offerInfo({ kind: 'skill', id })),
  ]
  return (
    <div className="kit">
      <p className="label">Your kit</p>
      <div className="kit-row">
        {entries.map((e, i) => (
          <span key={i} className="kit-item" title={e.desc || e.name}>
            <Icon name={e.icon} color={e.color} size={28} />
            <span className="small">{e.name}</span>
          </span>
        ))}
      </div>
      <Tags tags={heroTags(hero)} />
    </div>
  )
}

function Ending({ state, isHost, dispatch }) {
  const won = state.phase === 'victory'
  return (
    <>
      <Heading
        icon={won ? 'laurel-crown' : 'tombstone'}
        kicker={won ? 'The end' : `Fallen in ${LEVELS[state.stage].name}`}
        title={won ? 'Dragonslayers!' : 'Game over'}
        intro={won ? 'Ignaxis the Red is no more. Your names will be sung in every tavern.' : `The party made it through ${state.stage} of ${STAGES} battles.`}
      />
      <div className="lineup">
        {state.order.map((id) => {
          const h = state.heroes[id]
          return (
            <div key={id} className="lineup-hero">
              <HeroViewer spec={heroSpec(h)} className="viewer small" autoRotate interactive={false} />
              <strong>{h.heroName}</strong>
              <span className="small muted">Level {h.level} {heroTitle(h).split(', ')[1]} · {h.player}</span>
              <Kit hero={h} />
            </div>
          )
        })}
      </div>
      {isHost ? <button onClick={() => dispatch({ type: 'restart' })}>Play again</button> : <p className="muted center">Waiting for the host to start a new run…</p>}
    </>
  )
}
