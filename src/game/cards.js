// Draft cards for the rounds after the character creator. Each card:
// [name, ability bonuses, legend line, 3D model spec, icon, icon color].
// The legend line follows the hero's name, e.g. "Brakka wields ...".

const RAW = {
  Weapon: [
    ['Rusty Longsword', 'STR1 CON1', 'wields a notched longsword named Grudge.', { type: 'sword', metal: '#b0a090' }, 'broadsword', '#c9ced6'],
    ['Moonsteel Greatsword', 'STR2', 'swings a greatsword forged under a blue moon.', { type: 'greatsword', metal: '#c8d8f0', glow: '#80c0ff' }, 'broadsword', '#a8c8f0'],
    ['Dwarven Waraxe', 'STR1 CON1', 'carries a waraxe that has never lost an argument.', { type: 'axe', metal: '#a8a8b0' }, 'battle-axe', '#b0b6be'],
    ['Executioner\'s Greataxe', 'STR2', 'hefts a greataxe nobody likes to ask about.', { type: 'greataxe', metal: '#7a7a82' }, 'sharp-axe', '#9a9aa2'],
    ['Thunder Hammer', 'STR1 CON1', 'bears a hammer that rumbles before every swing.', { type: 'warhammer', metal: '#8a8a92', glow: '#80d0ff' }, 'warhammer', '#9aa0a8'],
    ['Sunburst Mace', 'STR1 WIS1', 'smites with a mace that glows like dawn.', { type: 'mace', metal: '#e0c050', glow: '#fff0a0' }, 'flanged-mace', '#e8c050'],
    ['Wavebreaker Spear', 'DEX1 STR1', 'fights with a coral spear taken from a sea serpent.', { type: 'spear', metal: '#e08a7a' }, 'spear-hook', '#e08a7a'],
    ['Staff of Stars', 'INT2', 'leans on a staff with a captured star at its tip.', { type: 'staff', wood: '#4a3a5a', glow: '#c0a0ff' }, 'crystal-wand', '#c0a0ff'],
    ['Wand of Sparks', 'CHA1 INT1', 'twirls a wand that sneezes sparks.', { type: 'wand', wood: '#6a3a2a', glow: '#ffb040' }, 'fairy-wand', '#ffb040'],
    ['Elven Longbow', 'DEX2', 'draws an elven bow that whispers before it fires.', { type: 'bow', wood: '#b08a4a' }, 'bow-arrow', '#b08a4a'],
    ['Gnomish Crossbow', 'DEX1 INT1', 'aims a gnomish crossbow with far too many dials.', { type: 'crossbow', wood: '#7a4a2a', metal: '#c8a040' }, 'crossbow', '#b07a3a'],
    ['Twin Shadow Daggers', 'DEX2', 'hides a pair of daggers that drink the light.', { type: 'daggers', metal: '#4a4a5a', glow: '#a060ff' }, 'daggers', '#8a7ab0'],
    ['Reaper\'s Scythe', 'STR1 INT1', 'carries a scythe that hums a funeral tune.', { type: 'scythe', metal: '#b8c0c8', glow: '#80ff9a' }, 'scythe', '#b8c0c8'],
    ['Morningstar Flail', 'STR1 DEX1', 'whirls a spiked flail with a mind of its own.', { type: 'flail', metal: '#8a8a92' }, 'flail', '#9a9aa2'],
    ['Lute of Thunder', 'CHA2', 'strums a lute whose chords crack like thunder.', { type: 'lute', wood: '#c08a4a' }, 'guitar', '#c08a4a'],
  ],
  Armor: [
    ['Studded Leather', 'DEX1 CON1', 'wears studded leather oiled with dragon fat.', { main: '#5a3a22', metal: false }, 'leather-vest', '#a0683a'],
    ['Chainmail Hauberk', 'CON2', 'clinks along in a chainmail coat three sizes too big.', { main: '#8a9098', metal: true, rough: true }, 'chain-mail', '#a8aeb8'],
    ['Gilded Full Plate', 'CON1 CHA1', 'shines in gilded plate that blinds lesser foes.', { main: '#d8b040', metal: true, add: ['pauldrons'] }, 'breastplate', '#e0b848'],
    ['Robes of the Archmage', 'INT2', 'wears robes stitched with moving constellations.', { main: '#1a2a5a', accent: '#c0a0ff', glowTrim: true }, 'robe', '#8a7ae0'],
    ['Wolf-Pelt Mantle', 'STR1 CON1', 'wears the pelt of the wolf that bit them first.', { add: ['furMantle'] }, 'wolf-head', '#a0a0a8'],
    ['Spiked Pauldrons', 'STR2', 'wears spiked pauldrons that ruin every hug.', { add: ['spikedPauldrons'] }, 'shoulder-armor', '#7a7a82'],
    ['Elven Mithral Shirt', 'DEX2', 'wears a mithral shirt light as a whisper.', { main: '#d8e0e8', metal: true }, 'chain-mail', '#e8f0f8'],
    ['Dragonscale Coat', 'CON1 CHA1', 'wears a coat of red dragon scales, still warm.', { main: '#a02a2a', metal: true, add: ['pauldrons'] }, 'dragon-shield', '#d04a4a'],
    ['Bone Armor', 'CON1 INT1', 'rattles in armor carved from giant bones.', { main: '#d8d0b8', add: ['skullPauldron'] }, 'ribcage', '#e8e0c8'],
    ['Crimson Cape', 'CHA2', 'sweeps a crimson cape at every possible moment.', { cape: '#a8202a' }, 'cape', '#d03a3a'],
    ['Royal Tabard', 'CHA1 WIS1', 'wears the tabard of a kingdom that no longer exists.', { accent: '#2a4aa0', add: ['tabard'] }, 'checked-shield', '#4a6ad0'],
    ['Shadowweave Cloak', 'DEX1 CHA1', 'wears a cloak woven from a moonless night.', { cape: '#14121c', add: ['hood'] }, 'hood', '#5a5a7a'],
    ['Druidic Leaf Mantle', 'WIS2', 'wears a mantle of leaves that never wilt.', { add: ['leafMantle'] }, 'oak-leaf', '#6ab04a'],
    ['Stormforged Plate', 'CON1 STR1', 'wears plate that crackles with captured lightning.', { main: '#4a5a7a', metal: true, accent: '#80d0ff', glowTrim: true, add: ['pauldrons'] }, 'lightning-helix', '#80d0ff'],
    ['Jester\'s Motley', 'CHA1 DEX1', 'wears jester\'s motley, bells and all.', { main: '#c03a3a', accent: '#e8c030', add: ['jesterHat'] }, 'jester-hat', '#e05a5a'],
  ],
  Companion: [
    ['Black Cat', 'DEX1 CHA1', 'is followed by a black cat that judges everyone.', { type: 'cat', color: '#1e1e24' }, 'cat', '#6a6a7a'],
    ['Dire Wolf Pup', 'STR1 WIS1', 'raised a dire wolf pup that is no longer a pup.', { type: 'wolf', color: '#7a7a82' }, 'wolf-head', '#a0a0a8'],
    ['Wise Owl', 'INT1 WIS1', 'travels with an owl who knows everything and says nothing.', { type: 'owl', color: '#8a6a4a' }, 'barn-owl', '#c8a070'],
    ['Raven Familiar', 'INT1 CHA1', 'keeps a raven that steals shiny secrets.', { type: 'raven', color: '#1a1a22' }, 'raven', '#5a5a6a'],
    ['Dragon Whelp', 'CHA1 CON1', 'hatched a dragon whelp that sets small things on fire.', { type: 'dragon', color: '#c03a2a' }, 'wyvern', '#d04a4a'],
    ['Enormous Toad', 'CON2', 'rides with an enormous toad named Sir Croaksworth.', { type: 'toad', color: '#6a8a3a' }, 'frog', '#6ab04a'],
    ['Stubborn Mule', 'STR1 CON1', 'leads a stubborn mule that only moves for apples.', { type: 'mule', color: '#8a7060' }, 'donkey', '#a08a7a'],
    ['War Boar', 'STR2', 'charges into battle beside a war boar.', { type: 'boar', color: '#5a4030' }, 'boar', '#8a6a5a'],
    ['Clever Fox', 'DEX1 INT1', 'shares every scheme with a clever red fox.', { type: 'fox', color: '#d0682a' }, 'fox-head', '#e07a3a'],
    ['Bear Cub', 'STR1 WIS1', 'adopted a bear cub who gives crushing hugs.', { type: 'bear', color: '#6a4a2a' }, 'bear-face', '#a07a5a'],
    ['Floating Skull', 'INT2', 'is haunted by a floating skull that loves to chat.', { type: 'skull', color: '#e8e0c8', glow: '#80ff9a' }, 'death-skull', '#e8e0c8'],
    ['Will-o\'-Wisp', 'WIS1 CHA1', 'is led astray by a friendly will-o\'-wisp.', { type: 'wisp', color: '#a0e0ff', glow: '#a0e0ff' }, 'sparkles', '#a0e0ff'],
    ['Pet Imp', 'CHA1 DEX1', 'bargained for a pet imp who reads the fine print.', { type: 'imp', color: '#b83a3a' }, 'imp', '#d04a4a'],
    ['Gelatinous Cube (Tiny)', 'CON1 INT1', 'keeps a tiny gelatinous cube as a lunchbox.', { type: 'slime', color: '#60d0a0' }, 'transparent-slime', '#60d0a0'],
    ['Hunting Hawk', 'DEX1 WIS1', 'hunts with a hawk that never misses.', { type: 'hawk', color: '#8a5a2a' }, 'eagle-head', '#c08a4a'],
  ],
  Relic: [
    ['Orb of Whispers', 'INT1 WIS1', 'carries an orb that whispers tomorrow\'s weather.', { type: 'orb', color: '#a070ff' }, 'crystal-ball', '#a070ff'],
    ['Amulet of the Fallen', 'CHA1 CON1', 'wears the amulet of a hero who fell too soon.', { type: 'amulet', color: '#e0b040' }, 'gem-pendant', '#e0b040'],
    ['Forbidden Tome', 'INT2', 'reads a forbidden tome that reads back.', { type: 'tome', color: '#6a1a2a' }, 'evil-book', '#a04a5a'],
    ['Everburning Lantern', 'WIS2', 'carries a lantern that has never gone out.', { type: 'lantern', color: '#ffc040' }, 'lantern-flame', '#ffc040'],
    ['Horn of Valhalla', 'STR1 CHA1', 'carries a horn that calls spirit warriors.', { type: 'horn', color: '#d8b080' }, 'hunting-horn', '#d8b080'],
    ['Ancestor\'s Skull', 'WIS1 INT1', 'consults an ancestor\'s skull in hard times.', { type: 'skull', color: '#e8e0c8' }, 'skull-crack', '#e8e0c8'],
    ['Potion of Giant Strength', 'STR2', 'is saving a potion of giant strength for the right moment.', { type: 'potion', color: '#e05a2a' }, 'magic-potion', '#e05a2a'],
    ['Heartstone Crystal', 'CON2', 'holds a crystal that beats like a heart.', { type: 'crystal', color: '#e04a7a' }, 'crystal-growth', '#e04a7a'],
    ['Sacred Holy Symbol', 'WIS1 CHA1', 'holds a holy symbol blessed by a forgotten god.', { type: 'holy', color: '#f0d060' }, 'ankh', '#f0d060'],
    ['Lucky Golden D20', 'DEX1 CHA1', 'rolls a golden d20 before every big decision.', { type: 'd20', color: '#e8c040' }, 'dice-twenty-faces-twenty', '#e8c040'],
    ['Runestone of the North', 'STR1 WIS1', 'carries a runestone carved by frost giants.', { type: 'rune', color: '#80d0ff' }, 'rune-stone', '#80d0ff'],
    ['Hourglass of Moments', 'INT1 DEX1', 'can turn back a single moment with a stolen hourglass.', { type: 'hourglass', color: '#d8c080' }, 'hourglass', '#d8c080'],
    ['Phoenix Feather', 'CON1 CHA1', 'keeps a phoenix feather that once brought them back.', { type: 'feather', color: '#ff7a2a' }, 'feather', '#ff7a2a'],
    ['Mirror of Truth', 'WIS1 INT1', 'owns a mirror that shows only the truth, rudely.', { type: 'mirror', color: '#c8d8e8' }, 'mirror-mirror', '#c8d8e8'],
    ['Skeleton Key', 'DEX2', 'has a skeleton key that opens any door, once.', { type: 'key', color: '#c8a040' }, 'key', '#c8a040'],
  ],
  Secret: [
    ['Cursed Bloodline', 'CHA1 CON1', 'secretly carries a family curse that wakes at midnight.', { aura: '#a040ff' }, 'cursed-star', '#a040ff'],
    ['Chosen by Prophecy', 'WIS1 CHA1', 'is secretly the chosen one, and hates it.', { aura: '#ffe080' }, 'scroll-unfurled', '#ffe080'],
    ['Pact with a Demon', 'CHA2', 'secretly owes their soul to a demon with a lawyer.', { aura: '#ff3a2a' }, 'devil-mask', '#ff5a3a'],
    ['Lost Royal Heir', 'CHA1 INT1', 'is secretly heir to a fallen throne.', { aura: '#e8c040' }, 'crown', '#e8c040'],
    ['Former Villain', 'STR1 INT1', 'was once a feared villain and hopes nobody remembers.', { aura: '#4a2a5a' }, 'evil-minion', '#8a5aa0'],
    ['Afraid of Ducks', 'DEX1 WIS1', 'is terrified of ducks for reasons they will not discuss.', { aura: '#e8d040' }, 'duck', '#e8c040'],
    ['Secret Twin', 'DEX1 CHA1', 'is actually their own twin, and the real one is missing.', { aura: '#a0a0b0' }, 'double-face-mask', '#d0c0b0'],
    ['Lycanthrope', 'STR1 CON1', 'secretly turns into a wolf when the moon is full.', { aura: '#c8d0ff' }, 'werewolf', '#a0a8d0'],
    ['Frozen Heart', 'CON2', 'had their heart frozen by a winter witch.', { aura: '#80e0ff' }, 'frozen-orb', '#80e0ff'],
    ['Living Flame', 'CON1 CHA1', 'has a fire elemental living in their chest.', { aura: '#ff8a20' }, 'fire', '#ff8a20'],
    ['Spy for the Crown', 'INT1 DEX1', 'secretly reports every move to the crown.', { aura: '#5a6a8a' }, 'cloak-dagger', '#7a7aa0'],
    ['Touched by the Fey', 'WIS1 CHA1', 'owes a fey queen a favor she will collect.', { aura: '#7aff9a' }, 'fairy', '#e0a0f0'],
    ['Already Dead', 'CON1 WIS1', 'died last year and simply didn\'t stop.', { aura: '#7ad05a' }, 'tombstone', '#9ab08a'],
    ['Dragon in Disguise', 'STR1 CHA1', 'is secretly a dragon in a borrowed body.', { aura: '#ff4a2a' }, 'dragon-head', '#d04a4a'],
    ['Berserker Rage', 'STR2', 'loses control whenever someone insults their hat.', { aura: '#ff2020' }, 'enrage', '#f04020'],
  ],
}

export const ROUNDS = Object.keys(RAW)

export const ROUND_INTROS = {
  Weapon: 'What do you carry into battle?',
  Armor: 'What protects you from the blades of your enemies?',
  Companion: 'Who (or what) travels at your side?',
  Relic: 'What strange treasure do you carry?',
  Secret: 'What do you hide from the party?',
}

function parseStats(s) {
  const out = {}
  for (const part of s.split(' ')) out[part.slice(0, 3)] = Number(part.slice(3))
  return out
}

export const CARDS = {}
for (const [category, list] of Object.entries(RAW)) {
  list.forEach(([name, stats, line, model, icon, color], i) => {
    const id = `${category}-${i}`
    CARDS[id] = { id, category, name, stats: parseStats(stats), line, model, icon, color }
  })
}

export function cardsIn(category) {
  return Object.values(CARDS).filter((c) => c.category === category)
}
