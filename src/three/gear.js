import * as THREE from 'three'
import { box, cone, glowMat, limb, mat, metalMat, sphere, taper, v } from './kit'

// Weapons are built pointing up (+y) with the grip at the origin, then placed
// in a hand. Relics are small objects that float and orbit the hero.

const leather = () => mat('#3a2414', { roughness: 0.8 })

function blade(g, len, width, metal, glow, y0 = 0.12) {
  const bm = glow ? mat(metal, { metalness: 0.7, roughness: 0.25, glow, glowIntensity: 0.3 }) : metalMat(metal)
  box(width, len, 0.012, bm, v(0, y0 + len / 2, 0), g)
  const tip = cone(width / 1.4, width * 1.4, bm, v(0, y0 + len + width * 0.7, 0), g, 4)
  tip.rotation.y = Math.PI / 4
  tip.scale.z = 0.25
}

export function buildWeapon(spec) {
  const g = new THREE.Group()
  const metal = spec.metal || '#b8bcc4'
  const wood = mat(spec.wood || '#6a4a2a', { roughness: 0.8 })
  const glow = spec.glow
  switch (spec.type) {
    case 'sword':
    case 'greatsword':
    case 'runeblade': {
      const big = spec.type !== 'sword'
      limb(v(0, -0.06, 0), v(0, big ? 0.16 : 0.1, 0), 0.016, leather(), g, { capsule: false })
      sphere(0.025, metalMat('#c8a040'), v(0, -0.07, 0), g)
      box(big ? 0.2 : 0.15, 0.025, 0.035, metalMat('#c8a040'), v(0, big ? 0.17 : 0.11, 0), g)
      blade(g, big ? 0.9 : 0.62, big ? 0.07 : 0.05, spec.type === 'runeblade' ? '#6a7a8a' : metal, spec.type === 'runeblade' ? null : glow, big ? 0.18 : 0.12)
      if (spec.type === 'runeblade') box(0.012, 0.7, 0.016, glowMat('#60c8ff', 2), v(0, 0.6, 0), g)
      break
    }
    case 'axe':
    case 'greataxe': {
      const big = spec.type === 'greataxe'
      const len = big ? 1.0 : 0.65
      limb(v(0, -0.15, 0), v(0, len, 0), 0.018, wood, g, { capsule: false })
      const shape = new THREE.Shape()
      shape.moveTo(0, -0.06)
      shape.quadraticCurveTo(0.2, -0.16, 0.22, 0)
      shape.quadraticCurveTo(0.2, 0.16, 0, 0.06)
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false })
      for (const s of big ? [1, -1] : [1]) {
        const head = new THREE.Mesh(geo, metalMat(metal))
        head.position.set(0, len - 0.1, -0.008)
        head.scale.x = s * (big ? 1.2 : 1)
        g.add(head)
      }
      break
    }
    case 'warhammer':
      limb(v(0, -0.15, 0), v(0, 0.7, 0), 0.018, wood, g, { capsule: false })
      box(0.26, 0.12, 0.12, glow ? mat(metal, { metalness: 0.7, roughness: 0.3, glow, glowIntensity: 0.4 }) : metalMat(metal), v(0, 0.7, 0), g)
      break
    case 'mace': {
      limb(v(0, -0.1, 0), v(0, 0.5, 0), 0.017, wood, g, { capsule: false })
      const m = glow ? mat(metal, { metalness: 0.6, roughness: 0.3, glow, glowIntensity: 0.8 }) : metalMat(metal)
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), m)
      head.position.y = 0.55
      g.add(head)
      for (const p of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, -1]]) {
        const d = v(...p)
        const c = cone(0.02, 0.06, m, v(0, 0.55, 0).add(d.clone().multiplyScalar(0.08)), g, 6)
        c.quaternion.setFromUnitVectors(v(0, 1, 0), d)
      }
      break
    }
    case 'spear':
      limb(v(0, -0.7, 0), v(0, 0.95, 0), 0.015, wood, g, { capsule: false })
      cone(0.035, 0.2, metalMat(metal), v(0, 1.05, 0), g, 6)
      break
    case 'staff':
    case 'woodStaff':
    case 'totem': {
      limb(v(0, -0.75, 0), v(0, 0.75, 0), 0.02, wood, g, { capsule: false })
      if (spec.type === 'staff') {
        sphere(0.06, glowMat(glow || '#80c0ff', 2.5), v(0, 0.84, 0), g)
        for (const s of [-1, 1]) taper([v(0, 0.72, 0), v(s * 0.06, 0.8, 0), v(s * 0.03, 0.9, 0)], 0.012, 0.005, wood, g, 4)
      } else if (spec.type === 'woodStaff') {
        taper([v(0, 0.75, 0), v(0.08, 0.86, 0), v(0.02, 0.95, 0), v(-0.05, 0.88, 0)], 0.02, 0.01, wood, g, 6)
        for (const p of [[0.08, 0.8], [-0.04, 0.84], [0.05, 0.93]]) sphere(0.035, mat('#5aa040', { flat: true }), v(p[0], p[1], 0.02), g, [1.2, 0.5, 0.8], 6)
      } else {
        box(0.12, 0.16, 0.1, mat('#8a5a3a', { flat: true }), v(0, 0.82, 0), g)
        for (const s of [-1, 1]) sphere(0.015, glowMat('#60e0ff'), v(s * 0.03, 0.85, 0.05), g)
        for (const s of [-1, 1]) taper([v(s * 0.06, 0.78, 0), v(s * 0.14, 0.72, 0), v(s * 0.16, 0.6, 0)], 0.012, 0.004, mat('#e8e0d0'), g, 4)
      }
      break
    }
    case 'wand':
      limb(v(0, -0.05, 0), v(0, 0.28, 0), 0.01, wood, g, { r2: 0.006, capsule: false })
      sphere(0.02, glowMat(glow || '#ffb040', 3), v(0, 0.3, 0), g)
      break
    case 'orb':
      sphere(0.07, glowMat(glow || '#ffb040', 2.5), v(0, 0.12, 0), g)
      break
    case 'bow': {
      const curve = new THREE.QuadraticBezierCurve3(v(0, -0.55, 0), v(0, 0, 0.32), v(0, 0.55, 0))
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.014, 6, false), wood))
      limb(v(0, -0.55, 0), v(0, 0.55, 0), 0.002, mat('#e8e0d0'), g, { capsule: false })
      break
    }
    case 'crossbow': {
      box(0.04, 0.45, 0.05, wood, v(0, 0.12, 0), g)
      const curve = new THREE.QuadraticBezierCurve3(v(-0.25, 0.3, 0), v(0, 0.3, -0.12), v(0.25, 0.3, 0))
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.012, 6, false), metalMat(metal)))
      break
    }
    case 'daggers':
      limb(v(0, -0.04, 0), v(0, 0.06, 0), 0.013, leather(), g, { capsule: false })
      box(0.07, 0.015, 0.02, metalMat('#8a8a90'), v(0, 0.07, 0), g)
      blade(g, 0.22, 0.035, metal, glow, 0.08)
      break
    case 'scythe': {
      limb(v(0, -0.8, 0), v(0, 0.85, 0), 0.018, wood, g, { capsule: false })
      const bm = glow ? mat(metal, { metalness: 0.7, roughness: 0.25, glow, glowIntensity: 0.5 }) : metalMat(metal)
      taper([v(0, 0.85, 0), v(-0.18, 0.92, 0), v(-0.4, 0.86, 0), v(-0.55, 0.7, 0)], 0.03, 0.004, bm, g, 10).scale.z = 0.35
      break
    }
    case 'flail': {
      limb(v(0, -0.08, 0), v(0, 0.35, 0), 0.017, wood, g, { capsule: false })
      for (let i = 1; i <= 4; i++) sphere(0.012, metalMat('#8a8a90'), v(i * 0.035, 0.35 - i * 0.03, 0), g, null, 6)
      const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), metalMat(metal))
      ball.position.set(0.19, 0.18, 0)
      g.add(ball)
      for (const d of [[1, 0, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [0.7, 0.7, 0]]) {
        const dir = v(...d).normalize()
        const c = cone(0.016, 0.05, metalMat('#c8ccd0'), ball.position.clone().add(dir.clone().multiplyScalar(0.065)), g, 5)
        c.quaternion.setFromUnitVectors(v(0, 1, 0), dir)
      }
      break
    }
    case 'lute': {
      const body = sphere(0.14, wood, v(0, -0.05, 0), g, [1, 1.2, 0.45])
      body.position.z = -0.02
      sphere(0.035, mat('#1a1008'), v(0, -0.02, 0.045), g, [1, 1, 0.2])
      box(0.04, 0.45, 0.025, mat('#4a2a14'), v(0, 0.33, 0), g)
      box(0.06, 0.08, 0.03, mat('#4a2a14'), v(0, 0.58, -0.01), g).rotation.x = -0.4
      break
    }
  }
  return g
}

export function placeWeapon(group, spec, a) {
  if (!spec || spec.type === 'fists') return
  const pose = (w, hand, rot) => {
    w.position.copy(hand)
    w.rotation.set(...rot)
    group.add(w)
  }
  switch (spec.type) {
    case 'bow':
      pose(buildWeapon(spec), a.leftHand, [0, Math.PI / 2, 0.1])
      return
    case 'daggers':
      pose(buildWeapon(spec), a.rightHand, [1.1, 0, -0.1])
      pose(buildWeapon(spec), a.leftHand, [1.2, 0, 0.2])
      return
    case 'lute':
      pose(buildWeapon(spec), a.rightHand.clone().add(v(-0.18, 0.08, 0.06)), [0.2, 0, 0.9])
      return
    case 'crossbow':
      pose(buildWeapon(spec), a.rightHand, [1.35, 0, 0])
      return
    case 'orb':
      pose(buildWeapon(spec), a.rightHand, [0, 0, 0])
      return
    case 'spear':
    case 'staff':
    case 'woodStaff':
    case 'totem':
    case 'scythe':
      pose(buildWeapon(spec), a.rightHand, [0.08, 0, -0.05])
      return
    default:
      pose(buildWeapon(spec), a.rightHand, [0.55, 0, -0.15])
  }
}

export function buildRelic(spec) {
  const g = new THREE.Group()
  const c = spec.color
  switch (spec.type) {
    case 'orb': sphere(0.06, glowMat(c, 2), v(0, 0, 0), g); break
    case 'amulet':
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 8, 24), metalMat(c)))
      sphere(0.025, glowMat('#e04050', 1.2), v(0, -0.05, 0), g)
      break
    case 'tome':
      box(0.12, 0.16, 0.05, mat(c, { roughness: 0.7 }), v(0, 0, 0), g)
      box(0.11, 0.15, 0.04, mat('#f0e6c8'), v(0.008, 0, 0), g)
      sphere(0.018, glowMat('#ff4040'), v(0, 0.02, 0.028), g)
      break
    case 'lantern':
      limb(v(0, -0.06, 0), v(0, 0.06, 0), 0.045, mat('#2a2a2e', { metalness: 0.6, roughness: 0.4, opacity: 0.5 }), g, { capsule: false })
      sphere(0.03, glowMat(c, 3), v(0, 0, 0), g)
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.005, 6, 16), metalMat('#2a2a2e')))
      g.children.at(-1).position.y = 0.09
      break
    case 'horn': taper([v(-0.08, -0.03, 0), v(0, 0.02, 0), v(0.07, 0.08, 0)], 0.008, 0.035, mat(c, { roughness: 0.5 }), g, 6); break
    case 'skull':
      sphere(0.06, mat(c, { roughness: 0.5 }), v(0, 0, 0), g)
      for (const s of [-1, 1]) sphere(0.015, mat('#101010'), v(s * 0.022, 0.0, 0.05), g)
      box(0.05, 0.025, 0.04, mat(c), v(0, -0.05, 0.02), g)
      break
    case 'potion':
      sphere(0.05, mat(c, { opacity: 0.85, roughness: 0.1, glow: c, glowIntensity: 0.6 }), v(0, 0, 0), g)
      limb(v(0, 0.04, 0), v(0, 0.09, 0), 0.015, mat('#d0e8f0', { opacity: 0.6 }), g, { capsule: false })
      limb(v(0, 0.09, 0), v(0, 0.11, 0), 0.017, mat('#8a6a4a'), g, { capsule: false })
      break
    case 'crystal': {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), mat(c, { glow: c, glowIntensity: 1, roughness: 0.1, flat: true }))
      m.scale.y = 1.6
      g.add(m)
      break
    }
    case 'holy':
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 8, 20), metalMat(c)))
      box(0.018, 0.09, 0.015, metalMat(c), v(0, -0.07, 0), g)
      box(0.07, 0.016, 0.015, metalMat(c), v(0, -0.045, 0), g)
      break
    case 'd20': g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat(c, { metalness: 0.8, roughness: 0.25, flat: true }))); break
    case 'rune':
      box(0.08, 0.11, 0.04, mat('#6a6a72', { flat: true }), v(0, 0, 0), g)
      box(0.012, 0.07, 0.01, glowMat(c, 2), v(0, 0, 0.022), g)
      box(0.04, 0.012, 0.01, glowMat(c, 2), v(0.01, 0.015, 0.022), g).rotation.z = 0.6
      break
    case 'hourglass':
      for (const s of [-1, 1]) {
        const k = cone(0.04, 0.06, mat('#d8e8f0', { opacity: 0.5, roughness: 0.1 }), v(0, s * 0.03, 0), g)
        k.rotation.x = s > 0 ? Math.PI : 0
        limb(v(0, s * 0.065, 0), v(0, s * 0.075, 0), 0.05, metalMat(c), g, { capsule: false })
      }
      sphere(0.022, mat('#e8c060'), v(0, -0.03, 0), g)
      break
    case 'feather': sphere(0.03, glowMat(c, 1.5), v(0, 0, 0), g, [0.6, 3, 0.15]); break
    case 'mirror':
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.008, 24), mat(c, { metalness: 1, roughness: 0.05 })))
      g.children.at(-1).rotation.x = Math.PI / 2
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.008, 6, 24), metalMat('#c8a040')))
      limb(v(0, -0.065, 0), v(0, -0.13, 0), 0.01, metalMat('#c8a040'), g, { capsule: false })
      break
    case 'key':
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 16), metalMat(c)))
      box(0.012, 0.1, 0.008, metalMat(c), v(0, -0.07, 0), g)
      box(0.03, 0.012, 0.008, metalMat(c), v(0.015, -0.11, 0), g)
      break
  }
  return g
}
