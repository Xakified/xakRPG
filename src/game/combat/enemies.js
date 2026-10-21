// Enemy roster and the five levels of a run.

const bone = '#e8e0c8'
const SKELETON = { size: 1, f: { noHair: true, glowEyes: '#60ffd0', slender: true, ears: 'none' } }

export const ENEMIES = {
  goblin: { name: 'Goblin', hp: 9, ac: 13, speed: 5, toHit: 4, dmg: [1, 6, 2], range: 1, save: 1, ai: 'melee',
    model: { kind: 'humanoid', race: 'goblin', look: { skin: '#7a9a4a', hair: 'mohawk', hairColor: '#2a1d14', fat: 0.2, muscle: 0.3 }, outfit: { style: 'leather', main: '#5a4a2a', accent: '#7a2a1a', extras: [] }, weapon: { type: 'sword', metal: '#9a8a7a' } } },
  goblinArcher: { name: 'Goblin Archer', hp: 7, ac: 12, speed: 4, toHit: 4, dmg: [1, 6, 2], range: 5, save: 1, ai: 'ranged',
    model: { kind: 'humanoid', race: 'goblin', look: { skin: '#8aa04a', hair: 'bald', fat: 0.1, muscle: 0.2 }, outfit: { style: 'leather', main: '#3a4a2a', accent: '#5a3a1a', extras: ['hood'] }, weapon: { type: 'bow' } } },
  wolf: { name: 'Wolf', hp: 11, ac: 13, speed: 6, toHit: 4, dmg: [2, 4, 2], range: 1, save: 1, ai: 'melee', pack: true, beast: true,
    model: { kind: 'creature', type: 'wolf', color: '#6a6a72', scale: 1.4 } },
  skeleton: { name: 'Skeleton', hp: 13, ac: 13, speed: 4, toHit: 4, dmg: [1, 6, 2], range: 1, save: 0, ai: 'melee', undead: true, brittle: true,
    model: { kind: 'humanoid', raceDef: SKELETON, look: { skin: bone, fat: 0, muscle: 0 }, outfit: { style: 'cloth', main: '#5a5048', accent: '#3a342e', extras: [] }, weapon: { type: 'sword', metal: '#8a8070' } } },
  skeletonArcher: { name: 'Skeleton Archer', hp: 11, ac: 12, speed: 4, toHit: 4, dmg: [1, 8, 2], range: 6, save: 0, ai: 'ranged', undead: true, brittle: true,
    model: { kind: 'humanoid', raceDef: SKELETON, look: { skin: bone, fat: 0, muscle: 0 }, outfit: { style: 'cloth', main: '#4a4038', accent: '#2a2420', extras: ['hood'] }, weapon: { type: 'bow', wood: '#5a4a3a' } } },
  zombie: { name: 'Zombie', hp: 22, ac: 8, speed: 3, toHit: 3, dmg: [1, 8, 1], range: 1, save: 0, ai: 'melee', undead: true, undying: true,
    model: { kind: 'humanoid', race: 'human', look: { skin: '#7a9a6a', hair: 'wild', hairColor: '#3a3a2a', fat: 0.5, muscle: 0.2 }, outfit: { style: 'cloth', main: '#4a4a3a', accent: '#3a3a2e', extras: [] }, weapon: { type: 'fists' } } },
  cultist: { name: 'Necromancer', hp: 16, ac: 12, speed: 4, toHit: 5, dmg: [2, 6, 1], range: 5, save: 2, ai: 'caster', tags: ['shadow'], summon: 'skeleton',
    model: { kind: 'humanoid', race: 'human', look: { skin: '#c8b8a8', hair: 'long', hairColor: '#1a1410', fat: 0.1, muscle: 0.1 }, outfit: { style: 'robe', main: '#3a0e16', accent: '#a02a2a', extras: ['hood', 'skullPauldron'] }, weapon: { type: 'staff', glow: '#80ff9a', wood: '#d8d0b8' } } },
  spider: { name: 'Giant Spider', hp: 26, ac: 14, speed: 5, toHit: 5, dmg: [1, 8, 3], range: 1, save: 2, ai: 'spider', beast: true, onHit: { type: 'poison', turns: 2, chance: 0.5 },
    model: { kind: 'creature', type: 'spider', color: '#2a2228', scale: 1.6 } },
  spiderling: { name: 'Spiderling', hp: 6, ac: 12, speed: 5, toHit: 3, dmg: [1, 4, 1], range: 1, save: 0, ai: 'melee', beast: true, onHit: { type: 'poison', turns: 2, chance: 0.3 },
    model: { kind: 'creature', type: 'spider', color: '#4a3a3a', scale: 0.8 } },
  orc: { name: 'Orc Warrior', hp: 18, ac: 13, speed: 5, toHit: 5, dmg: [1, 10, 3], range: 1, save: 2, ai: 'melee',
    model: { kind: 'humanoid', race: 'orc', look: { skin: '#5a7a3a', hair: 'topknot', hairColor: '#1a1410', fat: 0.3, muscle: 0.9 }, outfit: { style: 'leather', main: '#4a3020', accent: '#8a2020', extras: ['spikedPauldrons'] }, weapon: { type: 'greataxe', metal: '#8a8a8a' } } },
  orcShaman: { name: 'Orc Shaman', hp: 16, ac: 12, speed: 4, toHit: 5, dmg: [2, 6, 2], range: 4, save: 2, ai: 'healer', tags: ['lightning'],
    model: { kind: 'humanoid', race: 'orc', look: { skin: '#6a8a4a', hair: 'dreads', hairColor: '#3a2a1a', fat: 0.4, muscle: 0.5 }, outfit: { style: 'leather', main: '#3a4a5a', accent: '#a07a4a', extras: ['furMantle', 'beads'] }, weapon: { type: 'totem' } } },
  ogre: { name: 'Ogre', hp: 40, ac: 11, speed: 4, toHit: 6, dmg: [2, 8, 4], range: 1, save: 2, ai: 'melee', big: true,
    model: { kind: 'humanoid', race: 'goliath', size: 1.45, look: { skin: '#a0a070', hair: 'bald', fat: 1, muscle: 0.7 }, outfit: { style: 'cloth', main: '#6a5030', accent: '#4a3020', extras: [] }, weapon: { type: 'warhammer', metal: '#6a5a4a' } } },
  kobold: { name: 'Kobold', hp: 8, ac: 12, speed: 5, toHit: 4, dmg: [1, 6, 2], range: 1, save: 1, ai: 'melee', pack: true,
    model: { kind: 'humanoid', race: 'kobold', look: { skin: '#b85a2a', fat: 0.1, muscle: 0.2 }, outfit: { style: 'leather', main: '#4a3020', accent: '#c03a2a', extras: [] }, weapon: { type: 'spear', metal: '#9a9a9a' } } },
  dragon: { name: 'Ignaxis the Red', hp: 40, hpPerHero: 36, ac: 17, speed: 4, toHit: 6, dmg: [2, 8, 4], range: 1, save: 4, ai: 'dragon', boss: true, immune: ['fire'],
    model: { kind: 'creature', type: 'dragonBoss', color: '#a82a1e', scale: 4.2 } },
  // Allies summoned by heroes
  skeletonAlly: { name: 'Risen Skeleton', hp: 12, ac: 13, speed: 4, toHit: 5, dmg: [1, 6, 3], range: 1, save: 0, ai: 'melee', undead: true,
    model: { kind: 'humanoid', raceDef: { ...SKELETON, f: { ...SKELETON.f, glowEyes: '#80ff9a' } }, look: { skin: bone, fat: 0, muscle: 0 }, outfit: { style: 'cloth', main: '#2a3a2a', accent: '#1a2a1a', extras: [] }, weapon: { type: 'sword', metal: '#a0a8a0' } } },
  wolfAlly: { name: 'Dire Wolf', hp: 18, ac: 13, speed: 6, toHit: 5, dmg: [2, 6, 2], range: 1, save: 1, ai: 'melee', pack: true, beast: true,
    model: { kind: 'creature', type: 'wolf', color: '#9a9aa2', scale: 1.6 } },
}

export const LEVELS = [
  {
    name: 'The Goblin Woods', theme: 'forest', icon: 'forest',
    intro: 'Goblins and their wolves have been raiding the road. Clear them out.',
    enemies: (n) => ({ goblin: n, goblinArcher: Math.ceil(n / 3), wolf: Math.floor(n / 2) }),
  },
  {
    name: 'The Forgotten Crypt', theme: 'crypt', icon: 'tombstone',
    intro: 'Something is raising the dead beneath the old chapel.',
    enemies: (n) => ({ skeleton: n, skeletonArcher: Math.floor((n + 1) / 3), zombie: Math.floor(n / 2), cultist: 1 }),
  },
  {
    name: 'The Webbed Caverns', theme: 'cave', icon: 'spider-web',
    intro: 'The mine went quiet a week ago. The miners never came out.',
    enemies: (n) => ({ spider: Math.ceil(n / 2), spiderling: 1 + n }),
  },
  {
    name: 'The Orc Warcamp', theme: 'warcamp', icon: 'tribal-mask',
    intro: 'The warband that burned the valley camps here tonight.',
    enemies: (n) => ({ orc: n, orcShaman: 1, ogre: n >= 3 ? 1 : 0, goblinArcher: Math.floor(n / 2) }),
  },
  {
    name: 'Lair of Ignaxis', theme: 'lair', icon: 'dragon-head',
    intro: 'The red dragon behind it all waits on a mountain of gold.',
    enemies: (n) => ({ dragon: 1, kobold: Math.max(1, n - 1) }),
  },
]
