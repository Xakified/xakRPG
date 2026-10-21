// Appearance options for the character creator.

export const SKIN_TONES = [
  '#fbe3cf', '#f1d0b0', '#e8c09a', '#e0b48c', '#d0a078', '#c58c62', '#b07850', '#9a6440', '#7e5034', '#6e452b', '#55341f', '#3e2616',
  '#d8d8dc', '#9a9aa4', '#5a5a64', '#2e2a3e',
  '#b83a3a', '#c86a5a', '#8a2a4a', '#6a3a7a', '#7a3ab8', '#3a6ab8', '#5a9ab8', '#a8c8e8',
  '#3a8a4a', '#6a8a4a', '#8aa070', '#4aa0a0', '#c8a030', '#d8a050', '#e8e0d0', '#2a2a32',
]

export const HAIR_COLORS = [
  '#1a1410', '#2a1d14', '#3e2a1a', '#5a3a1e', '#7a4e2a', '#a0662a', '#c8843a', '#d8b060', '#e8d090', '#f0e6c8',
  '#e8e0d0', '#b8b8b8', '#7a7a7a', '#8a2a1e', '#c03a1e', '#e05a2a', '#e86aa0', '#a040c0', '#4a3a9a', '#3a6ae0',
  '#40b0d0', '#3aa060', '#7ad05a', '#e8d040',
]

export const EYE_COLORS = ['#3a2a1a', '#6a4a2a', '#3a6a9a', '#5a9ad8', '#4a8a4a', '#8ab04a', '#8a8a90', '#c8a030', '#a03030', '#8a40c0']

// Hairstyles the 3D model knows how to build (see src/three/hair.js).
export const HAIR_STYLES = [
  ['bald', 'Bald'], ['buzz', 'Buzz cut'], ['short', 'Short'], ['sidepart', 'Side part'], ['spiky', 'Spiky'],
  ['mohawk', 'Mohawk'], ['pompadour', 'Pompadour'], ['curly', 'Curly crop'], ['afro', 'Afro'], ['bob', 'Bob'],
  ['long', 'Long & straight'], ['wavy', 'Long & wavy'], ['ponytail', 'Ponytail'], ['highpony', 'High ponytail'], ['twintails', 'Twin tails'],
  ['bun', 'Bun'], ['topknot', 'Top knot'], ['braids', 'Twin braids'], ['braid', 'Single braid'], ['dreads', 'Dreadlocks'],
  ['mullet', 'Mullet'], ['undercut', 'Half-shaved'], ['wild', 'Wild mane'], ['pigtails', 'Pigtail buns'],
]

export const FACIAL_HAIR = [
  ['none', 'None'], ['stubble', 'Stubble'], ['mustache', 'Mustache'], ['goatee', 'Goatee'],
  ['short', 'Short beard'], ['long', 'Long beard'], ['braided', 'Braided beard'], ['chops', 'Mutton chops'],
]

export const DEFAULT_LOOK = {
  fat: 0.3,
  muscle: 0.4,
  breasts: false,
  skin: '#e0b48c',
  hair: 'short',
  hairColor: '#5a3a1e',
  beard: 'none',
  eyes: '#3a6a9a',
}

const HEX = /^#[0-9a-f]{6}$/i
const ids = (list) => list.map(([id]) => id)

// Keeps whatever a client sends inside the allowed options.
export function cleanLook(look = {}) {
  const num = (v, d) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : d)
  const pick = (v, allowed, d) => (allowed.includes(v) ? v : d)
  return {
    fat: num(look.fat, DEFAULT_LOOK.fat),
    muscle: num(look.muscle, DEFAULT_LOOK.muscle),
    breasts: Boolean(look.breasts),
    skin: HEX.test(look.skin) ? look.skin : DEFAULT_LOOK.skin,
    hair: pick(look.hair, ids(HAIR_STYLES), DEFAULT_LOOK.hair),
    hairColor: HEX.test(look.hairColor) ? look.hairColor : DEFAULT_LOOK.hairColor,
    beard: pick(look.beard, ids(FACIAL_HAIR), DEFAULT_LOOK.beard),
    eyes: HEX.test(look.eyes) ? look.eyes : DEFAULT_LOOK.eyes,
  }
}
