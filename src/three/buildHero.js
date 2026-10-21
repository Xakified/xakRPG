import * as THREE from 'three'
import { RACE_BY_ID } from '../game/data/races'
import { CLASS_BY_ID } from '../game/data/classes'
import { DEFAULT_LOOK } from '../game/data/looks'
import { buildBody } from './body'
import { buildBeard, buildHair } from './hair'
import { buildOutfit } from './outfit'
import { buildRelic, placeWeapon } from './gear'
import { buildCompanion } from './creatures'

const DEFAULT_WEAPONS = {
  sword: { type: 'sword' },
  staff: { type: 'staff', glow: '#80c0ff' },
  daggers: { type: 'daggers', metal: '#c0c6cc' },
  lute: { type: 'lute' },
  woodStaff: { type: 'woodStaff' },
  mace: { type: 'mace', metal: '#c8c8d0' },
  totem: { type: 'totem' },
  fists: { type: 'fists' },
  runeblade: { type: 'runeblade' },
  scythe: { type: 'scythe', glow: '#80ff9a' },
  orb: { type: 'orb', glow: '#ffb040' },
  bow: { type: 'bow' },
}

function resolveOutfit(cls, armor) {
  const o = { ...cls.outfit, extras: new Set(cls.outfit.extras) }
  if (armor) {
    if (armor.main) {
      o.main = armor.main
      if (armor.metal) {
        if (o.style === 'robe') o.metalChest = true
        else o.style = 'plate'
      } else if (o.style === 'plate') {
        o.style = 'leather'
        o.extras.delete('pauldrons')
      }
    }
    if (armor.accent) o.accent = armor.accent
    if (armor.cape) o.cape = armor.cape
    if (armor.glowTrim) o.glowTrim = true
    for (const e of armor.add || []) o.extras.add(e)
  }
  if (o.extras.has('jesterHat')) ['hood', 'wizardHat', 'featherHat', 'antlers'].forEach((e) => o.extras.delete(e))
  if (o.extras.has('hood')) ['wizardHat', 'featherHat'].forEach((e) => o.extras.delete(e))
  return o
}

// spec: { race | raceDef, cls, look, size, outfit, armor, weapon, relic, pet, aura }.
// armor/weapon/relic/pet are item model specs; outfit replaces the class
// outfit entirely (monsters). Returns the scene object, its height, and an
// update(time) function for idle animation.
export function buildHero(spec) {
  const race = spec.raceDef || RACE_BY_ID[spec.race] || RACE_BY_ID.human
  const cls = CLASS_BY_ID[spec.cls]
  const picks = { Weapon: spec.weapon, Armor: spec.armor, Relic: spec.relic, Companion: spec.pet }
  const f = race.f
  const look = { ...DEFAULT_LOOK, ...spec.look }
  const size = (race.size || 1) * (spec.size || 1)
  const outfit = spec.outfit
    ? { ...spec.outfit, extras: new Set(spec.outfit.extras) }
    : cls ? resolveOutfit(cls, picks.Armor) : { style: 'cloth', main: '#8a7a6a', accent: '#5a4a3a', extras: new Set() }

  const root = new THREE.Group()
  const hero = new THREE.Group()
  root.add(hero)
  const a = buildBody(hero, { look, f, outfit })
  const hairHidden = outfit.extras.has('hood') || outfit.extras.has('jesterHat')
  if (!f.noHair) buildHair(hero, look.hair, look.hairColor, a, { hidden: hairHidden })
  if (!f.noHair && !f.construct) buildBeard(hero, look.beard, look.hairColor, a)
  buildOutfit(hero, outfit, a, look)
  const weapon = picks.Weapon || (cls && DEFAULT_WEAPONS[cls.weapon])
  if (weapon) placeWeapon(hero, weapon, a)
  hero.scale.setScalar(size)

  const animated = []
  const height = a.top * size

  if (picks.Relic) {
    const relic = buildRelic(picks.Relic)
    root.add(relic)
    const r = 0.45 + a.w * 0.1
    animated.push((t) => {
      relic.position.set(Math.cos(t * 0.8) * r, height * 0.62 + Math.sin(t * 1.6) * 0.04, Math.sin(t * 0.8) * r)
      relic.rotation.y = t
    })
  }

  if (picks.Companion) {
    const pet = buildCompanion(picks.Companion)
    if (pet) {
      const g = pet.group
      if (pet.kind === 'ground') {
        g.position.set(0.32 * Math.max(1, a.w) + 0.12, 0, 0.45)
        g.rotation.y = -0.5
        root.add(g)
      } else if (pet.kind === 'perch') {
        g.position.set(-a.sW - 0.02, a.sY + 0.04, 0)
        g.scale.setScalar(1 / size ** 0.5)
        hero.add(g)
      } else {
        root.add(g)
        animated.push((t) => g.position.set(-0.5 - a.w * 0.05, height * 0.85 + Math.sin(t * 2) * 0.05, 0.2))
      }
      g.traverse((o) => o.name === 'wing' && animated.push((t) => (o.rotation.z = Math.sin(t * 8) * 0.4 * o.userData.flap)))
    }
  }

  hero.traverse((o) => {
    if (o.name === 'wing' && o.parent === hero) animated.push((t) => (o.rotation.y = o.userData.flap * (0.55 + Math.sin(t * 1.5) * 0.12)))
  })

  if (spec.aura) root.add(buildAura(spec.aura, height, animated))

  animated.push((t) => {
    hero.scale.y = size * (1 + Math.sin(t * 2) * 0.006)
  })

  return {
    root,
    height,
    update: (t) => animated.forEach((fn) => fn(t)),
  }
}

function buildAura(color, height, animated) {
  const g = new THREE.Group()
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.62, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }),
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.01
  g.add(ring)

  const count = 70
  const pos = new Float32Array(count * 3)
  const seeds = Array.from({ length: count }, (_, i) => ({ a: (i * 2.39996) % (Math.PI * 2), r: 0.35 + ((i * 37) % 23) / 60, s: 0.15 + ((i * 13) % 10) / 40, o: (i * 0.618) % 1 }))
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.035, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }))
  g.add(pts)
  animated.push((t) => {
    seeds.forEach((s, i) => {
      const y = ((s.o + t * s.s * 0.4) % 1) * height * 1.1
      pos[i * 3] = Math.cos(s.a + t * 0.3) * s.r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(s.a + t * 0.3) * s.r
    })
    geo.attributes.position.needsUpdate = true
    ring.material.opacity = 0.35 + Math.sin(t * 2) * 0.1
  })
  return g
}

