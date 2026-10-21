// Weapons. `ability` is STR, DEX, finesse (best of STR/DEX) or spell (the
// class's casting ability). `model` is what the 3D hero holds.

export const WEAPONS = {
  longsword: { name: 'Longsword', dice: [1, 8], ability: 'STR', range: 1, tags: [], model: { type: 'sword' }, blurb: 'Reliable steel.' },
  rapier: { name: 'Rapier', dice: [1, 8], ability: 'finesse', range: 1, tags: [], model: { type: 'sword', metal: '#d8dce4' }, blurb: 'Quick and precise. Uses STR or DEX.' },
  greatsword: { name: 'Greatsword', dice: [2, 6], ability: 'STR', range: 1, tags: [], model: { type: 'greatsword' }, blurb: 'Huge, heavy, devastating.' },
  greataxe: { name: 'Greataxe', dice: [1, 12], ability: 'STR', range: 1, tags: ['bleed'], model: { type: 'greataxe' }, blurb: 'Big swings, big wounds.' },
  handaxe: { name: 'Battleaxe', dice: [1, 8], ability: 'STR', range: 1, tags: ['bleed'], model: { type: 'axe' }, blurb: 'Bites deep.' },
  warhammer: { name: 'Warhammer', dice: [1, 10], ability: 'STR', range: 1, tags: ['blunt'], model: { type: 'warhammer' }, blurb: 'Crushes bones. Extra damage to skeletons.' },
  mace: { name: 'Mace', dice: [1, 8], ability: 'STR', range: 1, tags: ['blunt'], model: { type: 'mace', metal: '#c8c8d0' }, blurb: 'A cleric\'s friend.' },
  flail: { name: 'Flail', dice: [1, 10], ability: 'STR', range: 1, tags: ['blunt'], model: { type: 'flail' }, blurb: 'Unpredictable and mean.' },
  spear: { name: 'Spear', dice: [1, 8], ability: 'STR', range: 2, tags: [], model: { type: 'spear', metal: '#b8bcc4' }, blurb: 'Reach: hits 2 hexes away.' },
  runeblade: { name: 'Runeblade', dice: [1, 10], ability: 'STR', range: 1, tags: ['frost'], model: { type: 'runeblade' }, blurb: 'Frost runes that chill on hit.' },
  scythe: { name: 'Reaper\'s Scythe', dice: [1, 10], ability: 'STR', range: 2, tags: ['shadow'], model: { type: 'scythe', glow: '#80ff9a' }, blurb: 'Reach: hits 2 hexes away.' },
  daggers: { name: 'Twin Daggers', dice: [1, 4], hits: 2, ability: 'finesse', range: 1, tags: [], model: { type: 'daggers', metal: '#c0c6cc' }, blurb: 'Two strikes every attack.' },
  fists: { name: 'Martial Arts', dice: [1, 6], hits: 2, ability: 'finesse', range: 1, tags: ['blunt'], model: { type: 'fists' }, blurb: 'Two strikes every attack.' },
  quarterstaff: { name: 'Quarterstaff', dice: [1, 8], ability: 'finesse', range: 1, tags: ['blunt'], model: { type: 'woodStaff' }, blurb: 'Simple and sturdy.' },
  bow: { name: 'Longbow', dice: [1, 8], ability: 'DEX', range: 6, tags: [], model: { type: 'bow' }, blurb: 'Range 6.' },
  crossbow: { name: 'Heavy Crossbow', dice: [1, 10], ability: 'DEX', range: 5, tags: [], model: { type: 'crossbow', metal: '#c8a040' }, blurb: 'Range 5. Hits hard.' },
  lute: { name: 'Battle Lute', dice: [1, 8], ability: 'spell', range: 4, tags: ['sonic'], model: { type: 'lute' }, blurb: 'Range 4. Strums sonic blasts.' },
  arcaneStaff: { name: 'Arcane Staff', dice: [1, 10], ability: 'spell', range: 5, tags: ['arcane'], model: { type: 'staff', glow: '#80c0ff' }, blurb: 'Range 5 arcane bolts.' },
  fireWand: { name: 'Wand of Embers', dice: [1, 10], ability: 'spell', range: 5, tags: ['fire'], model: { type: 'wand', glow: '#ff8a30' }, blurb: 'Range 5 fire bolts.' },
  stormWand: { name: 'Storm Wand', dice: [1, 10], ability: 'spell', range: 5, tags: ['lightning'], model: { type: 'wand', glow: '#80d0ff' }, blurb: 'Range 5 lightning bolts.' },
  orb: { name: 'Chaos Orb', dice: [1, 10], ability: 'spell', range: 5, tags: ['fire'], model: { type: 'orb', glow: '#ffb040' }, blurb: 'Range 5 fire bolts.' },
  shadowStaff: { name: 'Bone Staff', dice: [1, 10], ability: 'spell', range: 5, tags: ['shadow'], model: { type: 'staff', glow: '#80ff9a', wood: '#d8d0b8' }, blurb: 'Range 5 shadow bolts.' },
  holySymbol: { name: 'Sunburst Mace', dice: [1, 8], ability: 'STR', range: 1, tags: ['holy', 'blunt'], model: { type: 'mace', metal: '#e0c050', glow: '#fff0a0' }, blurb: 'Holy damage. Double vs undead.' },
  natureStaff: { name: 'Living Staff', dice: [1, 8], ability: 'spell', range: 4, tags: ['nature'], model: { type: 'woodStaff' }, blurb: 'Range 4 nature bolts.' },
  totem: { name: 'Spirit Totem', dice: [1, 8], ability: 'spell', range: 4, tags: ['lightning'], model: { type: 'totem' }, blurb: 'Range 4 lightning.' },
}

export const STARTING_WEAPONS = {
  warrior: ['longsword', 'greataxe', 'warhammer', 'spear'],
  wizard: ['arcaneStaff', 'fireWand', 'stormWand'],
  rogue: ['daggers', 'rapier', 'crossbow'],
  bard: ['lute', 'rapier', 'crossbow'],
  druid: ['natureStaff', 'spear', 'quarterstaff'],
  cleric: ['holySymbol', 'warhammer', 'mace'],
  paladin: ['longsword', 'greatsword', 'warhammer'],
  shaman: ['totem', 'handaxe', 'spear'],
  monk: ['fists', 'quarterstaff', 'spear'],
  'death-knight': ['runeblade', 'greataxe', 'flail'],
  necromancer: ['shadowStaff', 'scythe', 'fireWand'],
  sorcerer: ['orb', 'stormWand', 'fireWand'],
  ranger: ['bow', 'crossbow', 'daggers'],
}

export const CASTING = { wizard: 'INT', necromancer: 'INT', sorcerer: 'CHA', bard: 'CHA', paladin: 'CHA', cleric: 'WIS', druid: 'WIS', shaman: 'WIS', monk: 'WIS', ranger: 'WIS', rogue: 'INT', warrior: 'CON', 'death-knight': 'CHA' }
export const HIT_DIE = { warrior: 10, paladin: 10, 'death-knight': 10, ranger: 10, monk: 8, rogue: 8, bard: 8, cleric: 8, druid: 8, shaman: 8, wizard: 6, sorcerer: 6, necromancer: 6 }
