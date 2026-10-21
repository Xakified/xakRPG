import { key, parse, distance, neighbors, line, within, rng } from './hex'
import { WEAPONS, CASTING, HIT_DIE } from './weapons'
import { SKILLS, CLASS_SKILLS, STATUS_INFO } from './skills'
import { ITEMS } from './loot'
import { ENEMIES, LEVELS } from './enemies'
import { RACE_BY_ID } from '../data/races'
import { baseScores } from '../data/classes'

// The rules of a battle. Everything here is pure data in, data out, so the
// host can run it and broadcast the result. Randomness uses Math.random on
// the host only; maps use a seeded generator so they never change mid-fight.

export const MAP_RADIUS = 6
export const TAG_COLORS = {
  fire: '#ff7a2a', frost: '#8ae6ff', lightning: '#b0dcff', holy: '#fff0a0', shadow: '#b070ff', poison: '#8ae040',
  nature: '#7aff9a', arcane: '#a8a8ff', psychic: '#ff8ad8', sonic: '#ffd080', bleed: '#e03030', blunt: '#ffffff',
}

export const mod = (score) => Math.floor((score - 10) / 2)
const die = (sides) => 1 + Math.floor(Math.random() * sides)
function roll(n, sides) {
  let t = 0
  for (let i = 0; i < n; i++) t += die(sides)
  return t
}
const pick = (list) => list[Math.floor(Math.random() * list.length)]

// ---------------------------------------------------------------- hero stats

export function heroScores(hero) {
  const scores = baseScores(hero.cls)
  for (const [k, v] of Object.entries(RACE_BY_ID[hero.race]?.asi || {})) scores[k] += v
  for (const id of hero.items || []) for (const [k, v] of Object.entries(ITEMS[id].stats || {})) scores[k] += v
  return scores
}

const ARMOR = { plate: () => 16, leather: (s) => 12 + mod(s.DEX), cloth: (s) => 11 + mod(s.DEX), robe: (s) => 10 + mod(s.DEX), gi: (s) => 10 + mod(s.DEX) + mod(s.WIS) }
const STYLE = { warrior: 'plate', paladin: 'plate', 'death-knight': 'plate', rogue: 'leather', shaman: 'leather', ranger: 'leather', bard: 'cloth', monk: 'gi', wizard: 'robe', druid: 'robe', necromancer: 'robe', sorcerer: 'robe', cleric: 'medium' }

// Everything combat needs to know about a hero, derived from race, class,
// ability scores, level, weapon and loot.
export function heroCombat(hero) {
  const s = heroScores(hero)
  const level = hero.level || 1
  const prof = 2 + Math.floor((level - 1) / 2)
  const items = (hero.items || []).map((id) => ITEMS[id])
  const mods = { hp: 0, ac: 0, speed: 0, toHit: 0, dmg: 0, spellDmg: 0, crit: 0, heal: 0, dot: 0, lifesteal: 0, thorns: 0, cdr: 0, range: 0 }
  for (const it of items) for (const [k, v] of Object.entries(it.mods || {})) mods[k] += v
  const special = items.map((it) => it.special).filter(Boolean)
  const weapon = WEAPONS[hero.weapon] || WEAPONS.longsword
  const spellMod = mod(s[CASTING[hero.cls]] || 10)
  const abilityMod = weapon.ability === 'spell' ? spellMod : weapon.ability === 'finesse' ? Math.max(mod(s.STR), mod(s.DEX)) : mod(s[weapon.ability])
  const hd = HIT_DIE[hero.cls] || 8
  const con = mod(s.CON)
  const race = RACE_BY_ID[hero.race] || {}
  const style = STYLE[hero.cls]
  let ac = style === 'medium' ? 14 + Math.min(2, mod(s.DEX)) : ARMOR[style](s)
  if (hero.cls === 'paladin') ac += 2
  let speed = race.f?.centaur ? 7 : race.size < 0.7 ? 4 : 5
  if (race.f?.wings) speed += 1
  if (hero.cls === 'monk') speed += 1
  const ranged = weapon.range > 1
  return {
    scores: s,
    level,
    prof,
    maxHp: Math.max(12, hd * 2 + 8 + con * 2 + (level - 1) * (hd / 2 + 2 + con) + mods.hp),
    ac: ac + mods.ac,
    speed: Math.max(2, speed + mods.speed),
    toHit: abilityMod + prof + mods.toHit,
    dice: weapon.dice,
    hits: weapon.hits || 1,
    dmg: abilityMod + mods.dmg + (weapon.ability === 'spell' ? mods.spellDmg : 0),
    range: weapon.range + (ranged ? mods.range : 0),
    rangeBonus: mods.range,
    tags: weapon.tags,
    crit: 20 - mods.crit,
    spellMod,
    spellAtk: spellMod + prof + mods.toHit,
    spellDmg: mods.spellDmg,
    dc: 8 + prof + spellMod,
    weaponMod: abilityMod,
    saves: { DEX: mod(s.DEX) + Math.floor(prof / 2), CON: con + Math.floor(prof / 2) },
    mods,
    special,
    onHit: items.filter((it) => it.onHit).map((it) => it.onHit),
    skills: [...(CLASS_SKILLS[hero.cls] || []), ...(hero.skills || [])],
  }
}

// All the tags a hero has collected, most common first (drives the aura).
export function heroTags(hero) {
  const count = {}
  const add = (tags) => (tags || []).forEach((t) => (count[t] = (count[t] || 0) + 1))
  add(WEAPONS[hero.weapon]?.tags)
  for (const id of hero.items || []) add(ITEMS[id].tags)
  for (const id of hero.skills || []) add(SKILLS[id].tags)
  return Object.keys(count).sort((a, b) => count[b] - count[a])
}

// ---------------------------------------------------------------- the map

const passable = (t) => t && t.t !== 'wall' && t.t !== 'water'
const WATER = { forest: 2, cave: 2, lair: 3, warcamp: 1, crypt: 0 }

export function makeMap(theme, seed) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const rand = rng(seed * 7919 + attempt * 104729 + 17)
    const tiles = {}
    for (const h of within({ q: 0, r: 0 }, MAP_RADIUS)) tiles[key(h.q, h.r)] = { q: h.q, r: h.r, t: 'floor', v: Math.floor(rand() * 1000) }
    const middle = Object.values(tiles).filter((t) => Math.abs(t.r) <= 3)
    const place = (type, clusters, size) => {
      for (let c = 0; c < clusters; c++) {
        let at = middle[Math.floor(rand() * middle.length)]
        for (let i = 0; i < size; i++) {
          if (at.t === 'floor') at.t = type
          const next = neighbors(at.q, at.r).map((n) => tiles[key(n.q, n.r)]).filter((t) => t && Math.abs(t.r) <= 3)
          at = next[Math.floor(rand() * next.length)] || at
        }
      }
    }
    place('water', WATER[theme], theme === 'warcamp' ? 1 : 3)
    place('wall', 4 + Math.floor(rand() * 3), 1 + Math.floor(rand() * 3))
    place('rough', 4, 3)

    // Every open tile must be reachable from the heroes' side.
    const open = Object.values(tiles).filter(passable)
    const seen = new Set([key(0, MAP_RADIUS - 1)])
    const queue = [{ q: 0, r: MAP_RADIUS - 1 }]
    while (queue.length) {
      const at = queue.pop()
      for (const n of neighbors(at.q, at.r)) {
        const k = key(n.q, n.r)
        if (!seen.has(k) && passable(tiles[k])) {
          seen.add(k)
          queue.push(n)
        }
      }
    }
    if (seen.size === open.length || attempt === 29) {
      for (const t of open) if (!seen.has(key(t.q, t.r))) t.t = 'wall'
      return { theme, tiles }
    }
  }
}

function spawnTiles(b, side) {
  const rows = side === 'hero' ? [MAP_RADIUS - 1, MAP_RADIUS, MAP_RADIUS - 2] : [-(MAP_RADIUS - 1), -MAP_RADIUS, -(MAP_RADIUS - 2), -(MAP_RADIUS - 3)]
  return Object.values(b.map.tiles)
    .filter((t) => passable(t) && rows.includes(t.r))
    .sort((a, c) => rows.indexOf(a.r) - rows.indexOf(c.r) || Math.abs(a.q + a.r / 2) - Math.abs(c.q + c.r / 2))
}

// ---------------------------------------------------------------- units

export const living = (b) => Object.values(b.units).filter((u) => !u.dead)
export const unitAt = (b, q, r) => living(b).find((u) => u.q === q && u.r === r)
const foes = (b, u) => living(b).filter((o) => o.side !== u.side && !o.down)
const friends = (b, u) => living(b).filter((o) => o.side === u.side)

function heroUnit(pid, hero) {
  const st = heroCombat(hero)
  return {
    id: pid, side: 'hero', kind: 'hero', owner: pid, name: hero.heroName, q: 0, r: 0,
    hp: st.maxHp, maxHp: st.maxHp, st, statuses: {}, cds: {}, moveLeft: 0, acted: false, done: false, shield: 0, down: false,
  }
}

function monsterUnit(id, type, { side = 'enemy', owner = null, stage = 0, level = 1, heroes = 1 } = {}) {
  const def = ENEMIES[type]
  const ally = side === 'hero'
  const boost = ally ? Math.floor(level / 2) : 0
  const hp = Math.round((def.hp + (def.hpPerHero || 0) * heroes) * (ally ? 1 : 1 + stage * 0.1 + (heroes - 1) * 0.05)) + (ally ? 4 * (level - 1) : 0)
  return {
    id, side, kind: ally ? 'summon' : 'enemy', type, owner, name: def.name, q: 0, r: 0,
    hp, maxHp: hp, statuses: {}, cds: def.ai === 'dragon' ? { breath: 1 } : {}, moveLeft: 0, acted: false, shield: 0,
    undead: !!def.undead, brittle: !!def.brittle, boss: !!def.boss, resist: def.immune || null, undying: !!def.undying,
    st: {
      ac: def.ac, speed: def.speed, toHit: def.toHit + boost + (ally ? 0 : Math.floor(stage / 2)), dice: [def.dmg[0], def.dmg[1]], dmg: def.dmg[2] + boost,
      hits: def.ai === 'dragon' ? 2 : 1, range: def.range, tags: def.tags || [], crit: 20,
      saves: { DEX: def.save, CON: def.save }, dc: 11 + stage, spellMod: def.save, spellDmg: 0,
      mods: { thorns: 0, lifesteal: 0, dot: 0, heal: 0 }, special: [], onHit: def.onHit ? [{ status: def.onHit }] : [],
    },
  }
}

// ---------------------------------------------------------------- effects

function fx(b, e) {
  b.fxId = (b.fxId || 0) + 1
  b.fx = [...b.fx.slice(-24), { id: b.fxId, ...e }]
}
function log(b, text) {
  b.log = [...b.log.slice(-39), text]
}
const pop = (b, u, text, color, big) => fx(b, { kind: 'pop', unit: u.id, text, color, big })

function addStatus(b, src, u, status) {
  if (!status || !u || u.dead || u.down) return
  if (status.chance && Math.random() > status.chance) return
  let { type, turns } = status
  if (u.boss && (type === 'stun' || type === 'root')) {
    type = 'slow'
    turns = 1
  }
  if (status.save && src) {
    const save = die(20) + (u.st.saves[status.save] || 0)
    if (save >= src.st.dc) {
      pop(b, u, 'Resisted', '#c0c0c0')
      return
    }
  }
  const info = STATUS_INFO[type]
  let power = info.dot ? src?.st?.mods.dot || 0 : 0
  if (type === 'regen') power = status.power || 3
  const prev = u.statuses[type]
  u.statuses[type] = {
    turns: Math.max(prev?.turns || 0, turns),
    power: Math.max(prev?.power || 0, power),
    stacks: info.stack ? Math.min(3, (prev?.stacks || 0) + 1) : 1,
  }
  pop(b, u, info.name, info.color)
}

function plagueActive(b) {
  return living(b).some((u) => u.kind === 'hero' && !u.down && u.st.special.includes('plague'))
}

function heal(b, src, u, amount) {
  if (!u || u.dead) return 0
  const n = Math.max(1, Math.round(amount * (1 + (src?.st?.mods.heal || 0))))
  const before = u.hp
  if (u.down) {
    u.down = false
    u.hp = 0
    log(b, `${u.name} is back on their feet!`)
  }
  u.hp = Math.min(u.maxHp, u.hp + n)
  if (u.hp > before || before === 0) pop(b, u, `+${u.hp - before}`, '#7aff9a')
  return u.hp - before
}

function hurt(b, src, u, amount, tags = [], { crit = false, plain = false } = {}) {
  if (!u || u.dead || u.down) return 0
  let n = amount
  if (!plain) {
    if (u.statuses.marked) n *= 1.25
    if (u.undead && tags.includes('holy')) n *= 2
    if (u.brittle && tags.includes('blunt')) n *= 1.5
    if (src?.statuses?.weaken) n *= 0.75
    if (src?.st?.special.includes('shatter') && (u.statuses.slow || u.statuses.stun)) n *= 1.5
    if (src?.st?.special.includes('bloodstone') && u.statuses.bleed) n += 4
    if (u.resist && tags.some((t) => u.resist.includes(t))) n *= 0.5
  }
  n = Math.max(1, Math.round(n))
  let dealt = n
  if (u.shield > 0) {
    const absorbed = Math.min(u.shield, n)
    u.shield -= absorbed
    dealt -= absorbed
    if (absorbed) pop(b, u, `(${absorbed})`, '#a0c0ff')
  }
  u.hp -= dealt
  if (dealt > 0) pop(b, u, crit ? `${dealt}!` : `${dealt}`, crit ? '#ffd040' : TAG_COLORS[tags.find((t) => TAG_COLORS[t])] || '#ff5a4a', crit)
  if (src && !src.dead && src.st.mods.lifesteal && dealt > 0) heal(b, src, src, dealt * src.st.mods.lifesteal)
  if (u.hp <= 0) fall(b, src, u, tags)
  return dealt
}

function fall(b, src, u, tags) {
  if (u.kind === 'hero') {
    if (u.st.special.includes('phoenix') && !u.phoenixUsed) {
      u.phoenixUsed = true
      u.hp = Math.ceil(u.maxHp / 2)
      pop(b, u, 'Rises from the ashes!', '#ff9a40', true)
      log(b, `${u.name} rises from the ashes!`)
      return
    }
    u.hp = 0
    u.down = true
    u.statuses = {}
    u.done = true
    log(b, `${u.name} falls!`)
    return
  }
  if (u.undying && !u.rose && !tags.includes('holy') && !tags.includes('fire')) {
    u.rose = true
    u.hp = 6
    pop(b, u, 'Refuses to die', '#a0c080')
    return
  }
  u.dead = true
  u.hp = 0
  log(b, `${u.name} is defeated.`)
  const killer = src && (src.kind === 'hero' ? src : b.units[src.owner])
  if (killer && !killer.dead && !killer.down && killer.st.special.includes('soulHarvest')) heal(b, killer, killer, 6)
}

function attackRoll(b, src, tgt, bonus, autoCrit) {
  if (autoCrit) return { hit: true, crit: true }
  const nat = die(20)
  let total = nat + bonus
  if (src.statuses.bless) total += 2
  if (src.statuses.hidden) total += 4
  if (src.side === 'enemy' && src.statuses.poison && plagueActive(b)) total -= 2
  if (ENEMIES[src.type]?.pack && living(b).some((o) => o.side === src.side && o.id !== src.id && distance(o, tgt) === 1)) total += 2
  const ac = tgt.st.ac + (tgt.statuses.ward ? 4 : 0)
  if (nat === 1) return { hit: false }
  const crit = nat >= src.st.crit
  return { hit: crit || total >= ac, crit }
}

// A weapon attack, with all the item effects that ride along on a hit.
function weaponAttack(b, src, tgt, opt = {}) {
  const st = src.st
  const hits = opt.hits || st.hits
  fx(b, { kind: st.range > 1 ? 'bolt' : 'lunge', unit: src.id, from: { q: src.q, r: src.r }, to: { q: tgt.q, r: tgt.r }, color: TAG_COLORS[st.tags[0]] || '#f0e0c0' })
  for (let i = 0; i < hits; i++) {
    if (tgt.dead || tgt.down) break
    const r = attackRoll(b, src, tgt, st.toHit + (opt.toHit || 0), opt.autoCrit)
    if (!r.hit) {
      pop(b, tgt, 'Miss', '#c0c0c0')
      continue
    }
    const mult = r.crit ? 2 : 1
    let n = roll(st.dice[0] * mult, st.dice[1]) + st.dmg + (src.statuses.bless ? 2 : 0)
    let tags = st.tags
    if (opt.extraDice && i === 0) {
      n += roll(opt.extraDice[0] * mult, opt.extraDice[1])
      tags = [...tags, ...(opt.extraTags || [])]
    }
    if (opt.execute && tgt.hp < tgt.maxHp / 2) n *= 2
    const wasBleeding = !!tgt.statuses.bleed
    hurt(b, src, tgt, n, tags, { crit: r.crit })
    for (const oh of st.onHit) {
      if (oh.extraDice) hurt(b, src, tgt, roll(oh.extraDice[0] * mult, oh.extraDice[1]), oh.extraTags)
      if (oh.status) addStatus(b, src, tgt, oh.status)
    }
    if (opt.status) addStatus(b, src, tgt, opt.status)
    afterHit(b, src, tgt, [...tags, ...st.onHit.flatMap((oh) => oh.extraTags || [])], wasBleeding)
  }
  delete src.statuses.hidden
}

function afterHit(b, src, tgt, tags, wasBleeding) {
  const sp = src.st.special
  if (sp.includes('ravenMark') && Math.random() < 0.3) addStatus(b, src, tgt, { type: 'marked', turns: 2 })
  if (sp.includes('stormRune') && tags.includes('lightning') && Math.random() < 0.25) addStatus(b, src, tgt, { type: 'stun', turns: 1 })
  if (sp.includes('bloodstone') && wasBleeding) heal(b, src, src, 2)
  if (tgt.st.mods.thorns && distance(src, tgt) === 1 && !src.dead) hurt(b, tgt, src, tgt.st.mods.thorns, ['nature'], { plain: true })
}

// ---------------------------------------------------------------- movement

const enterCost = (t) => (t.t === 'rough' ? 2 : 1)

// Cheapest path costs from a unit. Units can walk through friends but not
// foes, and cannot stop on anyone.
export function paths(b, u, limit = Infinity) {
  const blocked = new Set(foes(b, u).map((o) => key(o.q, o.r)))
  const start = key(u.q, u.r)
  const best = { [start]: { cost: 0, prev: null } }
  const open = [{ q: u.q, r: u.r, cost: 0 }]
  while (open.length) {
    open.sort((a, c) => a.cost - c.cost)
    const at = open.shift()
    for (const n of neighbors(at.q, at.r)) {
      const k = key(n.q, n.r)
      const t = b.map.tiles[k]
      if (!passable(t) || blocked.has(k)) continue
      const cost = at.cost + enterCost(t)
      if (cost > limit || (best[k] && best[k].cost <= cost)) continue
      best[k] = { cost, prev: key(at.q, at.r) }
      open.push({ q: n.q, r: n.r, cost })
    }
  }
  return best
}

export function moveOptions(b, u) {
  if (!u || u.moveLeft <= 0) return {}
  const all = paths(b, u, u.moveLeft)
  const out = {}
  for (const [k, v] of Object.entries(all)) {
    const [q, r] = parse(k)
    if (v.cost > 0 && !unitAt(b, q, r)) out[k] = v.cost
  }
  return out
}

export function hasSight(b, a, c) {
  return line(a, c).slice(1, -1).every((p) => b.map.tiles[key(p.q, p.r)]?.t !== 'wall')
}

const hexOf = (k) => {
  const [q, r] = parse(k)
  return { q, r }
}

const free = (b, q, r) => passable(b.map.tiles[key(q, r)]) && !unitAt(b, q, r)

// ---------------------------------------------------------------- targeting

// Valid targets for an attack or skill, as hex keys. mode is 'unit', 'hex'
// or 'self' (no target needed).
export function targetsFor(b, u, sid) {
  const inRange = (o, range, sight) => distance(u, o) <= range && (!sight || range <= 1 || hasSight(b, u, o))
  if (sid === 'attack') return { mode: 'unit', keys: foes(b, u).filter((o) => inRange(o, u.st.range, true)).map((o) => key(o.q, o.r)) }
  const s = SKILLS[sid]
  if (s.target === 'self') return { mode: 'self', keys: [key(u.q, u.r)] }
  const range = s.kind === 'strike' ? u.st.range : (s.range || 0) + (s.kind === 'bolt' ? u.st.rangeBonus || 0 : 0)
  if (s.target === 'enemy') return { mode: 'unit', keys: foes(b, u).filter((o) => inRange(o, range, true)).map((o) => key(o.q, o.r)) }
  if (s.target === 'ally') return { mode: 'unit', keys: friends(b, u).filter((o) => inRange(o, range, false)).map((o) => key(o.q, o.r)) }
  const hexes = within(u, range).filter((h) => b.map.tiles[key(h.q, h.r)])
  if (s.kind === 'blast') return { mode: 'hex', keys: hexes.filter((h) => hasSight(b, u, h)).map((h) => key(h.q, h.r)) }
  return { mode: 'hex', keys: hexes.filter((h) => free(b, h.q, h.r)).map((h) => key(h.q, h.r)) }
}

// ---------------------------------------------------------------- skills

function spellDamage(u, dice, crit) {
  return roll(dice[0] * (crit ? 2 : 1), dice[1]) + Math.max(0, u.st.spellMod) + u.st.spellDmg + (u.statuses.bless ? 2 : 0)
}

function bolt(b, u, tgt, s, tags) {
  fx(b, { kind: 'bolt', unit: u.id, from: { q: u.q, r: u.r }, to: { q: tgt.q, r: tgt.r }, color: TAG_COLORS[tags[0]] || '#e0d0ff' })
  let crit = false
  let n
  if (s.save) {
    n = spellDamage(u, s.dice)
    if (die(20) + tgt.st.saves.DEX >= u.st.dc) n = Math.floor(n / 2)
  } else if (s.noRoll) {
    n = spellDamage(u, s.dice)
  } else {
    const r = attackRoll(b, u, tgt, u.st.spellAtk)
    if (!r.hit) {
      pop(b, tgt, 'Miss', '#c0c0c0')
      return 0
    }
    crit = r.crit
    n = spellDamage(u, s.dice, crit)
  }
  if (s.shatter && tgt.statuses.slow) n *= 2
  const wasBleeding = !!tgt.statuses.bleed
  const dealt = hurt(b, u, tgt, n, tags, { crit })
  if (s.drain) heal(b, u, u, dealt * s.drain)
  afterHit(b, u, tgt, tags, wasBleeding)
  return dealt
}

const CHAOS = [['fire', { type: 'burn', turns: 2 }], ['frost', { type: 'slow', turns: 1 }], ['lightning', null]]

function useSkill(b, u, sid, hex) {
  const s = SKILLS[sid]
  const tgt = hex ? unitAt(b, hex.q, hex.r) : null
  const tags = s.tags || []
  const color = s.aura || TAG_COLORS[tags[0]] || '#e0d0ff'
  log(b, `${u.name} uses ${s.name}.`)

  switch (s.kind) {
    case 'strike': {
      const opt = { extraDice: s.extraDice, extraTags: s.extraTags, status: s.status, hits: s.hits, toHit: s.toHit, autoCrit: s.autoCrit, execute: s.execute }
      if (s.sneak) {
        const flanked = living(b).some((o) => o.side === u.side && o.id !== u.id && !o.down && distance(o, tgt) === 1)
        if (!flanked && !u.statuses.hidden) opt.extraDice = null
      }
      if (s.aoe === 'adjacent') {
        fx(b, { kind: 'burst', at: { q: u.q, r: u.r }, radius: 1, color: '#f0e0c0' })
        for (const o of foes(b, u).filter((o) => distance(o, u) === 1)) {
          weaponAttack(b, u, o, opt)
        }
      } else weaponAttack(b, u, tgt, opt)
      break
    }
    case 'bolt': {
      let boltTags = tags
      let status = s.status
      if (s.chaos) {
        const [t, st] = pick(CHAOS)
        boltTags = [t]
        status = st
      }
      bolt(b, u, tgt, s, boltTags)
      if (!tgt.dead && !tgt.down) {
        if (status) addStatus(b, u, tgt, status)
        if (s.pull) pullToward(b, tgt, u, 2)
      }
      if (s.bounce) {
        let last = tgt
        const hit = new Set([tgt.id])
        const jumps = s.bounce + (u.st.special.includes('stormRune') ? 1 : 0)
        for (let i = 0; i < jumps; i++) {
          const next = foes(b, u).filter((o) => !hit.has(o.id) && distance(o, last) <= 3).sort((a, c) => distance(a, last) - distance(c, last))[0]
          if (!next) break
          hit.add(next.id)
          fx(b, { kind: 'bolt', unit: u.id, from: { q: last.q, r: last.r }, to: { q: next.q, r: next.r }, color })
          hurt(b, u, next, spellDamage(u, s.dice), boltTags)
          afterHit(b, u, next, boltTags, false)
          last = next
        }
      }
      break
    }
    case 'blast': {
      fx(b, { kind: 'burst', at: hex, radius: s.radius, color, from: { q: u.q, r: u.r } })
      for (const o of foes(b, u).filter((o) => distance(o, hex) <= s.radius)) {
        let n = s.weaponAbility ? roll(...s.dice) + u.st.weaponMod + u.st.mods.dmg : spellDamage(u, s.dice)
        if (die(20) + o.st.saves.DEX >= u.st.dc) n = Math.floor(n / 2)
        hurt(b, u, o, n, tags)
        if (s.status) addStatus(b, u, o, s.status)
      }
      break
    }
    case 'nova': {
      fx(b, { kind: 'burst', at: { q: u.q, r: u.r }, radius: s.radius, color })
      for (const o of foes(b, u).filter((o) => distance(o, u) <= s.radius)) {
        hurt(b, u, o, spellDamage(u, s.dice), tags)
        if (s.status) addStatus(b, u, o, s.status)
      }
      if (s.healAllies) for (const o of friends(b, u).filter((o) => distance(o, u) <= s.radius)) heal(b, u, o, roll(...s.dice))
      break
    }
    case 'heal': {
      const target = s.target === 'self' ? u : tgt
      fx(b, { kind: 'burst', at: { q: target.q, r: target.r }, radius: 0, color: '#7aff9a' })
      heal(b, u, target, healAmount(u, s))
      break
    }
    case 'groupHeal': {
      fx(b, { kind: 'burst', at: { q: u.q, r: u.r }, radius: s.radius, color: '#7aff9a' })
      for (const o of friends(b, u).filter((o) => distance(o, u) <= s.radius)) heal(b, u, o, healAmount(u, s))
      break
    }
    case 'buff': {
      const targets = s.partyBuff ? friends(b, u).filter((o) => distance(o, u) <= s.radius && !o.down) : [s.target === 'self' ? u : tgt]
      for (const o of targets) {
        if (s.status.type === 'regen') {
          heal(b, u, o, roll(...s.dice) + Math.max(0, u.st.spellMod))
          addStatus(b, u, o, { ...s.status, power: 2 + Math.max(0, u.st.spellMod) })
        } else addStatus(b, u, o, s.status)
        if (s.shield) {
          o.shield += roll(...s.shield) + Math.max(0, u.st.spellMod)
          pop(b, o, 'Shielded', '#a0c0ff')
        }
      }
      fx(b, { kind: 'burst', at: { q: u.q, r: u.r }, radius: s.partyBuff ? s.radius : 0, color: STATUS_INFO[s.status.type].color })
      break
    }
    case 'teleport': {
      fx(b, { kind: 'burst', at: { q: u.q, r: u.r }, radius: 0, color: '#b070ff' })
      u.q = hex.q
      u.r = hex.r
      if (s.status) addStatus(b, u, u, s.status)
      break
    }
    case 'summon': {
      const level = u.st.level
      const mine = living(b).filter((o) => o.owner === u.id && o.kind === 'summon')
      if (mine.length >= 2) mine[0].dead = true
      b.nextId = (b.nextId || 0) + 1
      const id = `s${b.nextId}`
      const ally = monsterUnit(id, s.summon, { side: 'hero', owner: u.id, level })
      ally.q = hex.q
      ally.r = hex.r
      ally.moveLeft = 0
      b.units[id] = ally
      fx(b, { kind: 'burst', at: hex, radius: 0, color: '#80ff9a' })
      pop(b, ally, 'Summoned', '#80ff9a')
      break
    }
    case 'pull': {
      fx(b, { kind: 'bolt', unit: u.id, from: { q: u.q, r: u.r }, to: { q: tgt.q, r: tgt.r }, color: '#80e0ff' })
      pullToward(b, tgt, u, 10)
      addStatus(b, u, tgt, s.status)
      break
    }
  }
  u.cds[sid] = Math.max(1, (s.cd || 1) - (u.st.mods.cdr || 0))
}

function healAmount(u, s) {
  let n = s.flat ? s.flat + (s.perLevel || 0) * (u.st.level - 1) : roll(...s.dice)
  if (s.ability === 'spell') n += Math.max(0, u.st.spellMod)
  if (s.ability === 'CON') n += Math.max(0, mod(u.st.scores.CON))
  if (s.plusLevel) n += u.st.level
  return n
}

// Drag a unit up to `steps` hexes toward another, stopping at obstacles.
function pullToward(b, u, toward, steps) {
  if (u.boss) return
  for (let i = 0; i < steps && distance(u, toward) > 1; i++) {
    const next = neighbors(u.q, u.r).filter((n) => free(b, n.q, n.r) && distance(n, toward) < distance(u, toward)).sort((a, c) => distance(a, toward) - distance(c, toward))[0]
    if (!next) break
    u.q = next.q
    u.r = next.r
  }
}

// ---------------------------------------------------------------- turns

function tick(b, u) {
  for (const [type, s] of Object.entries(u.statuses)) {
    const dot = STATUS_INFO[type]?.dot
    if (dot && !u.dead && !u.down) hurt(b, null, u, roll(dot[0] * (s.stacks || 1), dot[1]) + s.power, [type === 'burn' ? 'fire' : type], { plain: true })
    if (type === 'regen' && !u.dead) heal(b, u, u, s.power)
  }
  if (u.dead || u.down) return
  if (u.kind === 'hero') {
    if (u.st.special.includes('regen') && u.hp < u.maxHp) heal(b, u, u, 3)
    if (u.st.special.includes('whelp')) {
      const target = foes(b, u).filter((o) => distance(o, u) <= 4).sort((a, c) => a.hp - c.hp)[0]
      if (target) {
        fx(b, { kind: 'bolt', unit: u.id, from: { q: u.q, r: u.r }, to: { q: target.q, r: target.r }, color: '#ff7a2a' })
        hurt(b, u, target, roll(2, 6), ['fire'])
        addStatus(b, u, target, { type: 'burn', turns: 2, chance: 0.5 })
      }
    }
  }
  const stunned = !!u.statuses.stun
  const speed = u.statuses.root ? 0 : u.statuses.slow ? Math.ceil(u.st.speed / 2) : u.st.speed
  for (const [type, s] of Object.entries(u.statuses)) {
    if (!s || --s.turns <= 0) delete u.statuses[type]
  }
  for (const k of Object.keys(u.cds)) if (--u.cds[k] <= 0) delete u.cds[k]
  u.stunned = stunned
  u.moveLeft = stunned ? 0 : speed
  u.acted = stunned
  u.done = stunned
  if (stunned) pop(b, u, 'Stunned', '#ffe060')
}

function startPartyTurn(b) {
  b.turn = 'party'
  b.round += 1
  b.queue = []
  for (const u of living(b).filter((o) => o.side === 'hero')) tick(b, u)
  for (const u of living(b).filter((o) => o.kind === 'hero' && o.down)) u.done = true
  if (checkEnd(b)) return
  if (living(b).filter((u) => u.kind === 'hero').every((u) => u.done)) startEnemyTurn(b)
}

function startEnemyTurn(b) {
  b.turn = 'enemy'
  for (const u of living(b).filter((o) => o.side === 'enemy')) tick(b, u)
  if (checkEnd(b)) return
  b.queue = [...living(b).filter((u) => u.kind === 'summon'), ...living(b).filter((u) => u.side === 'enemy')].map((u) => u.id)
}

function checkEnd(b) {
  if (b.result) return true
  if (!living(b).some((u) => u.side === 'enemy')) b.result = 'win'
  else if (!living(b).some((u) => u.kind === 'hero' && !u.down)) b.result = 'lose'
  if (b.result) {
    b.turn = 'over'
    b.queue = []
    log(b, b.result === 'win' ? 'Victory!' : 'The party has fallen…')
  }
  return !!b.result
}

// ---------------------------------------------------------------- setup

export function startBattle(run) {
  const level = LEVELS[run.stage]
  const b = {
    stage: run.stage,
    map: makeMap(level.theme, (run.seed || 1) + run.stage * 31),
    units: {},
    turn: 'party',
    round: 0,
    queue: [],
    log: [`${level.name}. ${level.intro}`],
    fx: [],
    fxId: 0,
    nextId: 0,
    result: null,
  }
  const heroSpawns = spawnTiles(b, 'hero')
  run.order.forEach((pid, i) => {
    const u = heroUnit(pid, run.heroes[pid])
    Object.assign(u, { q: heroSpawns[i].q, r: heroSpawns[i].r })
    if (u.st.special.includes('startHidden')) u.statuses.hidden = { turns: 2, power: 0, stacks: 1 }
    b.units[pid] = u
  })
  const enemySpawns = spawnTiles(b, 'enemy')
  const counts = level.enemies(run.order.length)
  // Bosses take the center of the back line; others fill in front of them.
  const types = Object.entries(counts).flatMap(([t, n]) => Array(n).fill(t)).sort((a, c) => (ENEMIES[c].boss ? 1 : 0) - (ENEMIES[a].boss ? 1 : 0))
  types.forEach((type, i) => {
    const id = `e${i + 1}`
    const u = monsterUnit(id, type, { stage: run.stage, heroes: run.order.length })
    const lair = { q: MAP_RADIUS - 2, r: -(MAP_RADIUS - 2) }
    const at = ENEMIES[type].boss ? lair : enemySpawns.find((t) => !unitAt(b, t.q, t.r) && key(t.q, t.r) !== key(lair.q, lair.r))
    Object.assign(u, { q: at.q, r: at.r })
    b.units[id] = u
  })
  startPartyTurn(b)
  b.round = 1
  return b
}

// ---------------------------------------------------------------- actions

// A hero's action. Returns the new battle, or the same object if invalid.
export function heroAction(battle, from, action) {
  if (battle.turn !== 'party' || battle.result) return battle
  const b = structuredClone(battle)
  const u = b.units[from]
  if (!u || u.dead || u.down || u.done) return battle

  switch (action.type) {
    case 'move': {
      const k = key(action.q, action.r)
      const cost = moveOptions(b, u)[k]
      if (!cost) return battle
      const route = []
      const all = paths(b, u, u.moveLeft)
      for (let at = k; at; at = all[at].prev) route.unshift(hexOf(at))
      fx(b, { kind: 'move', unit: u.id, path: route })
      u.q = action.q
      u.r = action.r
      u.moveLeft -= cost
      break
    }
    case 'attack': {
      if (u.acted) return battle
      const k = key(action.q, action.r)
      if (!targetsFor(b, u, 'attack').keys.includes(k)) return battle
      weaponAttack(b, u, unitAt(b, action.q, action.r))
      u.acted = true
      break
    }
    case 'skill': {
      const s = SKILLS[action.skill]
      if (u.acted || !s || !u.st.skills.includes(action.skill) || u.cds[action.skill]) return battle
      const t = targetsFor(b, u, action.skill)
      const k = t.mode === 'self' ? key(u.q, u.r) : key(action.q, action.r)
      if (!t.keys.includes(k)) return battle
      useSkill(b, u, action.skill, parse(k).length ? { q: parse(k)[0], r: parse(k)[1] } : null)
      u.acted = true
      break
    }
    case 'endTurn':
      u.done = true
      break
    default:
      return battle
  }
  if (u.acted && u.moveLeft <= 0) u.done = true
  if (checkEnd(b)) return b
  if (living(b).filter((o) => o.kind === 'hero' && !o.down).every((o) => o.done)) startEnemyTurn(b)
  return b
}

// Advance the enemy phase by one unit. The host calls this on a timer.
export function enemyStep(battle) {
  if (battle.turn !== 'enemy' || battle.result) return battle
  const b = structuredClone(battle)
  while (b.queue.length) {
    const u = b.units[b.queue.shift()]
    if (!u || u.dead) continue
    if (u.stunned) pop(b, u, 'Stunned', '#ffe060')
    else think(b, u)
    if (checkEnd(b)) return b
    break
  }
  if (!b.queue.length) startPartyTurn(b)
  return b
}

// A player left: take their hero (and summons) off the board.
export function removeHero(battle, pid) {
  const b = structuredClone(battle)
  for (const u of Object.values(b.units)) if (u.id === pid || u.owner === pid) u.dead = true
  if (checkEnd(b)) return b
  if (b.turn === 'party' && living(b).filter((o) => o.kind === 'hero' && !o.down).every((o) => o.done)) startEnemyTurn(b)
  return b
}

// ---------------------------------------------------------------- monster AI

function stepTo(b, u, k) {
  const [q, r] = parse(k)
  if (q === u.q && r === u.r) return
  const all = paths(b, u)
  const route = []
  for (let at = k; at; at = all[at]?.prev) route.unshift(hexOf(at))
  fx(b, { kind: 'move', unit: u.id, path: route })
  u.moveLeft -= all[k]?.cost || 0
  u.q = q
  u.r = r
}

// Move toward the best tile that satisfies `good`, as far as movement allows.
function approach(b, u, good, score = () => 0) {
  const all = paths(b, u)
  const here = key(u.q, u.r)
  const spots = Object.entries(all)
    .filter(([k]) => {
      const [q, r] = parse(k)
      return (k === here || !unitAt(b, q, r)) && good({ q, r })
    })
    .map(([k, v]) => ({ k, cost: v.cost + score(parse(k)) }))
    .sort((a, c) => a.cost - c.cost)
  let goal = spots[0]?.k
  if (!goal) {
    // Nothing reachable is good enough: just close the distance.
    const targets = foes(b, u)
    const nearest = (k) => {
      const [q, r] = parse(k)
      return Math.min(...targets.map((o) => distance({ q, r }, o)))
    }
    goal = Object.keys(all).filter((k) => k === here || !unitAt(b, ...parse(k))).sort((a, c) => nearest(a) - nearest(c) || all[a].cost - all[c].cost)[0]
  }
  if (!goal || goal === here) return
  // Walk back along the path until the step fits this turn's movement.
  let at = goal
  while (at && (all[at].cost > u.moveLeft || (at !== here && unitAt(b, ...parse(at))))) at = all[at].prev
  if (at && at !== here) stepTo(b, u, at)
}

function visibleFoes(b, u) {
  const all = foes(b, u)
  const seen = all.filter((o) => !o.statuses.hidden)
  return seen.length ? seen : all
}

function strikeBest(b, u) {
  const options = visibleFoes(b, u).filter((o) => distance(o, u) <= u.st.range && (u.st.range <= 1 || hasSight(b, u, o)))
  if (!options.length) return false
  const target = options.sort((a, c) => a.hp - c.hp)[0]
  weaponAttack(b, u, target)
  return true
}

const inReachOf = (b, u, range) => (h) => visibleFoes(b, u).some((o) => distance(h, o) <= range && (range <= 1 || hasSight(b, h, o)))

function think(b, u) {
  const def = ENEMIES[u.type]
  const ai = def.ai
  if (!foes(b, u).length) return

  if (ai === 'dragon') return dragon(b, u)

  if (ai === 'caster' && !u.cds.summon && living(b).filter((o) => o.type === def.summon && o.side === u.side).length < 1 + Math.floor(living(b).filter((o) => o.kind === 'hero').length / 2)) {
    const spot = neighbors(u.q, u.r).find((n) => free(b, n.q, n.r))
    if (spot) {
      b.nextId += 1
      const id = `e${100 + b.nextId}`
      const s = monsterUnit(id, def.summon, { stage: b.stage, heroes: living(b).filter((o) => o.kind === 'hero').length })
      Object.assign(s, { q: spot.q, r: spot.r })
      b.units[id] = s
      u.cds.summon = 4
      fx(b, { kind: 'burst', at: spot, radius: 0, color: '#80ff9a' })
      log(b, `${u.name} raises a skeleton!`)
      return
    }
  }

  if (ai === 'healer' && !u.cds.heal) {
    const hurtAlly = friends(b, u).filter((o) => o.hp < o.maxHp * 0.6 && distance(o, u) <= 4).sort((a, c) => a.hp / a.maxHp - c.hp / c.maxHp)[0]
    if (hurtAlly) {
      fx(b, { kind: 'bolt', unit: u.id, from: { q: u.q, r: u.r }, to: { q: hurtAlly.q, r: hurtAlly.r }, color: '#7aff9a' })
      heal(b, u, hurtAlly, roll(2, 8) + 2)
      u.cds.heal = 2
      log(b, `${u.name} heals ${hurtAlly.name}.`)
      return
    }
  }

  const ranged = u.st.range > 1
  if (ranged) {
    const threatened = foes(b, u).some((o) => distance(o, u) === 1)
    const canShoot = inReachOf(b, u, u.st.range)(u)
    if (!canShoot || threatened) {
      const safeDist = (h) => -Math.min(4, ...foes(b, u).map((o) => distance(h, o))) * 0.5
      approach(b, u, (h) => inReachOf(b, u, u.st.range)(h) && foes(b, u).every((o) => distance(h, o) > 1), safeDist)
    }
    strikeBest(b, u)
    return
  }

  approach(b, u, inReachOf(b, u, u.st.range), (h) => Math.min(...visibleFoes(b, u).map((o) => (distance(h, o) <= u.st.range ? o.hp / 20 : 9))))
  if (strikeBest(b, u)) return

  if (ai === 'spider' && !u.cds.web) {
    const target = visibleFoes(b, u).filter((o) => distance(o, u) <= 4 && hasSight(b, u, o)).sort((a, c) => distance(a, u) - distance(c, u))[0]
    if (target) {
      fx(b, { kind: 'bolt', unit: u.id, from: { q: u.q, r: u.r }, to: { q: target.q, r: target.r }, color: '#f0f0f0' })
      log(b, `${u.name} spits a web at ${target.name}.`)
      addStatus(b, u, target, { type: 'root', turns: 2, save: 'DEX' })
      u.cds.web = 3
    }
  }
}

function dragon(b, u) {
  if (!u.roared && u.hp <= u.maxHp / 2) {
    u.roared = true
    const n = 1 + Math.ceil(living(b).filter((o) => o.kind === 'hero').length / 2)
    log(b, `${u.name} roars! Kobolds pour from the tunnels.`)
    pop(b, u, 'ROAR', '#ff9a40', true)
    const spots = Object.values(b.map.tiles).filter((t) => free(b, t.q, t.r) && t.r <= -(MAP_RADIUS - 2)).slice(0, n)
    for (const t of spots) {
      b.nextId += 1
      const id = `e${100 + b.nextId}`
      const k = monsterUnit(id, 'kobold', { stage: b.stage, heroes: living(b).filter((o) => o.kind === 'hero').length })
      Object.assign(k, { q: t.q, r: t.r })
      b.units[id] = k
    }
    return
  }
  if (!u.cds.breath) {
    const hexes = within(u, 5).filter((h) => b.map.tiles[key(h.q, h.r)] && hasSight(b, u, h))
    const victims = (h) => foes(b, u).filter((o) => distance(o, h) <= 1)
    const best = hexes.map((h) => ({ h, n: victims(h).length, self: distance(h, u) <= 1 })).filter((x) => x.n && !x.self).sort((a, c) => c.n - a.n)[0]
    if (best && (best.n >= 2 || Math.random() < 0.6)) {
      log(b, `${u.name} breathes fire!`)
      fx(b, { kind: 'burst', at: best.h, radius: 1, color: '#ff6a20', from: { q: u.q, r: u.r } })
      for (const o of victims(best.h)) {
        let n = roll(4, 8)
        if (die(20) + o.st.saves.DEX >= 13 + b.stage) n = Math.floor(n / 2)
        hurt(b, u, o, n, ['fire'])
        addStatus(b, u, o, { type: 'burn', turns: 2, chance: 0.5 })
      }
      u.cds.breath = 3
      return
    }
  }
  approach(b, u, inReachOf(b, u, 1))
  if (!strikeBest(b, u) && !u.cds.breath) u.cds.breath = 0
}
