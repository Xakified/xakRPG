import * as THREE from 'three'
import { box, cone, limb, mat, metalMat, glowMat, shade, sphere, taper, v, aim } from './kit'

// Builds the body, head and race features. Returns anchor points that
// clothing, hair and gear attach to. Units are meters, feet at y = 0.

export function skinMaterial(look, f) {
  if (f.construct) return mat(look.skin, { metalness: 0.6, roughness: 0.38 })
  if (f.ooze) return mat(look.skin, { opacity: 0.72, roughness: 0.08, glow: look.skin, glowIntensity: 0.25 })
  if (f.insect) return mat(look.skin, { roughness: 0.32, metalness: 0.15 })
  if (f.scales) return mat(look.skin, { roughness: 0.55, flat: true })
  if (f.fur) return mat(look.skin, { roughness: 1 })
  return mat(look.skin, { roughness: 0.62 })
}

export function buildBody(group, { look, f, outfit }) {
  const skin = skinMaterial(look, f)
  const { fat, muscle } = look
  const w = (1 + fat * 0.55 + muscle * 0.18) * (f.stocky ? 1.18 : 1) * (f.slender ? 0.9 : 1)
  const legLen = (f.stocky ? 0.78 : 0.9) * (f.slender ? 1.04 : 1)
  const hipY = f.centaur ? 1.12 : legLen + 0.06
  const sY = hipY + 0.5
  const sW = (0.18 + muscle * 0.06 + fat * 0.035) * (f.stocky ? 1.12 : 1) * (f.slender ? 0.92 : 1)
  const headR = 0.115 * (f.bigHead ? 1.28 : 1)
  const headY = sY + 0.12 + headR

  const m = clothing(look, f, outfit, skin)

  // Torso: a lathe profile flattened front-to-back.
  const waist = 0.13 + fat * 0.1
  const chest = 0.15 + muscle * 0.035 + fat * 0.05
  const profile = [
    [0.001, -0.08], [0.15 * w, -0.06], [0.165 * w, 0.04], [waist * (f.stocky ? 1.15 : 1), 0.2],
    [chest * (f.stocky ? 1.12 : 1), 0.36], [sW * 0.98, 0.47], [0.075 + muscle * 0.02, 0.56], [0.001, 0.57],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), m.torso)
  torso.position.y = hipY
  torso.scale.z = 0.72 + fat * 0.12
  group.add(torso)
  if (fat > 0.35) sphere(0.08 + fat * 0.1, m.torso, v(0, hipY + 0.16, 0.03 + fat * 0.06), group, [1.1, 0.95, 0.9])
  if (look.breasts) {
    const r = 0.055 + fat * 0.025 + 0.012
    for (const s of [-1, 1]) sphere(r, m.torso, v(s * 0.068 * Math.min(w, 1.3), hipY + 0.37, 0.085 + fat * 0.03), group, [1, 0.95, 0.85])
  }
  // Deltoids
  for (const s of [-1, 1]) sphere(0.06 + muscle * 0.03 + fat * 0.01, m.upper, v(s * sW, sY - 0.02, 0), group)

  // Neck and head
  limb(v(0, sY, 0), v(0, headY - headR * 0.6, 0), 0.045 + muscle * 0.02, skin, group, { capsule: false })
  const head = sphere(headR, skin, v(0, headY, 0), group, f.frog ? [1.25, 0.85, 1.05] : [1, 1.08, 1.02], 24)
  head.name = 'head'

  // Arms: right arm bent forward to hold a weapon, left arm relaxed.
  const armR = 0.042 * (1 + fat * 0.45 + muscle * 0.6)
  const foreR = 0.037 * (1 + fat * 0.35 + muscle * 0.45)
  const arms = [
    { s: 1, elbow: v(sW + 0.06, sY - 0.27, 0), wrist: v(sW + 0.05, sY - 0.46, 0.17) },
    { s: -1, elbow: v(-(sW + 0.07), sY - 0.28, -0.02), wrist: v(-(sW + 0.09), sY - 0.54, 0.05) },
  ]
  if (f.insect) arms.push(
    { s: 1, elbow: v(sW + 0.02, sY - 0.38, 0.08), wrist: v(sW - 0.02, sY - 0.5, 0.2), small: true, from: v(sW * 0.8, sY - 0.16, 0.02) },
    { s: -1, elbow: v(-(sW + 0.02), sY - 0.38, 0.08), wrist: v(-(sW - 0.02), sY - 0.5, 0.2), small: true, from: v(-sW * 0.8, sY - 0.16, 0.02) },
  )
  const hands = []
  for (const a of arms) {
    const shoulder = a.from || v(a.s * sW, sY - 0.03, 0)
    const k = a.small ? 0.75 : 1
    limb(shoulder, a.elbow, armR * k, m.upper, group)
    limb(a.elbow, a.wrist, foreR * k * (outfit.style === 'robe' ? 1.45 : 1), m.fore, group)
    const hand = a.wrist.clone().add(v(0, -0.035, 0.02))
    sphere(0.038 * (1 + muscle * 0.2) * k, m.hand, hand, group)
    hands.push(hand)
    if (f.fins && !a.small) cone(0.012, 0.09, mat(shade(look.skin, -0.12)), a.elbow.clone().add(v(a.s * 0.03, -0.06, -0.02)), group).rotation.z = a.s * 0.6
  }

  // Legs, or a horse body for centaurs.
  if (f.centaur) buildHorse(group, look, hipY)
  else {
    const thighR = 0.068 * (1 + fat * 0.5 + muscle * 0.3)
    const shinR = 0.05 * (1 + fat * 0.4 + muscle * 0.3)
    for (const s of [-1, 1]) {
      const hip = v(s * 0.085 * Math.min(w, 1.35), hipY - 0.02, 0)
      const knee = v(s * 0.095 * Math.min(w, 1.3), hipY * 0.52, 0.02)
      const ankle = v(s * 0.095 * Math.min(w, 1.3), 0.08, 0)
      limb(hip, knee, thighR, m.thigh, group)
      limb(knee, ankle, shinR, m.shin, group)
      box(0.1, 0.07, 0.2, m.foot, v(ankle.x, 0.035, 0.05), group)
    }
    if (outfit.style === 'robe') {
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.17 * w, 0.3 * w, hipY + 0.02, 24, 1, true), m.torso)
      skirt.material.side = THREE.DoubleSide
      skirt.position.y = (hipY + 0.02) / 2 + 0.03
      skirt.scale.z = 0.8
      group.add(skirt)
    }
  }

  const a = {
    hipY, sY, sW, w, headY, headR, fat, muscle,
    head: v(0, headY, 0),
    rightHand: hands[0],
    leftHand: hands[1],
    back: v(0, sY - 0.15, -0.12 * w),
    top: headY + headR * 1.1,
  }
  buildFace(group, look, f, a, outfit)
  buildRaceFeatures(group, look, f, a, skin)
  return a
}

function clothing(look, f, o, skin) {
  const cloth = (c) => mat(c, { roughness: 0.88 })
  const metal = (c) => metalMat(c)
  const main = o.metalChest ? metal(o.main) : cloth(o.main)
  const accent = cloth(o.accent)
  const boots = mat('#2a1c14', { roughness: 0.75 })
  switch (o.style) {
    case 'plate': {
      const plate = metal(o.main)
      const dark = metal(shade(o.main, -0.12))
      return { torso: plate, upper: plate, fore: dark, hand: dark, thigh: plate, shin: dark, foot: dark }
    }
    case 'robe':
      return { torso: main, upper: main, fore: main, hand: skin, thigh: cloth('#2a2228'), shin: boots, foot: boots }
    case 'cloth':
      return { torso: main, upper: accent, fore: accent, hand: skin, thigh: cloth(shade(o.accent, -0.3)), shin: boots, foot: boots }
    case 'gi':
      return { torso: main, upper: skin, fore: accent, hand: skin, thigh: cloth(o.main), shin: cloth(o.main), foot: skin }
    default:
      return { torso: main, upper: main, fore: cloth(shade(o.main, -0.15)), hand: skin, thigh: cloth('#3a2a1e'), shin: boots, foot: boots }
  }
}

function buildHorse(group, look, hipY) {
  const coat = mat(look.hairColor === '#1a1410' ? '#2a1e18' : shade(look.hairColor, -0.05), { roughness: 0.9 })
  const y = hipY - 0.18
  limb(v(0, y, 0.05), v(0, y, -0.7), 0.21, coat, group).scale.set(1, 1, 1)
  for (const [x, z] of [[0.12, 0], [-0.12, 0], [0.12, -0.68], [-0.12, -0.68]]) {
    limb(v(x, y - 0.05, z), v(x, 0.42, z + 0.02), 0.06, coat, group)
    limb(v(x, 0.42, z + 0.02), v(x, 0.06, z), 0.042, coat, group)
    box(0.09, 0.06, 0.1, mat('#1a1410'), v(x, 0.03, z + 0.01), group)
  }
  taper([v(0, y + 0.05, -0.88), v(0, y - 0.15, -1.0), v(0, 0.35, -1.02)], 0.05, 0.02, mat(look.hairColor, { roughness: 1 }), group)
}

function buildFace(group, look, f, a, outfit) {
  const { headY, headR } = a
  const hasSnout = Boolean(f.snout)
  const eyeY = headY + (hasSnout ? 0.03 : 0.012)
  const eyeX = headR * (hasSnout ? 0.42 : 0.36)
  const eyeZ = headR * (hasSnout ? 0.8 : 0.86)
  const big = f.bigEyes ? 1.6 : 1
  const glow = outfit.eyes || f.glowEyes
  for (const s of [-1, 1]) {
    const p = v(s * eyeX, eyeY, eyeZ)
    if (glow) {
      sphere(0.017 * big, glowMat(glow, 2.5), p, group)
    } else if (f.blankEyes) {
      sphere(0.019 * big, mat('#f4f4f8', { roughness: 0.2 }), p, group)
    } else {
      sphere(0.02 * big, mat('#f4f0ea', { roughness: 0.3 }), p, group)
      const iris = sphere(0.012 * big, mat(f.snakeEyes ? '#e8c020' : look.eyes, { roughness: 0.2 }), p.clone().add(v(0, 0, 0.0135 * big)), group)
      iris.scale.z = 0.6
      sphere(0.0055 * big, mat('#080808', { roughness: 0.1 }), p.clone().add(v(0, 0, 0.0205 * big)), group, f.snakeEyes ? [0.4, 1.6, 0.5] : [1, 1, 0.5], 8)
    }
    if (!f.noHair && !f.construct) {
      box(0.04, 0.008, 0.012, mat(look.hairColor), v(s * eyeX, eyeY + 0.035, eyeZ + 0.004), group).rotation.z = s * -0.15
    }
  }
  if (!hasSnout) {
    const nose = cone(f.bigNose ? 0.03 : 0.016, f.bigNose ? 0.06 : 0.035, mat(shade(look.skin, -0.04)), v(0, headY - 0.02, headR * 0.98), group)
    nose.rotation.x = Math.PI / 2
    box(0.04, 0.008, 0.01, mat('#4a2020'), v(0, headY - 0.058, headR * 0.92), group)
  }
  if (f.fangs) for (const s of [-1, 1]) cone(0.005, 0.016, mat('#fffaf0'), v(s * 0.013, headY - 0.068, headR * 0.92), group).rotation.x = Math.PI
  if (f.tusks === 'small' || f.tusks === 'big') {
    const k = f.tusks === 'big' ? 1.5 : 1
    for (const s of [-1, 1]) cone(0.01 * k, 0.04 * k, mat('#f0e8d0'), v(s * 0.03, headY - 0.06 + 0.012 * k, headR * 0.86), group)
  }
  if (f.stitches) {
    const thread = mat('#2a2020')
    box(0.004, 0.06, 0.004, thread, v(0.05, headY + 0.03, headR * 0.93), group).rotation.z = 0.4
    box(0.09, 0.004, 0.004, thread, v(-0.03, headY - 0.04, headR * 0.92), group)
  }
}

function buildRaceFeatures(group, look, f, a, skin) {
  const { headY, headR } = a
  const dark = mat(shade(look.skin, -0.12), { roughness: f.fur ? 1 : 0.6 })
  const light = mat(shade(look.skin, 0.12), { roughness: 0.8 })
  const horn = mat('#3a2e28', { roughness: 0.5 })
  const bone = mat('#e8dcc0', { roughness: 0.5 })

  // Ears
  const side = (s, dy = 0) => v(s * headR * 0.95, headY + dy, -0.01)
  for (const s of [-1, 1]) {
    switch (f.ears) {
      case 'long': aim(cone(0.024, 0.15, skin, side(s, 0.02).add(v(s * 0.06, 0.03, -0.02)), group), v(s, 0.45, -0.3)); break
      case 'swept': aim(cone(0.022, 0.12, skin, side(s, 0.01).add(v(s * 0.04, 0.0, -0.05)), group), v(s * 0.6, 0.1, -1)); break
      case 'short': aim(cone(0.02, 0.06, skin, side(s, 0.01).add(v(s * 0.025, 0.012, 0)), group), v(s, 0.6, -0.2)); break
      case 'big': aim(cone(0.04, 0.2, skin, side(s, 0.0).add(v(s * 0.09, 0.015, 0)), group), v(s, 0.25, -0.1)); break
      case 'cat': aim(cone(0.035, 0.08, skin, v(s * headR * 0.6, headY + headR * 0.95, -0.01), group), v(s * 0.3, 1, -0.1)); break
      case 'bear': sphere(0.035, skin, v(s * headR * 0.72, headY + headR * 0.85, -0.01), group, [1, 1, 0.6]); break
      case 'rabbit': limb(v(s * headR * 0.4, headY + headR * 0.9, -0.02), v(s * headR * 0.75, headY + headR * 2.6, -0.06), 0.028, skin, group).scale.z = 0.5; break
      case 'cow': aim(sphere(0.04, skin, side(s, 0.02).add(v(s * 0.04, 0, 0)), group, [0.6, 1.4, 0.4]), v(s, -0.4, 0)); break
      case 'goat': aim(sphere(0.03, skin, side(s, 0.02).add(v(s * 0.035, 0, 0)), group, [0.6, 1.3, 0.4]), v(s, 0.2, 0)); break
      case 'elephant': sphere(0.13, dark, side(s, -0.01).add(v(s * 0.05, 0, -0.03)), group, [0.2, 1.1, 0.9]); break
      case 'fin': sphere(0.06, mat(shade(look.skin, -0.08), { opacity: 0.85 }), side(s, 0.01).add(v(s * 0.035, 0.015, -0.02)), group, [0.15, 0.8, 1]); break
      case 'round':
      case undefined:
        if (!f.noHair || f.construct === undefined) sphere(0.024, skin, side(s, 0.0), group, [0.5, 1, 0.8])
        break
    }
  }

  // Snouts, beaks and muzzles
  const front = v(0, headY - 0.035, headR * 0.82)
  switch (f.snout) {
    case 'dragon':
    case 'lizard': {
      const len = f.snout === 'lizard' ? 0.15 : 0.12
      limb(front.clone().add(v(0, 0, -0.02)), front.clone().add(v(0, -0.01, len)), 0.055, skin, group).scale.set(1.1, 1, 0.8)
      for (const s of [-1, 1]) sphere(0.008, mat('#1a1010'), front.clone().add(v(s * 0.022, 0.025, len + 0.025)), group)
      box(0.08, 0.005, len, mat('#3a1a1a'), front.clone().add(v(0, -0.032, len / 2 + 0.02)), group)
      break
    }
    case 'beak':
    case 'smallbeak': {
      const len = f.snout === 'beak' ? 0.13 : 0.06
      const b = cone(0.035, len, mat(look.skin === '#2a2a32' || look.skin === '#1e1e24' ? '#4a4a4a' : '#d8a030', { roughness: 0.4 }), front.clone().add(v(0, 0.005, len / 2 + 0.02)), group)
      aim(b, v(0, -0.35, 1))
      break
    }
    case 'cat':
      sphere(0.055, light, front.clone().add(v(0, -0.005, 0.03)), group, [1.25, 0.8, 0.8])
      sphere(0.013, mat('#c06070'), front.clone().add(v(0, 0.022, 0.075)), group)
      break
    case 'smallmuzzle':
    case 'bunny':
      sphere(0.045, light, front.clone().add(v(0, 0, 0.025)), group, [1.15, 0.85, 0.8])
      sphere(0.011, mat(f.snout === 'bunny' ? '#e08090' : '#2a1a1a'), front.clone().add(v(0, 0.02, 0.06)), group)
      break
    case 'bull':
      sphere(0.075, light, front.clone().add(v(0, -0.01, 0.04)), group, [1.15, 0.85, 1])
      mesh3(new THREE.TorusGeometry(0.022, 0.005, 6, 16), metalMat('#d8b040'), front.clone().add(v(0, -0.035, 0.11)), group)
      break
    case 'hippo':
      box(0.17, 0.11, 0.12, skin, front.clone().add(v(0, -0.02, 0.05)), group)
      for (const s of [-1, 1]) sphere(0.01, mat('#2a1a1a'), front.clone().add(v(s * 0.04, 0.035, 0.11)), group)
      break
    case 'turtle':
      sphere(0.06, skin, front.clone().add(v(0, 0, 0.02)), group, [1, 0.8, 1])
      break
    case 'trunk':
      taper([front.clone().add(v(0, 0.02, 0)), front.clone().add(v(0, -0.08, 0.08)), front.clone().add(v(0, -0.22, 0.09)), front.clone().add(v(0, -0.3, 0.14))], 0.04, 0.02, skin, group)
      break
  }
  if (f.tusks === 'elephant') for (const s of [-1, 1]) taper([front.clone().add(v(s * 0.045, -0.03, 0.02)), front.clone().add(v(s * 0.06, -0.12, 0.08)), front.clone().add(v(s * 0.05, -0.14, 0.16))], 0.016, 0.004, bone, group, 6)

  // Horns
  const hornAt = (s) => v(s * headR * 0.5, headY + headR * 0.8, headR * 0.15)
  for (const s of [-1, 1]) {
    const o = hornAt(s)
    switch (f.horns) {
      case 'curl': taper([o, o.clone().add(v(s * 0.03, 0.08, -0.03)), o.clone().add(v(s * 0.06, 0.1, -0.12)), o.clone().add(v(s * 0.06, 0.02, -0.16))], 0.022, 0.004, horn, group); break
      case 'swept': taper([o.clone().add(v(0, -0.02, -0.04)), o.clone().add(v(s * 0.02, 0.02, -0.14)), o.clone().add(v(s * 0.03, 0.04, -0.24))], 0.02, 0.004, bone, group, 6); break
      case 'small': aim(cone(0.014, 0.05, horn, o.clone().add(v(0, 0.01, 0.02)), group), v(s * 0.3, 1, 0.1)); break
      case 'bull': taper([o.clone().add(v(s * 0.02, -0.03, -0.02)), o.clone().add(v(s * 0.14, 0.0, 0)), o.clone().add(v(s * 0.2, 0.1, 0.02))], 0.026, 0.006, bone, group); break
      case 'ram': taper([o.clone().add(v(0, 0, -0.02)), o.clone().add(v(s * 0.06, 0.04, -0.08)), o.clone().add(v(s * 0.11, -0.04, -0.06)), o.clone().add(v(s * 0.1, -0.1, 0.02))], 0.022, 0.008, horn, group); break
    }
  }
  if (f.crest) for (let i = 0; i < 5; i++) aim(cone(0.012, 0.05, dark, v(0, headY + headR * (0.95 - i * 0.18), -headR * (0.1 + i * 0.22)), group), v(0, 1, -0.6))
  if (f.feathers) for (const s of [-1, 0, 1]) aim(sphere(0.03, dark, v(s * 0.03, headY + headR * 0.85, -headR * 0.6), group, [0.4, 1.8, 0.4]), v(s * 0.2, 0.6, -1))
  if (f.fins) sphere(0.08, mat(shade(look.skin, -0.1), { opacity: 0.85 }), v(0, headY + headR * 0.6, -headR * 0.5), group, [0.12, 1, 1.2])
  if (f.antennae) for (const s of [-1, 1]) taper([v(s * 0.03, headY + headR * 0.9, headR * 0.3), v(s * 0.08, headY + headR * 1.8, headR * 0.5), v(s * 0.14, headY + headR * 2.2, headR * 0.2)], 0.007, 0.003, dark, group, 6)
  if (f.insect) for (const s of [-1, 1]) aim(cone(0.01, 0.05, dark, v(s * 0.03, headY - 0.07, headR * 0.85), group), v(-s * 0.4, -1, 0.3))

  // Tails
  const base = v(0, a.hipY + 0.02, -0.12 * a.w)
  switch (f.tail) {
    case 'devil': {
      const tip = v(0.25, 0.12, -0.45)
      taper([base, v(0.05, a.hipY - 0.25, -0.3), v(0.15, 0.25, -0.4), tip], 0.018, 0.008, skin, group)
      aim(cone(0.035, 0.07, skin, tip.clone().add(v(0.02, -0.02, 0)), group), v(0.4, -0.3, -0.2))
      break
    }
    case 'thick': taper([base, v(0, a.hipY * 0.6, -0.3), v(0.05, 0.12, -0.6), v(0.15, 0.04, -0.85)], 0.08, 0.01, skin, group); break
    case 'furry': taper([base, v(0.05, a.hipY - 0.3, -0.3), v(0.15, a.hipY - 0.2, -0.45), v(0.2, a.hipY + 0.05, -0.45)], 0.04, 0.025, skin, group); break
    case 'tuft': {
      const tip = v(0.18, 0.2, -0.38)
      taper([base, v(0.05, a.hipY - 0.3, -0.25), tip], 0.016, 0.012, skin, group)
      sphere(0.04, mat(look.hairColor, { roughness: 1 }), tip, group)
      break
    }
    case 'monkey': taper([base, v(0, a.hipY - 0.2, -0.3), v(0.1, a.hipY - 0.1, -0.5), v(0.15, a.hipY + 0.12, -0.42), v(0.08, a.hipY + 0.1, -0.35)], 0.022, 0.012, skin, group); break
    case 'stub': sphere(0.05, light, base.clone().add(v(0, 0, -0.03)), group); break
  }

  if (f.shell) {
    const shellMat = mat(shade(look.skin, -0.18), { roughness: 0.5, flat: true })
    const s = sphere(0.3 * a.w, shellMat, v(0, a.hipY + 0.28, -0.06), group, [1, 1.15, 0.6], 10)
    s.position.z -= 0.09
  }

  if (f.wings) buildWings(group, look, f, a)
}

function mesh3(geometry, material, pos, parent) {
  const m = new THREE.Mesh(geometry, material)
  m.position.copy(pos)
  parent.add(m)
  return m
}

function buildWings(group, look, f, a) {
  const shape = new THREE.Shape()
  if (f.wings === 'fairy') {
    shape.absellipse(0, 0, 0.18, 0.09, 0, Math.PI * 2)
  } else {
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.25, 0.25, 0.55, 0.32, 0.75, 0.3)
    shape.lineTo(0.62, 0.18)
    shape.lineTo(0.66, 0.08)
    shape.lineTo(0.5, 0.0)
    shape.lineTo(0.52, -0.1)
    shape.lineTo(0.36, -0.12)
    shape.lineTo(0.34, -0.24)
    shape.bezierCurveTo(0.2, -0.2, 0.08, -0.1, 0, 0)
  }
  const geo = new THREE.ShapeGeometry(shape)
  const color = f.wings === 'fairy' ? '#c8f0ff' : f.glowEyes ? '#fff8e8' : look.skin
  const m = mat(color, {
    side: THREE.DoubleSide,
    opacity: f.wings === 'fairy' ? 0.55 : f.glowEyes ? 0.85 : 1,
    glow: f.wings === 'fairy' || f.glowEyes ? color : undefined,
    glowIntensity: 0.35,
  })
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group()
    pivot.position.set(s * 0.06, a.sY - 0.08, -0.12 * a.w)
    group.add(pivot)
    const count = f.wings === 'fairy' ? 2 : 1
    for (let i = 0; i < count; i++) {
      const wing = new THREE.Mesh(geo, m)
      wing.scale.set(s, 1, 1)
      wing.rotation.z = f.wings === 'fairy' ? (i ? -0.5 : 0.4) * s : 0
      if (f.wings === 'fairy') wing.position.set(s * 0.14, i ? -0.08 : 0.06, 0)
      pivot.add(wing)
    }
    pivot.rotation.y = s * 0.55
    pivot.userData.flap = s
    pivot.name = 'wing'
  }
}
