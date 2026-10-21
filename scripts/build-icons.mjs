// Copies just the game-icons.net icons the game uses into src/game/icons.json,
// so the bundle doesn't carry all 4000+. Any quoted string in src/game that
// names an icon counts. Run after adding icons:
//   node scripts/build-icons.mjs
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const all = JSON.parse(readFileSync(new URL('../node_modules/@iconify-json/game-icons/icons.json', import.meta.url)))
const root = new URL('../src/game/', import.meta.url).pathname
const extra = ['speaker', 'speaker-off']

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? files(p) : /\.(js|jsx)$/.test(f) && !f.endsWith('icons.json') ? [p] : []
  })
}

const names = new Set(extra)
for (const file of files(root)) {
  for (const m of readFileSync(file, 'utf8').matchAll(/['"]([a-z0-9]+(?:-[a-z0-9]+)*)['"]/g)) if (all.icons[m[1]]) names.add(m[1])
}

const icons = {}
for (const name of names) icons[name] = all.icons[name].body.replace(/fill="#000"/g, 'fill="currentColor"')
writeFileSync(new URL('../src/game/icons.json', import.meta.url), JSON.stringify(icons))
console.log(`Wrote ${names.size} icons`)
