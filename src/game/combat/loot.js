import { SKILLS } from './skills'

// Level-up rewards. Items have a slot, stat bonuses (`stats`), flat modifiers
// (`mods`), on-hit effects (`onHit`) and special rules (`special`). Tags drive
// synergies: offers favor tags a hero already has.
//
// mods: hp, ac, speed, toHit, dmg, spellDmg, crit (crit range), heal (%),
// dot (extra damage per burn/bleed/poison tick), lifesteal, thorns, cdr, range.

export const ITEMS = {
  // Weapon enchantments: add effects and change the weapon's glow.
  flametongue: { name: 'Flametongue', slot: 'weapon', rarity: 'rare', tags: ['fire'], onHit: { extraDice: [1, 6], extraTags: ['fire'], status: { type: 'burn', turns: 2, chance: 0.3 } }, glow: '#ff6a20', icon: 'flame-spin', desc: 'Weapon hits deal +1d6 fire and may burn.' },
  frostbrand: { name: 'Frostbrand', slot: 'weapon', rarity: 'rare', tags: ['frost'], onHit: { extraDice: [1, 6], extraTags: ['frost'], status: { type: 'slow', turns: 1, chance: 0.35 } }, glow: '#80e0ff', icon: 'ice-spell-cast', desc: 'Weapon hits deal +1d6 frost and may slow.' },
  venomEdge: { name: 'Venom Edge', slot: 'weapon', rarity: 'common', tags: ['poison'], onHit: { status: { type: 'poison', turns: 3, chance: 0.4 } }, glow: '#80e040', icon: 'dripping-blade', desc: 'Weapon hits may poison (40%).' },
  serrated: { name: 'Serrated Edge', slot: 'weapon', rarity: 'common', tags: ['bleed'], onHit: { status: { type: 'bleed', turns: 3, chance: 0.4 } }, glow: '#c02a2a', icon: 'serrated-slash', desc: 'Weapon hits may cause bleeding (40%).' },
  thunderstrike: { name: 'Thunderstrike', slot: 'weapon', rarity: 'rare', tags: ['lightning'], onHit: { extraDice: [1, 8], extraTags: ['lightning'] }, glow: '#a0d8ff', icon: 'lightning-tear', desc: 'Weapon hits deal +1d8 lightning.' },
  holyAvenger: { name: 'Holy Avenger', slot: 'weapon', rarity: 'epic', tags: ['holy'], onHit: { extraDice: [2, 6], extraTags: ['holy'] }, mods: { toHit: 1 }, glow: '#fff0a0', icon: 'winged-sword', desc: '+1 to hit; weapon hits deal +2d6 holy.' },
  vorpal: { name: 'Vorpal Edge', slot: 'weapon', rarity: 'epic', tags: ['crit'], mods: { crit: 2, dmg: 2 }, glow: '#e0e0ff', icon: 'sword-wound', desc: 'Crit on 18-20, +2 damage.' },
  vampiric: { name: 'Vampiric Blade', slot: 'weapon', rarity: 'rare', tags: ['shadow'], mods: { lifesteal: 0.25 }, glow: '#c02050', icon: 'bloody-sword', desc: 'Heal for 25% of all damage you deal.' },
  sharpened: { name: 'Whetstone', slot: 'weapon', rarity: 'common', tags: ['crit'], mods: { dmg: 2 }, icon: 'stone-sphere', desc: '+2 damage on every hit.' },

  // Armor: changes the outfit on the 3D model.
  chainmail: { name: 'Chainmail', slot: 'armor', rarity: 'common', tags: [], mods: { ac: 2 }, model: { main: '#8a9098', metal: true }, icon: 'chain-mail', desc: '+2 AC.' },
  mithral: { name: 'Mithral Shirt', slot: 'armor', rarity: 'rare', tags: [], mods: { ac: 2, speed: 1 }, model: { main: '#d8e0e8', metal: true }, icon: 'chain-mail', desc: '+2 AC and +1 movement.' },
  dragonscale: { name: 'Dragonscale Coat', slot: 'armor', rarity: 'epic', tags: ['fire'], mods: { ac: 3, hp: 10 }, model: { main: '#a02a2a', metal: true, add: ['pauldrons'] }, icon: 'dragon-shield', desc: '+3 AC and +10 max HP.' },
  thornmail: { name: 'Thorn Mail', slot: 'armor', rarity: 'rare', tags: ['nature'], mods: { ac: 1, thorns: 4 }, model: { add: ['leafMantle', 'spikedPauldrons'] }, icon: 'thorny-vine', desc: '+1 AC. Attackers in melee take 4 damage.' },
  archmageRobes: { name: 'Robes of the Archmage', slot: 'armor', rarity: 'rare', tags: ['arcane'], mods: { spellDmg: 3, ac: 1 }, model: { main: '#1a2a5a', accent: '#c0a0ff', glowTrim: true }, icon: 'robe', desc: '+3 damage on spells and spell bolts, +1 AC.' },
  shadowCloak: { name: 'Cloak of Shadows', slot: 'armor', rarity: 'rare', tags: ['shadow', 'crit'], mods: { ac: 1 }, special: 'startHidden', model: { cape: '#14121c', add: ['hood'] }, icon: 'hood', desc: '+1 AC. Start every battle hidden (+4 to hit).' },
  gildedPlate: { name: 'Gilded Plate', slot: 'armor', rarity: 'epic', tags: ['holy'], mods: { ac: 4, speed: -1 }, model: { main: '#d8b040', metal: true, add: ['pauldrons', 'cape'] }, icon: 'breastplate', desc: '+4 AC, -1 movement.' },
  wolfPelt: { name: 'Wolf-Pelt Mantle', slot: 'armor', rarity: 'common', tags: ['nature'], mods: { hp: 8, ac: 1 }, model: { add: ['furMantle'] }, icon: 'wolf-head', desc: '+8 max HP and +1 AC.' },

  // Relics float around the hero.
  emberHeart: { name: 'Ember Heart', slot: 'relic', rarity: 'rare', tags: ['fire'], mods: { dot: 3 }, model: { type: 'crystal', color: '#ff6a20' }, icon: 'fire-gem', desc: 'Burn, bleed and poison you cause deal +3 per tick.' },
  bloodstone: { name: 'Bloodstone', slot: 'relic', rarity: 'rare', tags: ['bleed'], special: 'bloodstone', model: { type: 'crystal', color: '#c02030' }, icon: 'crystal-growth', desc: '+4 damage against bleeding targets, and heal 2 when you hit one.' },
  frozenHeart: { name: 'Frozen Heart', slot: 'relic', rarity: 'rare', tags: ['frost'], special: 'shatter', model: { type: 'orb', color: '#80e0ff' }, icon: 'frozen-orb', desc: 'Your attacks deal +50% damage to slowed or stunned targets.' },
  plagueIdol: { name: 'Plague Idol', slot: 'relic', rarity: 'rare', tags: ['poison'], special: 'plague', mods: { dot: 2 }, model: { type: 'skull', color: '#a0d060' }, icon: 'skull-crack', desc: 'Poison ticks +2. Poisoned enemies have -2 to hit.' },
  luckyD20: { name: 'Lucky Golden D20', slot: 'relic', rarity: 'common', tags: ['crit'], mods: { crit: 1, toHit: 1 }, model: { type: 'd20', color: '#e8c040' }, icon: 'dice-twenty-faces-twenty', desc: '+1 to hit, crit on 19-20.' },
  phoenixFeather: { name: 'Phoenix Feather', slot: 'relic', rarity: 'epic', tags: ['fire', 'holy'], special: 'phoenix', model: { type: 'feather', color: '#ff7a2a' }, icon: 'feather', desc: 'Once per battle, rise again at half health when you fall.' },
  holySymbol: { name: 'Sacred Symbol', slot: 'relic', rarity: 'common', tags: ['holy'], mods: { heal: 0.5 }, model: { type: 'holy', color: '#f0d060' }, icon: 'ankh', desc: 'Your heals are 50% stronger.' },
  stormRune: { name: 'Storm Rune', slot: 'relic', rarity: 'rare', tags: ['lightning'], special: 'stormRune', mods: { spellDmg: 1 }, model: { type: 'rune', color: '#80d0ff' }, icon: 'rune-stone', desc: 'Lightning jumps to 1 extra enemy. 25% chance to stun on lightning hits.' },
  healthAmulet: { name: 'Amulet of Health', slot: 'relic', rarity: 'common', tags: [], mods: { hp: 12 }, model: { type: 'amulet', color: '#e0b040' }, icon: 'gem-pendant', desc: '+12 max HP.' },
  hourglass: { name: 'Hourglass of Haste', slot: 'relic', rarity: 'epic', tags: ['arcane'], mods: { cdr: 1, speed: 1 }, model: { type: 'hourglass', color: '#d8c080' }, icon: 'hourglass', desc: 'Skill cooldowns are 1 shorter. +1 movement.' },
  orbOfPower: { name: 'Orb of Power', slot: 'relic', rarity: 'rare', tags: ['arcane'], mods: { spellDmg: 3 }, model: { type: 'orb', color: '#a070ff' }, icon: 'crystal-ball', desc: '+3 damage on spells and spell bolts.' },
  lichSkull: { name: 'Skull of the Lich', slot: 'relic', rarity: 'rare', tags: ['shadow'], special: 'soulHarvest', model: { type: 'skull', color: '#e8e0c8' }, icon: 'death-skull', desc: 'Heal 6 every time you defeat an enemy.' },

  // Pets: passive bonuses and a companion on the model.
  owl: { name: 'Wise Owl', slot: 'pet', rarity: 'common', tags: [], mods: { toHit: 1, range: 1 }, model: { type: 'owl', color: '#8a6a4a' }, icon: 'barn-owl', desc: '+1 to hit, +1 range for ranged attacks.' },
  raven: { name: 'Raven Familiar', slot: 'pet', rarity: 'common', tags: ['shadow'], special: 'ravenMark', model: { type: 'raven', color: '#1a1a22' }, icon: 'raven', desc: 'Your hits mark the target 30% of the time (+25% damage taken).' },
  bearCub: { name: 'Bear Cub', slot: 'pet', rarity: 'common', tags: ['nature'], mods: { hp: 10, ac: 1 }, model: { type: 'bear', color: '#6a4a2a' }, icon: 'bear-face', desc: '+10 max HP and +1 AC.' },
  wisp: { name: 'Will-o\'-Wisp', slot: 'pet', rarity: 'rare', tags: ['nature', 'holy'], special: 'regen', model: { type: 'wisp', color: '#a0e0ff', glow: '#a0e0ff' }, icon: 'sparkles', desc: 'Regenerate 3 HP at the start of every turn.' },
  dragonWhelp: { name: 'Dragon Whelp', slot: 'pet', rarity: 'epic', tags: ['fire'], special: 'whelp', model: { type: 'dragon', color: '#c03a2a' }, icon: 'wyvern', desc: 'At the start of your turn the whelp breathes fire on a nearby enemy (2d6, burns).' },
  imp: { name: 'Pet Imp', slot: 'pet', rarity: 'rare', tags: ['fire', 'shadow'], mods: { spellDmg: 2, dot: 1 }, model: { type: 'imp', color: '#b83a3a' }, icon: 'imp', desc: '+2 spell damage, +1 damage-over-time.' },

  // Tomes: raw stats.
  tomeSTR: { name: 'Manual of Gainful Exercise', slot: 'tome', rarity: 'common', tags: [], stats: { STR: 2 }, icon: 'muscle-up', desc: '+2 Strength (melee hit and damage).' },
  tomeDEX: { name: 'Manual of Quickness', slot: 'tome', rarity: 'common', tags: [], stats: { DEX: 2 }, icon: 'run', desc: '+2 Dexterity (AC, ranged hit and damage).' },
  tomeCON: { name: 'Manual of Bodily Health', slot: 'tome', rarity: 'common', tags: [], stats: { CON: 2 }, icon: 'heart-organ', desc: '+2 Constitution (more HP each level).' },
  tomeMIND: { name: 'Tome of Clear Thought', slot: 'tome', rarity: 'common', tags: ['arcane'], stats: { INT: 2, WIS: 2, CHA: 2 }, icon: 'book-cover', desc: '+2 Intelligence, Wisdom and Charisma (spell power).' },
}

const SKILL_LOOT = ['meteor', 'whirlwind', 'execute', 'holyNova', 'poisonCloud', 'blink', 'battleShout', 'iceLance', 'rend', 'shadowBolt', 'rejuvenation', 'ironSkin', 'thunderclap', 'deadeye', 'summonWolf', 'chainLightning', 'fireball', 'frostRay', 'sacredFlame', 'healingWord', 'lifeDrain']
const SKILL_RARITY = { meteor: 'epic', summonWolf: 'rare', holyNova: 'rare', thunderclap: 'rare', battleShout: 'rare', execute: 'rare', deadeye: 'rare' }

const WEIGHT = { common: 6, rare: 3, epic: 1 }

export function lootTags(entry) {
  if (entry.kind === 'skill') return SKILLS[entry.id].tags || []
  return ITEMS[entry.id].tags || []
}

// Three random offers for a hero, favoring tags they already have.
export function rollOffers(hero, level, random) {
  const owned = new Set([...(hero.items || []), ...(hero.skills || [])])
  const heroTags = new Set()
  for (const id of hero.items || []) (ITEMS[id].tags || []).forEach((t) => heroTags.add(t))
  for (const id of hero.skills || []) (SKILLS[id].tags || []).forEach((t) => heroTags.add(t))

  const pool = [
    ...Object.keys(ITEMS).filter((id) => !owned.has(id) || ITEMS[id].slot === 'tome').map((id) => ({ kind: 'item', id, rarity: ITEMS[id].rarity })),
    ...SKILL_LOOT.filter((id) => !owned.has(id)).map((id) => ({ kind: 'skill', id, rarity: SKILL_RARITY[id] || 'common' })),
  ]
  const weighted = pool.map((e) => {
    let w = WEIGHT[e.rarity] * (e.rarity === 'epic' && level < 2 ? 0.2 : 1)
    if (lootTags(e).some((t) => heroTags.has(t))) w *= 2.5
    return { e, w }
  })
  const picks = []
  for (let n = 0; n < 3 && weighted.length; n++) {
    const total = weighted.reduce((s, x) => s + x.w, 0)
    let roll = random() * total
    const i = weighted.findIndex((x) => (roll -= x.w) <= 0)
    picks.push(weighted.splice(i < 0 ? 0 : i, 1)[0].e)
  }
  return picks
}
