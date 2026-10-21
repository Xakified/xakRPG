// Each card: [name, stats, backstory template]. Stats use M(ight) W(its)
// C(harm) L(uck). Template blanks are written {hint} and filled in by the player.

export const STATS = { M: 'Might', W: 'Wits', C: 'Charm', L: 'Luck' }

const RAW = {
  Origin: [
    ['Swamp-Born', 'W2 L1', 'I was raised in a swamp by {a creature}, who taught me how to {a skill}.'],
    ['Disgraced Knight', 'M2 C1', 'I was thrown out of the knighthood for {a crime}, but honestly {an excuse}.'],
    ['Lost Royal', 'C2 L1', 'I am secretly heir to {a kingdom}, which I only learned when {an event}.'],
    ['Tavern Orphan', 'C1 L2', 'I grew up under the floorboards of {a tavern name}, living on {a food}.'],
    ["Fired Wizard's Apprentice", 'W3', 'I studied under {a wizard name} until I accidentally turned {a thing} into {another thing}.'],
    ['Mountain Hermit', 'M1 W2', 'I spent {a number} years alone on a mountain, pondering {a deep question}.'],
    ['Retired Pirate', 'M1 L2', 'I sailed the {a sea} until {an event} made me swear off the sea forever.'],
    ['Goblin Accountant', 'W2 C1', 'I kept the books for {a goblin warlord}, and I know where {something} is buried.'],
    ['Cursed Farmer', 'M2 L1', 'My fields grew {an unusual thing} instead of wheat after I insulted {a god}.'],
    ['Circus Runaway', 'C2 L1', 'I fled the travelling circus after the {an animal} and I {did something}.'],
    ['Monastery Brewer', 'W1 C2', 'Monks raised me to brew {a drink}, which makes anyone who drinks it {an effect}.'],
    ['Dragon-Egg Hatchling', 'M2 W1', 'I hatched from an egg a dragon {did something to}, and I still {a weird habit}.'],
    ['Haunted Librarian', 'W2 L1', 'I worked nights at {a library}, where the ghost of {a person} still owes me {a thing}.'],
    ["Bard's Forgotten Child", 'C3', 'My father was a famous bard who wrote {a song title}, a ballad about {an embarrassing topic}.'],
    ['Village Fool (Allegedly)', 'L3', 'Everyone in {a village} calls me a fool, ever since {an incident}.'],
  ],
  Weapon: [
    ['Rusty Longsword', 'M2 L1', 'My blade is named {a name}, and it was forged by {a person} in {a place}.'],
    ['Sentient Spoon', 'W1 L2', 'My spoon whispers "{a phrase}" every time I {an action}.'],
    ["Grandmother's Crossbow", 'M1 W2', 'Grandma used this crossbow to slay {a monster}, using {an item} as bolts.'],
    ['Staff of Mild Inconvenience', 'W2 C1', 'My staff can make anyone {a minor misfortune}, but only on {a day}.'],
    ['Twin Daggers', 'M1 L2', 'I stole these daggers from {a villain}, who still hunts me because {a reason}.'],
    ['Lute of Battle', 'C3', 'My lute only plays one song, "{a song title}", which makes enemies {a reaction}.'],
    ['Enchanted Frying Pan', 'M2 C1', 'This pan once cooked {a dish} for {a famous person}, and it remembers.'],
    ['Bone Wand', 'W3', 'This wand is carved from the bone of {a creature}, who died {how it died}.'],
    ['Warhammer Too Big to Lift', 'M3', 'I drag my hammer everywhere, and it has carved a trench through {a place}.'],
    ['Whip of Stern Words', 'C2 L1', 'Each crack of my whip shouts "{an insult}" in the voice of {a person}.'],
    ['Boomerang Bow', 'M1 W1 L1', 'Every arrow I fire comes back {a strange way}, because I once {a mistake}.'],
    ['Pointy Stick', 'L3', 'This is just a stick, but I tell everyone it is {a grand title}.'],
    ['Ancestral Axe', 'M2 W1', 'The axe has passed through {a number} generations, and each owner must {a tradition}.'],
    ['Glove of Slapping', 'M1 C2', 'I once slapped {a powerful figure} with this glove, and now {a consequence}.'],
    ['Half-Eaten Spellbook', 'W2 L1', 'A {an animal} ate half my spellbook, so I can only cast spells about {a topic}.'],
  ],
  Trinket: [
    ['Mysterious Locket', 'C1 L2', 'Inside the locket is a portrait of {a person}, whom I {a relationship verb}.'],
    ['Bag of Holding (Small)', 'W1 L2', 'My bag holds exactly {a number} {a thing, plural}, and nothing else, ever.'],
    ['Map to Nowhere', 'W2 L1', 'This map leads to {a place}, but only when you {an action}.'],
    ['Lucky Coin', 'L3', 'I flip this coin before every decision, ever since it saved me from {a danger}.'],
    ['Cracked Crystal Ball', 'W3', 'My crystal ball only shows visions of {a boring thing}.'],
    ["Noble's Signet Ring", 'C2 L1', 'I won this ring from {a noble name} in a game of {a game}.'],
    ['Jar of Fireflies', 'W1 C2', 'The fireflies spell out "{a word}" whenever danger is near.'],
    ['Severed Troll Finger', 'M2 L1', 'The troll wants this finger back and has sent me {a number} angry letters.'],
    ["A Villain's Diary", 'W2 C1', "The diary's most embarrassing entry is about {an embarrassing thing}."],
    ['Horn of Summoning', 'M1 C1 L1', 'When I blow this horn, {a creature} arrives, feeling {an emotion} about it.'],
    ['Potion of Unknown Effect', 'L3', "I'm saving this potion for when {a situation}."],
    ['Wanted Poster (of Me)', 'C1 L2', "I'm wanted for {a crime}, with a reward of {a reward}."],
    ['Talking Skull', 'W2 C1', 'The skull, named {a name}, will not stop talking about {a topic}.'],
    ['Iron Boots', 'M3', 'These boots are so heavy I once sank straight through {a place}.'],
    ['Phoenix Feather', 'M1 W1 C1', 'The feather bursts into flame whenever someone says "{a word}".'],
  ],
  Companion: [
    ['Grumpy Mule', 'M2 L1', 'My mule, {a name}, refuses to move unless I {an action}.'],
    ['Pet Rock', 'L3', 'My rock is named {a name}, and it is my best friend because {a reason}.'],
    ['Tiny Dragon', 'M1 W1 C1', 'My dragon is the size of {an object} and breathes {a substance}.'],
    ['Disgraced Squire', 'M1 C2', 'My squire, {a name}, follows me because I owe them {a thing}.'],
    ['Ghost Cat', 'W1 L2', 'My cat has died {a number} times and now haunts {an object}.'],
    ['Opinionated Crow', 'W2 C1', 'My crow gossips about {a topic} and steals {an item}.'],
    ['Loyal Mimic', 'M2 W1', 'My mimic eats {a thing} and loves being {an action}.'],
    ['Retired Hero', 'W2 C1', 'Old {a hero name} tags along to relive the time they {a heroic deed}.'],
    ['Swarm of Bees', 'M1 L2', 'My bees only obey me after I {a ritual}.'],
    ['Empty Suit of Armor', 'M3', 'The empty armor has followed me ever since I {an action} at {a place}.'],
    ['Fairy Lawyer', 'W1 C2', 'My fairy lawyer once got me out of {a charge} by arguing {an argument}.'],
    ['Very Large Frog', 'M1 C1 L1', 'My frog, {a name}, can swallow {an object} whole.'],
    ['Imaginary Friend', 'C1 L2', "Nobody else can see {a name}, but they're amazing at {a skill}."],
    ['Owlbear Cub', 'M2 C1', 'I found my owlbear cub in {a place}, eating {a food}.'],
    ['Haunted Puppet', 'W3', 'My puppet speaks only in {a style of speech}, and it is usually right.'],
  ],
  Secret: [
    ['Afraid of Ducks', 'C1 L2', "I'm terrified of ducks because of {an incident} at {a place}."],
    ['Secretly a Vampire', 'M2 W1', "I'm secretly a vampire, but I only drink {a beverage}."],
    ["Thieves' Guild Debt", 'C1 L2', "I owe the Thieves' Guild {an amount} for {a purchase}."],
    ['Prophesied Doom', 'W2 L1', 'A prophecy says I will {a fate} on the day of {an event}.'],
    ["Can't Swim", 'M1 L2', "I can't swim, which is awkward because I'm {a profession}."],
    ['Compulsive Liar', 'C3', 'My biggest lie is that I {a lie}.'],
    ["The Dark Lord's Ex", 'W1 C2', 'I once dated the Dark Lord, who dumped me because {a reason}.'],
    ['Allergic to Magic', 'M3', 'Magic makes me {a reaction}, so I always {a coping strategy}.'],
    ['Shapeshifter (Bread Only)', 'W1 L2', 'I can turn into {a type of bread}, which has saved my life {a number} times.'],
    ['The Twin Swap', 'W2 C1', "I'm actually my twin, {a name}. The real me {what happened}."],
    ['Cowardly Heart', 'W2 L1', 'I once fled from {a monster} and blamed it on {a person}.'],
    ['Cursed Sneeze', 'L3', 'Every time I sneeze, {a thing} appears.'],
    ['Royal Spy', 'W2 C1', 'I report every secret to {a monarch}, using {a method}.'],
    ['Bad With Names', 'C1 L2', 'I call everyone "{a name}", ever since {an incident}.'],
    ['Berserker Rage', 'M2 L1', 'I fly into a rage whenever someone mentions {a topic}.'],
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
  list.forEach(([name, stats, template], i) => {
    const id = `${category}-${i}`
    CARDS[id] = { id, category, name, stats: parseStats(stats), template }
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

