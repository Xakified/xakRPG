// Active skills. Every class starts with two; more come from level-up loot.
//
// kind: strike (weapon attack plus extras), bolt (ranged spell attack),
// blast (area at a hex, DEX save for half), nova (area around the caster),
// heal, groupHeal, buff, teleport, summon, pull.
// target: enemy, ally (includes self), self, hex.

export const SKILLS = {
  // Warrior
  cleave: { name: 'Cleave', icon: 'sword-spin', kind: 'strike', target: 'self', aoe: 'adjacent', cd: 2, desc: 'Weapon attack against every adjacent enemy.' },
  secondWind: { name: 'Second Wind', icon: 'healing', kind: 'heal', target: 'self', range: 0, cd: 4, dice: [1, 10], plusLevel: true, ability: 'CON', desc: 'Heal yourself for 1d10 + level + CON.' },
  // Wizard
  fireball: { name: 'Fireball', icon: 'fireball', kind: 'blast', target: 'hex', range: 6, radius: 1, cd: 3, dice: [3, 6], tags: ['fire'], status: { type: 'burn', turns: 2, chance: 0.5 }, desc: '3d6 fire to everything in a small area (DEX save for half). May burn.' },
  frostRay: { name: 'Ray of Frost', icon: 'ice-bolt', kind: 'bolt', target: 'enemy', range: 5, cd: 2, dice: [2, 8], tags: ['frost'], status: { type: 'slow', turns: 2 }, desc: '2d8 frost and slows the target.' },
  // Rogue
  sneakAttack: { name: 'Sneak Attack', icon: 'backstab', kind: 'strike', target: 'enemy', cd: 2, extraDice: [3, 6], sneak: true, desc: 'Weapon attack +3d6. Needs an ally next to the target, or for you to be hidden.' },
  shadowstep: { name: 'Shadowstep', icon: 'teleport', kind: 'teleport', target: 'hex', range: 4, cd: 3, status: { type: 'hidden', turns: 2 }, desc: 'Teleport up to 4 hexes and become hidden (+4 to hit next attack).' },
  // Bard
  mockery: { name: 'Vicious Mockery', icon: 'shouting', kind: 'bolt', target: 'enemy', range: 5, cd: 1, dice: [2, 6], tags: ['psychic'], noRoll: true, status: { type: 'weaken', turns: 2 }, desc: 'An insult so cruel it deals 2d6 and weakens the target. Never misses.' },
  inspire: { name: 'Inspire', icon: 'musical-notes', kind: 'buff', target: 'ally', range: 5, cd: 2, status: { type: 'bless', turns: 2 }, desc: 'An ally gets +2 to hit and +2 damage for 2 turns.' },
  // Druid
  thornWhip: { name: 'Thorn Whip', icon: 'thorn-helix', kind: 'bolt', target: 'enemy', range: 4, cd: 1, dice: [2, 6], tags: ['nature'], pull: true, desc: '2d6 nature damage and drags the target toward you.' },
  healingWord: { name: 'Healing Word', icon: 'health-normal', kind: 'heal', target: 'ally', range: 5, cd: 2, dice: [2, 6], ability: 'spell', desc: 'Heal an ally within 5 hexes.' },
  // Cleric
  sacredFlame: { name: 'Sacred Flame', icon: 'sun-radiations', kind: 'bolt', target: 'enemy', range: 5, cd: 1, dice: [2, 8], tags: ['holy'], save: true, desc: '2d8 holy fire (DEX save for half). Undead take double.' },
  cureWounds: { name: 'Cure Wounds', icon: 'heart-plus', kind: 'heal', target: 'ally', range: 2, cd: 2, dice: [3, 8], ability: 'spell', desc: 'Big heal on an ally within 2 hexes.' },
  // Paladin
  smite: { name: 'Divine Smite', icon: 'sword-in-stone', kind: 'strike', target: 'enemy', cd: 2, extraDice: [2, 8], extraTags: ['holy'], desc: 'Weapon attack +2d8 holy.' },
  layOnHands: { name: 'Lay on Hands', icon: 'hand-of-god', kind: 'heal', target: 'ally', range: 1, cd: 4, flat: 6, perLevel: 6, desc: 'Heal an adjacent ally for 6 per level.' },
  // Shaman
  chainLightning: { name: 'Chain Lightning', icon: 'chain-lightning', kind: 'bolt', target: 'enemy', range: 5, cd: 3, dice: [2, 8], tags: ['lightning'], bounce: 2, desc: '2d8 lightning that jumps to 2 more enemies.' },
  spiritMend: { name: 'Spirit Mend', icon: 'totem', kind: 'groupHeal', target: 'self', radius: 2, cd: 3, dice: [1, 8], ability: 'spell', desc: 'Heal every ally within 2 hexes (you too).' },
  // Monk
  flurry: { name: 'Flurry of Blows', icon: 'fist', kind: 'strike', target: 'enemy', cd: 2, hits: 3, desc: 'Three quick strikes.' },
  stunningStrike: { name: 'Stunning Strike', icon: 'punch-blast', kind: 'strike', target: 'enemy', cd: 3, status: { type: 'stun', turns: 1, save: 'CON' }, desc: 'Weapon attack that can stun (CON save).' },
  // Death Knight
  deathGrip: { name: 'Death Grip', icon: 'grab', kind: 'pull', target: 'enemy', range: 5, cd: 3, status: { type: 'slow', turns: 2 }, desc: 'Yank an enemy next to you and slow it.' },
  frostStrike: { name: 'Frost Strike', icon: 'frozen-orb', kind: 'strike', target: 'enemy', cd: 2, extraDice: [2, 6], extraTags: ['frost'], status: { type: 'slow', turns: 2 }, desc: 'Weapon attack +2d6 frost and slows.' },
  // Necromancer
  lifeDrain: { name: 'Life Drain', icon: 'heart-drop', kind: 'bolt', target: 'enemy', range: 4, cd: 2, dice: [2, 8], tags: ['shadow'], drain: 0.5, desc: '2d8 shadow damage; heal for half.' },
  raiseDead: { name: 'Raise Skeleton', icon: 'raise-skeleton', kind: 'summon', target: 'hex', range: 2, cd: 4, summon: 'skeletonAlly', desc: 'Raise a skeleton that fights for you.' },
  // Sorcerer
  chaosBolt: { name: 'Chaos Bolt', icon: 'unstable-orb', kind: 'bolt', target: 'enemy', range: 6, cd: 1, dice: [2, 8], tags: ['chaos'], chaos: true, desc: '2d8 of a random element (fire, frost or lightning).' },
  arcaneWard: { name: 'Arcane Ward', icon: 'magic-shield', kind: 'buff', target: 'self', cd: 3, status: { type: 'ward', turns: 2 }, shield: [2, 6], desc: '+4 AC for 2 turns and a 2d6 magic shield.' },
  // Ranger
  volley: { name: 'Volley', icon: 'arrow-cluster', kind: 'blast', target: 'hex', range: 6, radius: 1, cd: 3, dice: [2, 8], weaponAbility: true, desc: 'Rain arrows on an area: 2d8 (DEX save for half).' },
  huntersMark: { name: 'Hunter\'s Mark', icon: 'targeted', kind: 'buff', target: 'enemy', range: 7, cd: 2, status: { type: 'marked', turns: 3 }, desc: 'Marked enemies take 25% more damage from everyone.' },

  // Loot skills
  meteor: { name: 'Meteor', icon: 'meteor-impact', kind: 'blast', target: 'hex', range: 7, radius: 2, cd: 4, dice: [4, 6], tags: ['fire'], status: { type: 'burn', turns: 2, chance: 0.6 }, desc: '4d6 fire in a big area (DEX save for half).', aura: '#ff6a20' },
  whirlwind: { name: 'Whirlwind', icon: 'spinning-sword', kind: 'strike', target: 'self', aoe: 'adjacent', cd: 3, extraDice: [1, 6], desc: 'Spin: weapon attack +1d6 against every adjacent enemy.' },
  execute: { name: 'Execute', icon: 'decapitation', kind: 'strike', target: 'enemy', cd: 3, execute: true, desc: 'Weapon attack. Double damage if the target is below half health.' },
  holyNova: { name: 'Holy Nova', icon: 'sun', kind: 'nova', target: 'self', radius: 2, cd: 3, dice: [2, 6], tags: ['holy'], healAllies: true, desc: 'Burst of light: 2d6 holy to enemies and heals allies within 2.', aura: '#fff0a0' },
  poisonCloud: { name: 'Poison Cloud', icon: 'poison-gas', kind: 'blast', target: 'hex', range: 5, radius: 1, cd: 3, dice: [1, 6], tags: ['poison'], status: { type: 'poison', turns: 3 }, desc: 'Toxic cloud: 1d6 and poisons everything in the area.', aura: '#80e040' },
  blink: { name: 'Blink', icon: 'teleport', kind: 'teleport', target: 'hex', range: 5, cd: 2, desc: 'Teleport up to 5 hexes.' },
  battleShout: { name: 'Battle Shout', icon: 'shouting', kind: 'buff', target: 'self', radius: 3, partyBuff: true, cd: 4, status: { type: 'bless', turns: 2 }, desc: 'All allies within 3 get +2 to hit and +2 damage.' },
  iceLance: { name: 'Ice Lance', icon: 'ice-spear', kind: 'bolt', target: 'enemy', range: 6, cd: 2, dice: [3, 6], tags: ['frost'], status: { type: 'slow', turns: 2 }, desc: '3d6 frost and slows. Shatters slowed targets for double damage.', shatter: true, aura: '#80e0ff' },
  rend: { name: 'Rend', icon: 'claw-slashes', kind: 'strike', target: 'enemy', cd: 2, status: { type: 'bleed', turns: 3 }, desc: 'Weapon attack that makes the target bleed for 3 turns.' },
  shadowBolt: { name: 'Shadow Bolt', icon: 'beam-wake', kind: 'bolt', target: 'enemy', range: 6, cd: 2, dice: [3, 8], tags: ['shadow'], desc: '3d8 shadow damage.', aura: '#a060ff' },
  rejuvenation: { name: 'Rejuvenation', icon: 'sprout', kind: 'buff', target: 'ally', range: 5, cd: 2, status: { type: 'regen', turns: 3 }, dice: [1, 6], ability: 'spell', desc: 'Heal 1d6 now and more at the start of each turn for 3 turns.', aura: '#7aff9a' },
  ironSkin: { name: 'Iron Skin', icon: 'armor-upgrade', kind: 'buff', target: 'self', cd: 4, status: { type: 'ward', turns: 2 }, shield: [3, 6], desc: '+4 AC for 2 turns and a 3d6 shield.' },
  thunderclap: { name: 'Thunderclap', icon: 'lightning-arc', kind: 'nova', target: 'self', radius: 1, cd: 3, dice: [2, 8], tags: ['lightning'], status: { type: 'stun', turns: 1, save: 'CON' }, desc: '2d8 lightning to adjacent enemies; may stun.', aura: '#80d0ff' },
  deadeye: { name: 'Deadeye', icon: 'bullseye', kind: 'strike', target: 'enemy', cd: 3, toHit: 5, autoCrit: true, desc: 'Weapon attack at +5 to hit. Always a critical hit.' },
  summonWolf: { name: 'Call the Pack', icon: 'wolf-howl', kind: 'summon', target: 'hex', range: 2, cd: 5, summon: 'wolfAlly', desc: 'Summon a dire wolf to fight beside you.' },
}

export const CLASS_SKILLS = {
  warrior: ['cleave', 'secondWind'],
  wizard: ['fireball', 'frostRay'],
  rogue: ['sneakAttack', 'shadowstep'],
  bard: ['mockery', 'inspire'],
  druid: ['thornWhip', 'healingWord'],
  cleric: ['sacredFlame', 'cureWounds'],
  paladin: ['smite', 'layOnHands'],
  shaman: ['chainLightning', 'spiritMend'],
  monk: ['flurry', 'stunningStrike'],
  'death-knight': ['deathGrip', 'frostStrike'],
  necromancer: ['lifeDrain', 'raiseDead'],
  sorcerer: ['chaosBolt', 'arcaneWard'],
  ranger: ['volley', 'huntersMark'],
}

export const STATUS_INFO = {
  burn: { name: 'Burning', color: '#ff7a2a', dot: [1, 6] },
  bleed: { name: 'Bleeding', color: '#d02a2a', dot: [1, 4], stack: true },
  poison: { name: 'Poisoned', color: '#80e040', dot: [1, 4] },
  slow: { name: 'Slowed', color: '#80d0ff' },
  stun: { name: 'Stunned', color: '#ffe060' },
  root: { name: 'Rooted', color: '#a0e080' },
  weaken: { name: 'Weakened', color: '#a080c0' },
  marked: { name: 'Marked', color: '#ff4060' },
  bless: { name: 'Blessed', color: '#ffe8a0' },
  ward: { name: 'Warded', color: '#a0c0ff' },
  hidden: { name: 'Hidden', color: '#8080a0' },
  regen: { name: 'Regenerating', color: '#7aff9a' },
}
