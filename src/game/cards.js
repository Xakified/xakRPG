// Each card: [name, stats, backstory template, icon, color, look?]. Stats use
// M(ight) W(its) C(harm) L(uck). Template blanks are written {hint} and filled
// in by the player. Icons are game-icons.net names; origins also carry the
// outfit colors and headgear the hero model wears.

export const STATS = { M: 'Might', W: 'Wits', C: 'Charm', L: 'Luck' }

const RAW = {
  Origin: [
    ['Swamp-Born', 'W2 L1', 'I was raised in a swamp by {a creature}, who taught me how to {a skill}.', 'swamp', '#6f8f4a', { outfit: '#4f6b3a', trim: '#8a6f3e', headgear: 'hood' }],
    ['Disgraced Knight', 'M2 C1', 'I was thrown out of the knighthood for {a crime}, but honestly {an excuse}.', 'broken-shield', '#a8aeb8', { outfit: '#7d838c', trim: '#7a2a2a', headgear: 'helm' }],
    ['Lost Royal', 'C2 L1', 'I am secretly heir to {a kingdom}, which I only learned when {an event}.', 'crown', '#e2b448', { outfit: '#5b2a86', trim: '#e2b448', headgear: 'crown' }],
    ['Tavern Orphan', 'C1 L2', 'I grew up under the floorboards of {a tavern name}, living on {a food}.', 'tavern-sign', '#b08a5a', { outfit: '#7a5a3a', trim: '#b08a5a', headgear: 'cap' }],
    ["Fired Wizard's Apprentice", 'W3', 'I studied under {a wizard name} until I accidentally turned {a thing} into {another thing}.', 'wizard-face', '#7a9ae8', { outfit: '#2f4f9a', trim: '#d8c25a', headgear: 'wizardhat' }],
    ['Mountain Hermit', 'M1 W2', 'I spent {a number} years alone on a mountain, pondering {a deep question}.', 'mountain-cave', '#a59a82', { outfit: '#6e6658', trim: '#a59a82', headgear: 'hood' }],
    ['Retired Pirate', 'M1 L2', 'I sailed the {a sea} until {an event} made me swear off the sea forever.', 'pirate-hat', '#c94a4a', { outfit: '#2c3e57', trim: '#b33a3a', headgear: 'tricorn' }],
    ['Goblin Accountant', 'W2 C1', 'I kept the books for {a goblin warlord}, and I know where {something} is buried.', 'abacus', '#c9a54a', { outfit: '#4a5d2a', trim: '#c9a54a', headgear: 'cap' }],
    ['Cursed Farmer', 'M2 L1', 'My fields grew {an unusual thing} instead of wheat after I insulted {a god}.', 'wheat', '#d8b45a', { outfit: '#9b7a3c', trim: '#5b7a3a', headgear: 'strawhat' }],
    ['Circus Runaway', 'C2 L1', 'I fled the travelling circus after the {an animal} and I {did something}.', 'juggler', '#e05a5a', { outfit: '#b8323a', trim: '#f0c040', headgear: 'tophat' }],
    ['Monastery Brewer', 'W1 C2', 'Monks raised me to brew {a drink}, which makes anyone who drinks it {an effect}.', 'beer-stein', '#d9b77a', { outfit: '#7b4a2a', trim: '#d9b77a', headgear: 'hood' }],
    ['Dragon-Egg Hatchling', 'M2 W1', 'I hatched from an egg a dragon {did something to}, and I still {a weird habit}.', 'egg-clutch', '#e07a2c', { outfit: '#8a2c2c', trim: '#e07a2c', headgear: 'horns' }],
    ['Haunted Librarian', 'W2 L1', 'I worked nights at {a library}, where the ghost of {a person} still owes me {a thing}.', 'open-book', '#9a8fc4', { outfit: '#3b3355', trim: '#9a8fc4', headgear: 'none' }],
    ["Bard's Forgotten Child", 'C3', 'My father was a famous bard who wrote {a song title}, a ballad about {an embarrassing topic}.', 'harp', '#e6c35a', { outfit: '#2a6f6a', trim: '#e6c35a', headgear: 'feathercap' }],
    ['Village Fool (Allegedly)', 'L3', 'Everyone in {a village} calls me a fool, ever since {an incident}.', 'jester-hat', '#8ab04a', { outfit: '#a07a3a', trim: '#6a8a3a', headgear: 'jester' }],
  ],
  Weapon: [
    ['Rusty Longsword', 'M2 L1', 'My blade is named {a name}, and it was forged by {a person} in {a place}.', 'broadsword', '#c9ced6'],
    ['Sentient Spoon', 'W1 L2', 'My spoon whispers "{a phrase}" every time I {an action}.', 'spoon', '#d8d0b0'],
    ["Grandmother's Crossbow", 'M1 W2', 'Grandma used this crossbow to slay {a monster}, using {an item} as bolts.', 'crossbow', '#b07a3a'],
    ['Staff of Mild Inconvenience', 'W2 C1', 'My staff can make anyone {a minor misfortune}, but only on {a day}.', 'crescent-staff', '#a07ad8'],
    ['Twin Daggers', 'M1 L2', 'I stole these daggers from {a villain}, who still hunts me because {a reason}.', 'daggers', '#c0c6cc'],
    ['Lute of Battle', 'C3', 'My lute only plays one song, "{a song title}", which makes enemies {a reaction}.', 'guitar', '#c08a4a'],
    ['Enchanted Frying Pan', 'M2 C1', 'This pan once cooked {a dish} for {a famous person}, and it remembers.', 'saucepan', '#8a8a8a'],
    ['Bone Wand', 'W3', 'This wand is carved from the bone of {a creature}, who died {how it died}.', 'skull-staff', '#e8e0c8'],
    ['Warhammer Too Big to Lift', 'M3', 'I drag my hammer everywhere, and it has carved a trench through {a place}.', 'warhammer', '#9aa0a8'],
    ['Whip of Stern Words', 'C2 L1', 'Each crack of my whip shouts "{an insult}" in the voice of {a person}.', 'whip', '#a0683a'],
    ['Boomerang Bow', 'M1 W1 L1', 'Every arrow I fire comes back {a strange way}, because I once {a mistake}.', 'bow-arrow', '#b08a4a'],
    ['Pointy Stick', 'L3', 'This is just a stick, but I tell everyone it is {a grand title}.', 'wood-stick', '#9a7a4a'],
    ['Ancestral Axe', 'M2 W1', 'The axe has passed through {a number} generations, and each owner must {a tradition}.', 'battle-axe', '#b0b6be'],
    ['Glove of Slapping', 'M1 C2', 'I once slapped {a powerful figure} with this glove, and now {a consequence}.', 'gloves', '#c88a5a'],
    ['Half-Eaten Spellbook', 'W2 L1', 'A {an animal} ate half my spellbook, so I can only cast spells about {a topic}.', 'spell-book', '#9a5ac8'],
  ],
  Trinket: [
    ['Mysterious Locket', 'C1 L2', 'Inside the locket is a portrait of {a person}, whom I {a relationship verb}.', 'heart-necklace', '#e0b050'],
    ['Bag of Holding (Small)', 'W1 L2', 'My bag holds exactly {a number} {a thing, plural}, and nothing else, ever.', 'swap-bag', '#b08a5a'],
    ['Map to Nowhere', 'W2 L1', 'This map leads to {a place}, but only when you {an action}.', 'treasure-map', '#d8c08a'],
    ['Lucky Coin', 'L3', 'I flip this coin before every decision, ever since it saved me from {a danger}.', 'two-coins', '#e8c040'],
    ['Cracked Crystal Ball', 'W3', 'My crystal ball only shows visions of {a boring thing}.', 'crystal-ball', '#8ac8e8'],
    ["Noble's Signet Ring", 'C2 L1', 'I won this ring from {a noble name} in a game of {a game}.', 'diamond-ring', '#e0b040'],
    ['Jar of Fireflies', 'W1 C2', 'The fireflies spell out "{a word}" whenever danger is near.', 'mason-jar', '#d8e86a'],
    ['Severed Troll Finger', 'M2 L1', 'The troll wants this finger back and has sent me {a number} angry letters.', 'severed-hand', '#7aa05a'],
    ["A Villain's Diary", 'W2 C1', "The diary's most embarrassing entry is about {an embarrassing thing}.", 'evil-book', '#a04a5a'],
    ['Horn of Summoning', 'M1 C1 L1', 'When I blow this horn, {a creature} arrives, feeling {an emotion} about it.', 'hunting-horn', '#d8b080'],
    ['Potion of Unknown Effect', 'L3', "I'm saving this potion for when {a situation}.", 'magic-potion', '#d060e0'],
    ['Wanted Poster (of Me)', 'C1 L2', "I'm wanted for {a crime}, with a reward of {a reward}.", 'wanted-reward', '#d8c08a'],
    ['Talking Skull', 'W2 C1', 'The skull, named {a name}, will not stop talking about {a topic}.', 'death-skull', '#e8e0c8'],
    ['Iron Boots', 'M3', 'These boots are so heavy I once sank straight through {a place}.', 'metal-boot', '#9aa0a8'],
    ['Phoenix Feather', 'M1 W1 C1', 'The feather bursts into flame whenever someone says "{a word}".', 'feather', '#f07a2a'],
  ],
  Companion: [
    ['Grumpy Mule', 'M2 L1', 'My mule, {a name}, refuses to move unless I {an action}.', 'donkey', '#a08a7a'],
    ['Pet Rock', 'L3', 'My rock is named {a name}, and it is my best friend because {a reason}.', 'stone-pile', '#a8a8a8'],
    ['Tiny Dragon', 'M1 W1 C1', 'My dragon is the size of {an object} and breathes {a substance}.', 'wyvern', '#d04a4a'],
    ['Disgraced Squire', 'M1 C2', 'My squire, {a name}, follows me because I owe them {a thing}.', 'hooded-figure', '#8a9a6a'],
    ['Ghost Cat', 'W1 L2', 'My cat has died {a number} times and now haunts {an object}.', 'cat', '#b8c8f0'],
    ['Opinionated Crow', 'W2 C1', 'My crow gossips about {a topic} and steals {an item}.', 'crow-dive', '#5a5a6a'],
    ['Loyal Mimic', 'M2 W1', 'My mimic eats {a thing} and loves being {an action}.', 'mimic-chest', '#a8703a'],
    ['Retired Hero', 'W2 C1', 'Old {a hero name} tags along to relive the time they {a heroic deed}.', 'mounted-knight', '#c0c6d0'],
    ['Swarm of Bees', 'M1 L2', 'My bees only obey me after I {a ritual}.', 'bee', '#e8b830'],
    ['Empty Suit of Armor', 'M3', 'The empty armor has followed me ever since I {an action} at {a place}.', 'black-knight-helm', '#8a9098'],
    ['Fairy Lawyer', 'W1 C2', 'My fairy lawyer once got me out of {a charge} by arguing {an argument}.', 'fairy', '#e0a0f0'],
    ['Very Large Frog', 'M1 C1 L1', 'My frog, {a name}, can swallow {an object} whole.', 'frog', '#6ab04a'],
    ['Imaginary Friend', 'C1 L2', "Nobody else can see {a name}, but they're amazing at {a skill}.", 'shadow-follower', '#8a7ac8'],
    ['Owlbear Cub', 'M2 C1', 'I found my owlbear cub in {a place}, eating {a food}.', 'bear-face', '#a07a5a'],
    ['Haunted Puppet', 'W3', 'My puppet speaks only in {a style of speech}, and it is usually right.', 'puppet', '#d09a7a'],
  ],
  Secret: [
    ['Afraid of Ducks', 'C1 L2', "I'm terrified of ducks because of {an incident} at {a place}.", 'duck', '#e8c040'],
    ['Secretly a Vampire', 'M2 W1', "I'm secretly a vampire, but I only drink {a beverage}.", 'vampire-dracula', '#c03040'],
    ["Thieves' Guild Debt", 'C1 L2', "I owe the Thieves' Guild {an amount} for {a purchase}.", 'robber', '#8a8a9a'],
    ['Prophesied Doom', 'W2 L1', 'A prophecy says I will {a fate} on the day of {an event}.', 'scroll-unfurled', '#d8c08a'],
    ["Can't Swim", 'M1 L2', "I can't swim, which is awkward because I'm {a profession}.", 'drowning', '#5a8ae0'],
    ['Compulsive Liar', 'C3', 'My biggest lie is that I {a lie}.', 'lips', '#e05070'],
    ["The Dark Lord's Ex", 'W1 C2', 'I once dated the Dark Lord, who dumped me because {a reason}.', 'broken-heart', '#e04050'],
    ['Allergic to Magic', 'M3', 'Magic makes me {a reaction}, so I always {a coping strategy}.', 'magic-swirl', '#7ae0c0'],
    ['Shapeshifter (Bread Only)', 'W1 L2', 'I can turn into {a type of bread}, which has saved my life {a number} times.', 'bread', '#d8a060'],
    ['The Twin Swap', 'W2 C1', "I'm actually my twin, {a name}. The real me {what happened}.", 'double-face-mask', '#d0c0b0'],
    ['Cowardly Heart', 'W2 L1', 'I once fled from {a monster} and blamed it on {a person}.', 'run', '#b0b0b0'],
    ['Cursed Sneeze', 'L3', 'Every time I sneeze, {a thing} appears.', 'nose-front', '#e8a080'],
    ['Royal Spy', 'W2 C1', 'I report every secret to {a monarch}, using {a method}.', 'cloak-dagger', '#7a7aa0'],
    ['Bad With Names', 'C1 L2', 'I call everyone "{a name}", ever since {an incident}.', 'price-tag', '#d8c08a'],
    ['Berserker Rage', 'M2 L1', 'I fly into a rage whenever someone mentions {a topic}.', 'enrage', '#f04020'],
  ],
}

export const ROUNDS = Object.keys(RAW)

export const ROUND_INTROS = {
  Origin: 'Where does your story begin?',
  Weapon: 'What do you carry into battle?',
  Trinket: 'What strange thing hangs from your belt?',
  Companion: 'Who (or what) travels at your side?',
  Secret: 'What do you hide from the party?',
}

function parseStats(s) {
  const out = {}
  for (const part of s.split(' ')) out[part[0]] = Number(part.slice(1))
  return out
}

export const CARDS = {}
for (const [category, list] of Object.entries(RAW)) {
  list.forEach(([name, stats, template, icon, color, look], i) => {
    const id = `${category}-${i}`
    CARDS[id] = { id, category, name, stats: parseStats(stats), template, icon, color, look }
  })
}

export function cardsIn(category) {
  return Object.values(CARDS).filter((c) => c.category === category)
}

// Splits a template into text and blank parts: [{text}, {blank, index}, ...]
export function parseTemplate(template) {
  const parts = []
  let blank = 0
  for (const piece of template.split(/(\{[^}]+\})/)) {
    if (!piece) continue
    if (piece.startsWith('{')) parts.push({ hint: piece.slice(1, -1), index: blank++ })
    else parts.push({ text: piece })
  }
  return parts
}

