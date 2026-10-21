import { RACE_BY_ID } from './data/races'
import { CLASS_BY_ID } from './data/classes'
import { cleanLook } from './data/looks'
import { WEAPONS, STARTING_WEAPONS } from './combat/weapons'
import { ITEMS, rollOffers } from './combat/loot'
import { SKILLS } from './combat/skills'
import { LEVELS } from './combat/enemies'
import { TAG_COLORS, enemyStep, heroAction, heroScores, heroTags, removeHero, startBattle } from './combat/battle'

// The host owns the authoritative game state. Everyone else sends actions to
// the host, which runs them through reduce() and broadcasts the new state.
//
// A run: forge heroes → battle → level-up pick → battle … → dragon → victory.
// Losing any battle ends the run.

export const STAGES = LEVELS.length

export function newGame(players, previous = {}) {
  const heroes = {}
  for (const p of players) {
    const prev = previous[p.id]
    heroes[p.id] = {
      player: p.name, heroName: '', race: null, cls: null, look: null, weapon: null, items: [], skills: [], level: 1,
      last: prev ? { heroName: prev.heroName, race: prev.race, cls: prev.cls, look: prev.look, weapon: prev.weapon } : null,
    }
  }
  return {
    phase: 'forge',
    order: players.map((p) => p.id),
    heroes,
    submitted: {},
    stage: 0,
    seed: Math.floor(Math.random() * 1e6),
    battle: null,
    offers: {},
  }
}

export function heroStats(hero) {
  return hero.cls ? heroScores(hero) : { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
}

export function heroTitle(hero) {
  const race = RACE_BY_ID[hero.race]
  const cls = CLASS_BY_ID[hero.cls]
  return race && cls ? `${hero.heroName}, ${race.name} ${cls.name}` : hero.heroName
}

// What the 3D model needs. `preview` is a loot offer being considered.
export function heroSpec(hero, preview) {
  const itemIds = [...(hero.items || []), ...(preview?.kind === 'item' ? [preview.id] : [])]
  const items = itemIds.map((id) => ITEMS[id])
  const skills = [...(hero.skills || []), ...(preview?.kind === 'skill' ? [preview.id] : [])]
  const latest = (slot) => items.filter((it) => it.slot === slot).pop()
  const weapon = WEAPONS[hero.weapon] ? { ...WEAPONS[hero.weapon].model } : undefined
  const enchant = items.filter((it) => it.glow).pop()
  if (weapon && enchant) weapon.glow = enchant.glow
  const skillAura = skills.map((id) => SKILLS[id].aura).filter(Boolean).pop()
  const tags = heroTags({ ...hero, items: itemIds, skills })
  const tagAura = tags.length && items.length + skills.length >= 2 ? TAG_COLORS[tags[0]] : undefined
  return {
    race: hero.race || 'human',
    cls: hero.cls,
    look: hero.look || undefined,
    weapon,
    armor: latest('armor')?.model,
    relic: latest('relic')?.model,
    pet: latest('pet')?.model,
    aura: skillAura || tagAura,
  }
}

const everyone = (state, done) => state.order.every((id) => done[id])

function beginStage(state) {
  return { ...state, phase: 'battle', submitted: {}, offers: {}, battle: startBattle(state) }
}

export function reduce(state, from, action, isHost) {
  if (!state) return state
  if (action.type === 'restart') {
    if (!isHost || (state.phase !== 'victory' && state.phase !== 'defeat')) return state
    return newGame(state.order.map((id) => ({ id, name: state.heroes[id].player })), state.heroes)
  }
  if (!state.order.includes(from)) return state

  switch (action.type) {
    case 'forge': {
      if (state.phase !== 'forge' || state.submitted[from]) return state
      const heroName = String(action.heroName || '').trim().slice(0, 30)
      if (!heroName || !RACE_BY_ID[action.race] || !CLASS_BY_ID[action.cls]) return state
      if (!STARTING_WEAPONS[action.cls].includes(action.weapon)) return state
      const hero = { ...state.heroes[from], heroName, race: action.race, cls: action.cls, look: cleanLook(action.look), weapon: action.weapon }
      const next = { ...state, heroes: { ...state.heroes, [from]: hero }, submitted: { ...state.submitted, [from]: true } }
      return everyone(next, next.submitted) ? beginStage(next) : next
    }

    case 'move':
    case 'attack':
    case 'skill':
    case 'endTurn': {
      if (state.phase !== 'battle') return state
      const battle = heroAction(state.battle, from, action)
      return battle === state.battle ? state : { ...state, battle }
    }

    case 'enemyStep': {
      if (!isHost || state.phase !== 'battle') return state
      const battle = enemyStep(state.battle)
      return battle === state.battle ? state : { ...state, battle }
    }

    case 'advance': {
      if (state.phase !== 'battle' || !state.battle.result) return state
      if (state.battle.result === 'lose') return { ...state, phase: 'defeat' }
      if (state.stage + 1 >= STAGES) return { ...state, phase: 'victory' }
      const heroes = {}
      const offers = {}
      for (const id of state.order) {
        heroes[id] = { ...state.heroes[id], level: state.heroes[id].level + 1 }
        offers[id] = rollOffers(heroes[id], state.stage + 1, Math.random)
      }
      return { ...state, phase: 'loot', heroes, offers, submitted: {} }
    }

    case 'pick': {
      if (state.phase !== 'loot' || state.submitted[from]) return state
      const offer = state.offers[from]?.[action.index]
      if (!offer) return state
      const hero = state.heroes[from]
      const gained = offer.kind === 'item' ? { items: [...hero.items, offer.id] } : { skills: [...hero.skills, offer.id] }
      const next = { ...state, heroes: { ...state.heroes, [from]: { ...hero, ...gained } }, submitted: { ...state.submitted, [from]: true } }
      return everyone(next, next.submitted) ? beginStage({ ...next, stage: next.stage + 1 }) : next
    }

    default:
      return state
  }
}

// Drops players who left mid-run so the party can carry on.
export function prune(state, presentIds) {
  const gone = state.order.filter((id) => !presentIds.includes(id))
  if (!gone.length) return state
  const order = state.order.filter((id) => presentIds.includes(id))
  if (order.length === 0) return null
  let next = { ...state, order }
  if (state.phase === 'battle') for (const id of gone) next.battle = removeHero(next.battle, id)
  if (state.phase === 'forge' && everyone(next, next.submitted)) return beginStage(next)
  if (state.phase === 'loot' && everyone(next, next.submitted)) return beginStage({ ...next, stage: next.stage + 1 })
  return next
}
