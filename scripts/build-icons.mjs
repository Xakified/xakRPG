// Copies just the game-icons.net icons the cards use into src/game/icons.json,
// so the bundle doesn't carry all 4000+. Run after changing icons in cards.js:
//   node scripts/build-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const all = JSON.parse(readFileSync(new URL('../node_modules/@iconify-json/game-icons/icons.json', import.meta.url)))
const cards = readFileSync(new URL('../src/game/cards.js', import.meta.url), 'utf8')
const extra = ['castle', 'elven-castle', 'scroll-quill', 'tavern-sign', 'laurel-crown', 'crossed-swords', 'dice-twenty-faces-twenty', 'speaker', 'speaker-off']
const names = new Set([...[...cards.matchAll(/, '([a-z0-9-]+)', '#[0-9a-f]{6}'/g)].map((m) => m[1]), ...extra])

const icons = {}
for (const name of names) {
  const icon = all.icons[name]
  if (!icon) throw new Error(`Unknown icon: ${name}`)
  icons[name] = icon.body.replace(/fill="#000"/g, 'fill="currentColor"')
}
writeFileSync(new URL('../src/game/icons.json', import.meta.url), JSON.stringify(icons))
console.log(`Wrote ${names.size} icons`)
