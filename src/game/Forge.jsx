import { useMemo, useState } from 'react'
import HeroViewer from './HeroViewer'
import Icon from './Icon'
import { AbilityBlock, Bonus } from './Stats'
import { RACES, RACE_BY_ID } from './data/races'
import { CLASSES, CLASS_BY_ID } from './data/classes'
import { DEFAULT_LOOK, EYE_COLORS, FACIAL_HAIR, HAIR_COLORS, HAIR_STYLES, SKIN_TONES } from './data/looks'
import { heroStats } from './engine'

const STEPS = ['Race', 'Body', 'Skin & Hair', 'Class', 'Name']

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
  const [step, setStep] = useState(0)
  const [race, setRace] = useState(null)
  const [cls, setCls] = useState(null)
  const [look, setLook] = useState(DEFAULT_LOOK)
  const [heroName, setHeroName] = useState('')
  const [filter, setFilter] = useState('')
  const r = RACE_BY_ID[race]
  const set = (patch) => setLook((l) => ({ ...l, ...patch }))

  const spec = useMemo(() => ({ race: race || 'human', cls, look, picks: {} }), [race, cls, look])
  const stats = heroStats({ race, cls, picks: [] })
  const canNext = [Boolean(race), true, true, Boolean(cls), Boolean(heroName.trim())][step]

  function pickRace(id) {
    const next = RACE_BY_ID[id]
    setRace(id)
    set({ skin: next.skins[0], ...(next.f.noHairDefault ? { hair: 'bald' } : {}) })
  }

  if (done) {
    return (
      <div className="split">
        <div className="model-col">
          <HeroViewer spec={{ race: hero.race, cls: hero.cls, look: hero.look, picks: {} }} className="viewer" autoRotate />
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
              <button key={c.id} type="button" className={`draw class ${cls === c.id ? 'on' : ''}`} onClick={() => setCls(c.id)}>
                <span className="card-art small"><Icon name={c.icon} color="#e2b448" size={46} /></span>
                <strong>{c.name}</strong>
                <span className="small">{c.blurb}</span>
                <span className="stats">Best at {c.priority[0]} &amp; {c.priority[1]}</span>
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <form className="panel" onSubmit={(e) => { e.preventDefault(); if (canNext) onSubmit({ heroName, race, cls, look }) }}>
            <p className="label">What will the bards call you?</p>
            <input autoFocus placeholder="Hero name" maxLength={30} value={heroName} onChange={(e) => setHeroName(e.target.value)} />
            <button disabled={!heroName.trim() || !race || !cls}>Enter the tale</button>
            {(!race || !cls) && <p className="muted small">Pick a race and a class first.</p>}
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
