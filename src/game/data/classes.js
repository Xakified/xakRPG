// Base classes. `priority` assigns the standard array (15, 14, 13, 12, 10, 8)
// in that order. `outfit` drives what the 3D model wears, `weapon` is held
// until a weapon is drafted.

export const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
export const ABILITY_NAMES = { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' }
const ARRAY = [15, 14, 13, 12, 10, 8]

export const CLASSES = [
  { id: 'warrior', name: 'Warrior', icon: 'crossed-swords', priority: ['STR', 'CON', 'DEX', 'WIS', 'CHA', 'INT'], blurb: 'A master of arms who wins by steel and grit.',
    outfit: { style: 'plate', main: '#8a9098', accent: '#a8282a', extras: ['pauldrons', 'tabard'] }, weapon: 'sword' },
  { id: 'wizard', name: 'Wizard', icon: 'wizard-staff', priority: ['INT', 'CON', 'DEX', 'WIS', 'CHA', 'STR'], blurb: 'A scholar who bends reality with study and spellbooks.',
    outfit: { style: 'robe', main: '#2f4f9a', accent: '#e2c25a', extras: ['wizardHat'] }, weapon: 'staff' },
  { id: 'rogue', name: 'Rogue', icon: 'cloak-dagger', priority: ['DEX', 'CON', 'INT', 'CHA', 'WIS', 'STR'], blurb: 'A shadow with a knife and a plan.',
    outfit: { style: 'leather', main: '#2e2a30', accent: '#6a2a3a', extras: ['hood', 'cloak', 'mask'] }, weapon: 'daggers' },
  { id: 'bard', name: 'Bard', icon: 'guitar', priority: ['CHA', 'DEX', 'CON', 'WIS', 'INT', 'STR'], blurb: 'A performer whose songs are literal magic.',
    outfit: { style: 'cloth', main: '#8a2a6a', accent: '#e8c040', extras: ['featherHat', 'shortCape'] }, weapon: 'lute' },
  { id: 'druid', name: 'Druid', icon: 'oak-leaf', priority: ['WIS', 'CON', 'DEX', 'INT', 'CHA', 'STR'], blurb: 'A keeper of the wild who can become a bear.',
    outfit: { style: 'robe', main: '#4a6a32', accent: '#8a6a3a', extras: ['antlers', 'leafMantle'] }, weapon: 'woodStaff' },
  { id: 'cleric', name: 'Cleric', icon: 'holy-symbol', priority: ['WIS', 'CON', 'STR', 'CHA', 'DEX', 'INT'], blurb: 'A holy champion who heals friends and smites foes.',
    outfit: { style: 'robe', main: '#e8e2d0', accent: '#c8a030', extras: ['tabard', 'halo'] }, weapon: 'mace' },
  { id: 'paladin', name: 'Paladin', icon: 'winged-sword', priority: ['STR', 'CHA', 'CON', 'WIS', 'DEX', 'INT'], blurb: 'A knight bound by a sacred oath.',
    outfit: { style: 'plate', main: '#d8d4c8', accent: '#d8a830', extras: ['pauldrons', 'tabard', 'cape', 'shield'] }, weapon: 'sword' },
  { id: 'shaman', name: 'Shaman', icon: 'totem-head', priority: ['WIS', 'CON', 'STR', 'CHA', 'DEX', 'INT'], blurb: 'A voice for the spirits of earth, storm and ancestors.',
    outfit: { style: 'leather', main: '#3a5a7a', accent: '#a07a4a', extras: ['furMantle', 'beads'] }, weapon: 'totem' },
  { id: 'monk', name: 'Monk', icon: 'meditation', priority: ['DEX', 'WIS', 'CON', 'STR', 'INT', 'CHA'], blurb: 'A martial artist whose fists are faster than swords.',
    outfit: { style: 'gi', main: '#d8782a', accent: '#5a2a1a', extras: ['sash', 'wraps'] }, weapon: 'fists' },
  { id: 'death-knight', name: 'Death Knight', icon: 'death-skull', priority: ['STR', 'CON', 'CHA', 'WIS', 'DEX', 'INT'], blurb: 'A fallen warrior raised with frost and runes.',
    outfit: { style: 'plate', main: '#2a2e38', accent: '#60c8ff', extras: ['spikedPauldrons', 'cape', 'runeGlow'], eyes: '#80e0ff' }, weapon: 'runeblade' },
  { id: 'necromancer', name: 'Necromancer', icon: 'raise-zombie', priority: ['INT', 'CON', 'CHA', 'DEX', 'WIS', 'STR'], blurb: 'A mage who commands the restless dead.',
    outfit: { style: 'robe', main: '#1e1a24', accent: '#7ad05a', extras: ['hood', 'skullPauldron'] }, weapon: 'scythe' },
  { id: 'sorcerer', name: 'Sorcerer', icon: 'fire-ray', priority: ['CHA', 'CON', 'DEX', 'WIS', 'INT', 'STR'], blurb: 'Born with wild magic burning in the blood.',
    outfit: { style: 'robe', main: '#7a1e2a', accent: '#ffb040', extras: ['highCollar', 'runeGlow'] }, weapon: 'orb' },
  { id: 'ranger', name: 'Ranger', icon: 'high-shot', priority: ['DEX', 'WIS', 'CON', 'STR', 'INT', 'CHA'], blurb: 'A tracker and archer at home in the wilds.',
    outfit: { style: 'leather', main: '#3a5a2a', accent: '#7a5a3a', extras: ['hood', 'cloak', 'quiver'] }, weapon: 'bow' },
]

export const CLASS_BY_ID = Object.fromEntries(CLASSES.map((c) => [c.id, c]))

export function baseScores(classId) {
  const scores = {}
  CLASS_BY_ID[classId].priority.forEach((ability, i) => (scores[ability] = ARRAY[i]))
  return scores
}
