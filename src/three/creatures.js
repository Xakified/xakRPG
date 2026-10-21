import * as THREE from 'three'
import { box, cone, glowMat, limb, mat, shade, sphere, taper, v, aim } from './kit'

// Companion creatures. Each builder returns { group, kind } where kind is
// 'ground' (stands beside the hero), 'perch' (sits on the shoulder) or
// 'float' (hovers and bobs).

function eyes(g, at, spread, r, color = '#101010', glow) {
  for (const s of [-1, 1]) sphere(r, glow ? glowMat(glow, 2) : mat(color, { roughness: 0.2 }), at.clone().add(v(s * spread, 0, 0)), g, null, 8)
}

function quadruped(o) {
  const g = new THREE.Group()
  const m = mat(o.color, { roughness: 0.95, flat: o.flat })
  const light = mat(shade(o.color, 0.18), { roughness: 0.95 })
  const L = o.len
  const y = o.leg + o.r * 0.8
  limb(v(0, y, L / 2), v(0, y, -L / 2), o.r, m, g)
  for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    limb(v(x * o.r * 0.55, y - o.r * 0.3, z * L * 0.42), v(x * o.r * 0.55, 0.02, z * L * 0.42), o.legR, m, g)
  }
  const head = v(0, y + o.r * 0.9, L / 2 + o.head * 0.8)
  sphere(o.head, m, head, g)
  if (o.snout) {
    const tip = head.clone().add(v(0, -o.head * 0.25, o.head * 0.6 + o.snout))
    limb(head.clone().add(v(0, -o.head * 0.2, o.head * 0.3)), tip, o.head * 0.45, o.muzzle ? light : m, g)
    sphere(o.head * 0.16, mat('#1a1010'), tip.clone().add(v(0, o.head * 0.1, o.head * 0.35)), g, null, 8)
  }
  eyes(g, head.clone().add(v(0, o.head * 0.25, o.head * 0.82)), o.head * 0.42, o.head * 0.14, '#101010', o.eyeGlow)
  for (const s of [-1, 1]) {
    if (o.ears === 'point') aim(cone(o.head * 0.35, o.head * 0.9, m, head.clone().add(v(s * o.head * 0.55, o.head * 0.8, -o.head * 0.1)), g, 6), v(s * 0.2, 1, 0))
    if (o.ears === 'round') sphere(o.head * 0.32, m, head.clone().add(v(s * o.head * 0.7, o.head * 0.7, -o.head * 0.1)), g, [1, 1, 0.5], 8)
    if (o.ears === 'long') aim(limb(head.clone().add(v(s * o.head * 0.4, o.head * 0.6, -o.head * 0.2)), head.clone().add(v(s * o.head * 0.9, o.head * 2.2, -o.head * 0.4)), o.head * 0.22, m, g), v(s * 0.3, 1, -0.2))
  }
  if (o.tusks) for (const s of [-1, 1]) aim(cone(o.head * 0.08, o.head * 0.4, mat('#f0e8d0'), head.clone().add(v(s * o.head * 0.3, -o.head * 0.25, o.head * 1.1)), g, 6), v(s * 0.2, 1, 0.3))
  if (o.tail) taper([v(0, y, -L / 2 - o.r * 0.6), ...o.tail.map((p) => v(p[0], y + p[1], -L / 2 + p[2]))], o.tailR, o.tailR * 0.6, o.tipColor ? light : m, g, 8)
  if (o.horns) for (const s of [-1, 1]) aim(cone(o.head * 0.15, o.head * 0.7, mat('#e8dcc0'), head.clone().add(v(s * o.head * 0.45, o.head * 0.8, -o.head * 0.3)), g, 6), v(s * 0.1, 1, -0.8))
  if (o.wings) {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.22, 0.12)
    shape.lineTo(0.18, 0.02)
    shape.lineTo(0.2, -0.04)
    shape.lineTo(0.08, -0.04)
    shape.lineTo(0, 0)
    const wm = mat(shade(o.color, -0.15), { side: THREE.DoubleSide })
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.ShapeGeometry(shape), wm)
      w.position.set(s * o.r * 0.5, y + o.r * 0.8, 0)
      w.scale.x = s
      w.rotation.y = s * 0.4
      w.name = 'wing'
      w.userData.flap = s
      g.add(w)
    }
  }
  return g
}

function bird(o) {
  const g = new THREE.Group()
  const m = mat(o.color, { roughness: 0.9 })
  const dark = mat(shade(o.color, -0.15), { roughness: 0.9 })
  sphere(0.07, m, v(0, 0.08, 0), g, [0.9, 1.15, 1])
  sphere(0.05, m, v(0, 0.17, 0.02), g, o.owl ? [1.2, 1, 1] : [1, 1, 1])
  aim(cone(0.014, 0.04, mat(o.beak, { roughness: 0.4 }), v(0, 0.16, 0.07), g, 6), v(0, -0.5, 1))
  eyes(g, v(0, 0.18, o.owl ? 0.045 : 0.04), o.owl ? 0.022 : 0.03, o.owl ? 0.014 : 0.008, o.owl ? '#e8b020' : '#101010')
  if (o.owl) for (const s of [-1, 1]) aim(cone(0.012, 0.035, dark, v(s * 0.035, 0.22, 0.01), g, 5), v(s * 0.3, 1, 0))
  for (const s of [-1, 1]) {
    const w = sphere(0.05, dark, v(s * 0.06, 0.09, -0.01), g, [0.3, 1, 1.2])
    w.name = 'wing'
    w.userData.flap = s
  }
  box(0.06, 0.012, 0.08, dark, v(0, 0.03, -0.08), g).rotation.x = -0.5
  for (const s of [-1, 1]) limb(v(s * 0.025, 0.02, 0), v(s * 0.025, -0.01, 0.01), 0.006, mat('#c8a040'), g, { capsule: false })
  return g
}

export function buildCompanion(spec) {
  const c = spec.color
  switch (spec.type) {
    case 'cat': return { kind: 'ground', group: quadruped({ color: c, len: 0.2, r: 0.065, leg: 0.1, legR: 0.018, head: 0.065, ears: 'point', tail: [[0.02, 0.1, -0.15], [0, 0.22, -0.12]], tailR: 0.014, eyeGlow: '#e8d040' }) }
    case 'wolf': return { kind: 'ground', group: quadruped({ color: c, len: 0.38, r: 0.11, leg: 0.22, legR: 0.03, head: 0.085, snout: 0.07, ears: 'point', tail: [[0, -0.05, -0.2], [0, 0.0, -0.32]], tailR: 0.04 }) }
    case 'fox': return { kind: 'ground', group: quadruped({ color: c, len: 0.26, r: 0.07, leg: 0.12, legR: 0.018, head: 0.065, snout: 0.06, muzzle: true, ears: 'point', tail: [[0, 0, -0.16], [0.02, 0.06, -0.28]], tailR: 0.04, tipColor: true }) }
    case 'bear': return { kind: 'ground', group: quadruped({ color: c, len: 0.26, r: 0.13, leg: 0.1, legR: 0.045, head: 0.1, snout: 0.04, muzzle: true, ears: 'round' }) }
    case 'boar': return { kind: 'ground', group: quadruped({ color: c, len: 0.34, r: 0.13, leg: 0.1, legR: 0.03, head: 0.09, snout: 0.07, ears: 'point', tusks: true, tail: [[0, 0.04, -0.06]], tailR: 0.01 }) }
    case 'mule': return { kind: 'ground', group: quadruped({ color: c, len: 0.5, r: 0.14, leg: 0.42, legR: 0.03, head: 0.09, snout: 0.12, muzzle: true, ears: 'long', tail: [[0, -0.1, -0.08], [0, -0.25, -0.1]], tailR: 0.015 }) }
    case 'dragon': return { kind: 'ground', group: quadruped({ color: c, flat: true, len: 0.26, r: 0.07, leg: 0.1, legR: 0.02, head: 0.07, snout: 0.07, horns: true, wings: true, tail: [[0, -0.02, -0.2], [0.08, 0.02, -0.34]], tailR: 0.03, eyeGlow: '#ffd040' }) }
    case 'toad': {
      const g = new THREE.Group()
      const m = mat(c, { roughness: 0.6 })
      sphere(0.16, m, v(0, 0.12, 0), g, [1.1, 0.75, 1])
      for (const s of [-1, 1]) {
        sphere(0.045, m, v(s * 0.08, 0.22, 0.08), g)
        sphere(0.03, mat('#e8c020', { roughness: 0.2 }), v(s * 0.08, 0.23, 0.115), g)
        sphere(0.05, m, v(s * 0.14, 0.04, 0.06), g, [1, 0.5, 1.4])
      }
      box(0.16, 0.01, 0.02, mat('#2a3a1a'), v(0, 0.12, 0.155), g)
      const crown = cone(0.04, 0.05, mat('#e8c040', { metalness: 0.8, roughness: 0.3 }), v(0, 0.24, 0), g, 5)
      crown.scale.y = 0.7
      return { kind: 'ground', group: g }
    }
    case 'owl': return { kind: 'perch', group: bird({ color: c, beak: '#3a3020', owl: true }) }
    case 'raven': return { kind: 'perch', group: bird({ color: c, beak: '#2a2a2e' }) }
    case 'hawk': return { kind: 'perch', group: bird({ color: c, beak: '#e8c040' }) }
    case 'skull': {
      const g = new THREE.Group()
      const m = mat(c, { roughness: 0.5 })
      sphere(0.1, m, v(0, 0, 0), g)
      box(0.09, 0.05, 0.07, m, v(0, -0.08, 0.035), g)
      eyes(g, v(0, 0.0, 0.085), 0.035, 0.022, '#000', spec.glow)
      return { kind: 'float', group: g }
    }
    case 'wisp': {
      const g = new THREE.Group()
      sphere(0.06, glowMat(c, 3), v(0, 0, 0), g)
      sphere(0.11, mat(c, { opacity: 0.25, glow: c, glowIntensity: 1 }), v(0, 0, 0), g)
      return { kind: 'float', group: g }
    }
    case 'imp': {
      const g = new THREE.Group()
      const m = mat(c, { roughness: 0.6 })
      sphere(0.05, m, v(0, 0, 0), g, [1, 1.3, 0.9])
      sphere(0.045, m, v(0, 0.09, 0.01), g)
      eyes(g, v(0, 0.1, 0.045), 0.016, 0.009, '#000', '#ffe040')
      for (const s of [-1, 1]) {
        aim(cone(0.01, 0.04, mat('#2a1a1a'), v(s * 0.025, 0.14, 0), g, 5), v(s * 0.3, 1, -0.2))
        const w = sphere(0.06, mat(shade(c, -0.2), { side: THREE.DoubleSide }), v(s * 0.07, 0.03, -0.03), g, [1, 0.6, 0.12])
        w.name = 'wing'
        w.userData.flap = s
        limb(v(s * 0.02, -0.05, 0), v(s * 0.03, -0.11, 0.01), 0.012, m, g)
      }
      taper([v(0, -0.04, -0.04), v(0.02, -0.1, -0.1), v(0.06, -0.08, -0.14)], 0.008, 0.004, m, g, 5)
      return { kind: 'float', group: g }
    }
    case 'slime': {
      const g = new THREE.Group()
      const cube = box(0.24, 0.24, 0.24, mat(c, { opacity: 0.55, roughness: 0.05, glow: c, glowIntensity: 0.2 }), v(0, 0.12, 0), g)
      cube.geometry = new THREE.BoxGeometry(0.24, 0.24, 0.24, 2, 2, 2)
      eyes(g, v(0, 0.17, 0.11), 0.05, 0.02, '#101010')
      sphere(0.04, mat('#c83a2a'), v(0.03, 0.08, 0), g)
      return { kind: 'ground', group: g }
    }
    default: return null
  }
}

function spider(c) {
  const g = new THREE.Group()
  const m = mat(c, { roughness: 0.55 })
  const hairy = mat(shade(c, 0.08), { roughness: 0.9 })
  const legs = []
  sphere(0.17, m, v(0, 0.2, -0.16), g, [1, 0.85, 1.2])
  box(0.09, 0.008, 0.12, mat('#c02020', { glow: '#c02020', glowIntensity: 0.6 }), v(0, 0.345, -0.18), g).rotation.x = -0.3
  sphere(0.1, hairy, v(0, 0.17, 0.06), g, [1, 0.8, 1])
  sphere(0.065, m, v(0, 0.16, 0.16), g)
  for (const [x, y] of [[-0.03, 0.19], [0.03, 0.19], [-0.05, 0.175], [0.05, 0.175], [-0.015, 0.205], [0.015, 0.205]]) sphere(0.012, glowMat('#ff3030', 2.5), v(x, y, 0.215), g, null, 8)
  for (const s of [-1, 1]) aim(cone(0.012, 0.06, mat('#1a1010'), v(s * 0.025, 0.11, 0.2), g, 6), v(s * 0.2, -1, 0.3))
  for (let i = 0; i < 4; i++) {
    for (const s of [-1, 1]) {
      const z = 0.12 - i * 0.07
      const leg = new THREE.Group()
      leg.position.set(s * 0.07, 0.17, z)
      taper([v(0, 0, 0), v(s * 0.16, 0.14, (1.5 - i) * 0.04), v(s * 0.3, -0.02, (1.5 - i) * 0.09), v(s * 0.34, -0.17, (1.5 - i) * 0.1)], 0.018, 0.008, hairy, leg, 6)
      leg.userData.phase = i * 1.3 + (s > 0 ? Math.PI : 0)
      g.add(leg)
      legs.push(leg)
    }
  }
  return { group: g, height: 0.4, update: (t) => legs.forEach((l) => (l.rotation.y = Math.sin(t * 2 + l.userData.phase) * 0.05)) }
}

function dragonBoss(c) {
  const g = new THREE.Group()
  const m = mat(c, { roughness: 0.55, flat: true })
  const belly = mat('#e8b060', { roughness: 0.6 })
  const horn = mat('#2a2018', { roughness: 0.4 })
  const membrane = mat(shade(c, -0.12), { side: THREE.DoubleSide, roughness: 0.7 })
  // Body and legs
  sphere(0.22, m, v(0, 0.36, -0.02), g, [1, 0.9, 1.5])
  sphere(0.17, belly, v(0, 0.3, 0.04), g, [0.9, 0.8, 1.3])
  for (const [x, z, f] of [[1, 0.2, 1], [-1, 0.2, 1], [1, -0.2, -1], [-1, -0.2, -1]]) {
    limb(v(x * 0.16, 0.36, z), v(x * 0.2, 0.18, z + f * 0.04), 0.06, m, g)
    limb(v(x * 0.2, 0.18, z + f * 0.04), v(x * 0.2, 0.04, z + 0.06), 0.045, m, g)
    for (const k of [-1, 0, 1]) aim(cone(0.012, 0.05, horn, v(x * 0.2 + k * 0.03, 0.02, z + 0.12), g, 5), v(0, 0, 1))
  }
  // Neck and head
  const neck = new THREE.Group()
  g.add(neck)
  taper([v(0, 0.42, 0.22), v(0, 0.6, 0.32), v(0, 0.76, 0.36)], 0.09, 0.065, m, neck, 8)
  const head = new THREE.Group()
  head.position.set(0, 0.8, 0.4)
  neck.add(head)
  sphere(0.09, m, v(0, 0, 0), head, [1, 0.85, 1.1])
  box(0.1, 0.06, 0.16, m, v(0, -0.01, 0.12), head)
  box(0.09, 0.025, 0.15, belly, v(0, -0.055, 0.11), head)
  for (const s of [-1, 1]) {
    sphere(0.016, glowMat('#ffd040', 3), v(s * 0.05, 0.03, 0.08), head, null, 8)
    taper([v(s * 0.05, 0.05, -0.04), v(s * 0.09, 0.12, -0.14), v(s * 0.1, 0.13, -0.25)], 0.022, 0.006, horn, head, 6)
    aim(cone(0.008, 0.03, mat('#f0e8d0'), v(s * 0.035, -0.04, 0.18), head, 5), v(0, -1, 0))
  }
  for (let i = 0; i < 5; i++) aim(cone(0.018, 0.06, horn, v(0, 0.6 - i * 0.07 + 0.1, 0.33 - i * 0.07), neck, 5), v(0, 1, -0.4))
  // Tail
  taper([v(0, 0.36, -0.3), v(0, 0.24, -0.55), v(0.12, 0.12, -0.78), v(0.28, 0.06, -0.9)], 0.08, 0.015, m, g, 12)
  aim(cone(0.04, 0.1, horn, v(0.31, 0.06, -0.93), g, 4), v(0.5, 0, -1))
  // Wings
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(0.35, 0.42)
  shape.lineTo(0.82, 0.3)
  shape.lineTo(0.72, 0.12)
  shape.lineTo(0.6, 0.16)
  shape.lineTo(0.5, -0.02)
  shape.lineTo(0.36, 0.06)
  shape.lineTo(0.24, -0.1)
  shape.lineTo(0, 0)
  const wings = []
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group()
    pivot.position.set(s * 0.12, 0.5, 0.04)
    const w = new THREE.Mesh(new THREE.ShapeGeometry(shape), membrane)
    w.scale.x = s
    w.rotation.x = -0.25
    pivot.add(w)
    limb(v(0, 0, 0), v(s * 0.35, 0.42, -0.1), 0.02, m, pivot)
    limb(v(s * 0.35, 0.42, -0.1), v(s * 0.82, 0.3, -0.2), 0.014, m, pivot)
    pivot.userData.side = s
    g.add(pivot)
    wings.push(pivot)
  }
  return {
    group: g,
    height: 1.0,
    update: (t) => {
      wings.forEach((p) => (p.rotation.y = p.userData.side * (0.5 + Math.sin(t * 1.4) * 0.18)))
      head.rotation.x = Math.sin(t * 0.9) * 0.06
      neck.rotation.y = Math.sin(t * 0.5) * 0.08
    },
  }
}

// Enemy creatures on the battlefield: { group, height, update }.
export function buildMonster(spec) {
  const scale = spec.scale || 1
  let built
  if (spec.type === 'spider') built = spider(spec.color)
  else if (spec.type === 'dragonBoss') built = dragonBoss(spec.color)
  else {
    const pet = buildCompanion(spec)
    built = { group: pet.group, height: 0.4, update: () => {} }
  }
  const root = new THREE.Group()
  root.add(built.group)
  built.group.scale.setScalar(scale)
  return { root, height: built.height * scale, update: built.update }
}
