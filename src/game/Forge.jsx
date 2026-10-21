import { useMemo, useState } from 'react'
import HeroViewer from './HeroViewer'
import Icon from './Icon'
import { AbilityBlock, Bonus } from './Stats'
import { RACES, RACE_BY_ID } from './data/races'
import { CLASSES, CLASS_BY_ID } from './data/classes'
import { DEFAULT_LOOK, EYE_COLORS, FACIAL_HAIR, HAIR_COLORS, HAIR_STYLES, SKIN_TONES } from './data/looks'
import { heroSpec, heroStats } from './engine'
import { STARTING_WEAPONS, WEAPONS } from './combat/weapons'
import { CLASS_SKILLS, SKILLS } from './combat/skills'
import { heroCombat } from './combat/battle'

const STEPS = ['Race', 'Body', 'Skin & Hair', 'Class', 'Weapon', 'Name']

const ABILITY_LABEL = { STR: 'Strength', DEX: 'Dexterity', finesse: 'Strength or Dexterity', spell: 'your casting stat' }
const WEAPON_ICONS = { sword: 'broadsword', greatsword: 'broadsword', runeblade: 'broadsword', axe: 'battle-axe', greataxe: 'battle-axe', warhammer: 'warhammer', mace: 'flanged-mace', flail: 'flail', spear: 'spear-hook', staff: 'wizard-staff', woodStaff: 'wizard-staff', totem: 'totem-head', wand: 'crystal-wand', orb: 'crystal-ball', bow: 'high-shot', crossbow: 'crossbow', daggers: 'crossed-swords', scythe: 'scythe', lute: 'guitar', fists: 'fist' }
export const weaponIcon = (id) => WEAPON_ICONS[WEAPONS[id]?.model.type] || 'crossed-swords'

function Swatches({ colors, value, onPick, label }) {
  return (
    <div className="swatch-group">
      {label && <p className="label">{label}</p>}
      <div className="swatches">
        {colors.map((c) => (
          <button key={c} type="button" className={`swatch ${value === c ? 'on' : ''}`} style={{ background: c }} onClick={() => onPick(c)} aria-label={c} />
        ))}
        <label className="swatch custom" title="Pick any color">
          <input type="color" value={value} onChange={(e) => onPick(e.target.value)} />
          <span>+</span>
        </label>
      </div>
    </div>
  )
}

function Choices({ options, value, onPick }) {
  return (
    <div className="choices">
      {options.map(([id, name]) => (
        <button key={id} type="button" className={`chip ${value === id ? 'on' : ''}`} onClick={() => onPick(id)}>{name}</button>
      ))}
    </div>
  )
}

function Slider({ label, left, right, value, onChange }) {
  return (
    <label className="slider">
      <span className="label">{label}</span>
      <input type="range" min="0" max="1" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="ends"><span>{left}</span><span>{right}</span></span>
    </label>
  )
}

export default function Forge({ hero, done, onSubmit }) {
  const last = hero?.last
  const [step, setStep] = useState(0)
  const [race, setRace] = useState(last?.race || null)
  const [cls, setCls] = useState(last?.cls || null)
  const [weapon, setWeapon] = useState(last?.weapon || null)
  const [look, setLook] = useState(last?.look || DEFAULT_LOOK)
  const [heroName, setHeroName] = useState(last?.heroName || '')
  const [filter, setFilter] = useState('')
  const r = RACE_BY_ID[race]
  const set = (patch) => setLook((l) => ({ ...l, ...patch }))

  const spec = useMemo(() => heroSpec({ race: race || 'human', cls, look, weapon }), [race, cls, look, weapon])
  const stats = heroStats({ race, cls })
  const combat = cls && weapon ? heroCombat({ race: race || 'human', cls, weapon, level: 1 }) : null
  const canNext = [Boolean(race), true, true, Boolean(cls), Boolean(weapon), Boolean(heroName.trim())][step]

  function pickClass(id) {
    setCls(id)
    if (!STARTING_WEAPONS[id].includes(weapon)) setWeapon(STARTING_WEAPONS[id][0])
  }

  function pickRace(id) {
    const next = RACE_BY_ID[id]
    setRace(id)
    set({ skin: next.skins[0], ...(next.f.noHairDefault ? { hair: 'bald' } : {}) })
  }

  if (done) {
    return (
      <div className="split">
        <div className="model-col">
          <HeroViewer spec={heroSpec(hero)} className="viewer" autoRotate />
        </div>
        <div className="play-col">
          <p className="intro center">{hero.heroName} is ready. Waiting for the rest of the party…</p>
        </div>
      </div>
    )
  }

  const races = RACES.filter((x) => x.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="split">
      <div className="model-col">
        <HeroViewer spec={spec} className="viewer" />
        <p className="hint">Drag to turn your hero</p>
        {r && <p className="model-name">{heroName || 'Your hero'}{r && `, ${r.name}`}{cls && ` ${CLASS_BY_ID[cls].name}`}</p>}
        <AbilityBlock stats={stats} />
        {combat && <CombatLine st={combat} />}
      </div>

      <div className="play-col">
        <div className="steps">
          {STEPS.map((s, i) => (
            <button key={s} type="button" className={`step ${i === step ? 'on' : ''}`} disabled={i > 0 && !race} onClick={() => setStep(i)}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {step === 0 && (
          <>
            <input placeholder={`Search ${RACES.length} races…`} value={filter} onChange={(e) => setFilter(e.target.value)} />
            <div className="race-grid">
              {races.map((x) => (
                <button key={x.id} type="button" className={`race ${race === x.id ? 'on' : ''}`} onClick={() => pickRace(x.id)}>
                  <strong>{x.name}</strong>
                  <Bonus stats={x.asi} />
                </button>
              ))}
            </div>
            {r && <p className="intro">{r.blurb}</p>}
          </>
        )}

        {step === 1 && (
          <div className="panel">
            <Slider label="Build" left="Slim" right="Fat" value={look.fat} onChange={(fat) => set({ fat })} />
            <Slider label="Strength" left="Frail" right="Muscular" value={look.muscle} onChange={(muscle) => set({ muscle })} />
            <p className="label">Breasts</p>
            <Choices options={[[false, 'No'], [true, 'Yes']]} value={look.breasts} onPick={(breasts) => set({ breasts })} />
          </div>
        )}

        {step === 2 && (
          <div className="panel">
            <Swatches label={r?.f.fur ? `Fur (suggested for ${r.name})` : `Skin (suggested for ${r?.name})`} colors={r?.skins || []} value={look.skin} onPick={(skin) => set({ skin })} />
            <Swatches label="All skin colors" colors={SKIN_TONES} value={look.skin} onPick={(skin) => set({ skin })} />
            {r?.f.noHair ? (
              <p className="muted">{r.name} heroes don't grow hair.</p>
            ) : (
              <>
                <p className="label">Hairstyle</p>
                <Choices options={HAIR_STYLES} value={look.hair} onPick={(hair) => set({ hair })} />
                <Swatches label="Hair color" colors={HAIR_COLORS} value={look.hairColor} onPick={(hairColor) => set({ hairColor })} />
                {!r?.f.construct && (
                  <>
                    <p className="label">Facial hair</p>
                    <Choices options={FACIAL_HAIR} value={look.beard} onPick={(beard) => set({ beard })} />
                  </>
                )}
              </>
            )}
            {!r?.f.glowEyes && <Swatches label="Eyes" colors={EYE_COLORS} value={look.eyes} onPick={(eyes) => set({ eyes })} />}
          </div>
        )}

        {step === 3 && (
          <div className="class-grid">
            {CLASSES.map((c) => (
              <button key={c.id} type="button" className={`draw class ${cls === c.id ? 'on' : ''}`} onClick={() => pickClass(c.id)}>
                <span className="card-art small"><Icon name={c.icon} color="#e2b448" size={46} /></span>
                <strong>{c.name}</strong>
                <span className="small">{c.blurb}</span>
                <span className="stats">Best at {c.priority[0]} &amp; {c.priority[1]}</span>
              </button>
            ))}
          </div>
        )}

        {step === 4 && cls && (
          <>
            <div className="class-grid">
              {STARTING_WEAPONS[cls].map((id) => {
                const w = WEAPONS[id]
                return (
                  <button key={id} type="button" className={`draw class ${weapon === id ? 'on' : ''}`} onClick={() => setWeapon(id)}>
                    <span className="card-art small"><Icon name={weaponIcon(id)} color={w.model.glow || '#e2b448'} size={46} /></span>
                    <strong>{w.name}</strong>
                    <span className="small">{w.blurb}</span>
                    <span className="stats">{w.hits ? `${w.hits}×` : ''}{w.dice[0]}d{w.dice[1]} · range {w.range} · uses {ABILITY_LABEL[w.ability]}</span>
                  </button>
                )
              })}
            </div>
            <p className="label">Your starting skills</p>
            <div className="skill-list">
              {CLASS_SKILLS[cls].map((id) => (
                <div key={id} className="skill-row">
                  <Icon name={SKILLS[id].icon} color="#c8a0ff" size={32} />
                  <span><strong>{SKILLS[id].name}</strong> <span className="small muted">{SKILLS[id].desc}</span></span>
                </div>
              ))}
            </div>
          </>
        )}
        {step === 4 && !cls && <p className="muted">Pick a class first.</p>}

        {step === 5 && (
          <form className="panel" onSubmit={(e) => { e.preventDefault(); if (canNext && weapon) onSubmit({ heroName, race, cls, look, weapon }) }}>
            <p className="label">What will the bards call you?</p>
            <input autoFocus placeholder="Hero name" maxLength={30} value={heroName} onChange={(e) => setHeroName(e.target.value)} />
            <button disabled={!heroName.trim() || !race || !cls || !weapon}>Ready for battle</button>
            {(!race || !cls || !weapon) && <p className="muted small">Pick a race, class and weapon first.</p>}
          </form>
        )}

        <div className="row nav">
          <button type="button" className="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          {step < STEPS.length - 1 && <button type="button" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>}
        </div>
      </div>
    </div>
  )
}

export function CombatLine({ st }) {
  return (
    <div className="combat-line">
      <span title="Hit points"><b>{st.maxHp}</b> HP</span>
      <span title="Armor class: enemies need this on a d20 roll to hit you"><b>{st.ac}</b> AC</span>
      <span title="Hexes you can move each turn"><b>{st.speed}</b> Move</span>
      <span title="Added to your d20 attack roll"><b>+{st.toHit}</b> Hit</span>
      <span title="Weapon damage">{st.hits > 1 ? `${st.hits}×` : ''}{st.dice[0]}d{st.dice[1]}{st.dmg ? (st.dmg > 0 ? `+${st.dmg}` : st.dmg) : ''} Dmg</span>
      <span title="Enemies must beat this to resist your spells"><b>{st.dc}</b> Spell DC</span>
    </div>
  )
}
