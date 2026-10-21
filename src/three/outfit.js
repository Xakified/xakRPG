import * as THREE from 'three'
import { box, cone, glowMat, limb, mat, metalMat, shade, shell, sphere, taper, v, aim } from './kit'

// Class and armor extras: capes, hoods, hats, pauldrons and the like.

export function buildOutfit(group, o, a, look) {
  const ex = o.extras
  const accent = mat(o.accent, { roughness: 0.85 })
  const accentMetal = metalMat(o.accent)
  const leather = mat('#3a2616', { roughness: 0.8 })
  const gold = metalMat('#d8b040')
  const { sY, sW, hipY, headR, head } = a

  // Belt (monks get a sash instead)
  if (o.style !== 'gi') {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.15 * a.w, 0.022, 8, 28), leather)
    belt.position.y = hipY + 0.03
    belt.rotation.x = Math.PI / 2
    belt.scale.y = 0.75 + a.fat * 0.12
    group.add(belt)
    box(0.045, 0.04, 0.02, gold, v(0, hipY + 0.03, 0.15 * a.w * (0.75 + a.fat * 0.12) + 0.01), group)
  }

  if (o.glowTrim || ex.has('runeGlow')) {
    const g = glowMat(o.accent, 2)
    box(0.012, 0.36, 0.01, g, v(0, hipY + 0.28, 0.135 * a.w * (0.72 + a.fat * 0.12) + 0.035), group)
    for (const s of [-1, 1]) box(0.08, 0.01, 0.01, g, v(s * 0.06, hipY + 0.38, 0.12 * a.w + 0.03), group)
  }

  if (ex.has('pauldrons') || ex.has('spikedPauldrons')) {
    const pm = ex.has('spikedPauldrons') ? metalMat(shade(o.main, -0.05)) : accentMetal
    for (const s of [-1, 1]) {
      const p = shell(0.1 + a.muscle * 0.03, pm, v(s * sW, sY + 0.0, 0), group, { bottom: Math.PI * 0.5 })
      p.scale.set(1.1, 0.8, 1.1)
      p.rotation.z = -s * 0.35
      if (ex.has('spikedPauldrons')) for (const t of [-0.5, 0, 0.5]) aim(cone(0.02, 0.1, metalMat('#c8ccd0'), v(s * (sW + 0.05), sY + 0.08, t * 0.08), group, 6), v(s * 0.6, 1, t))
    }
  }

  if (ex.has('skullPauldron')) {
    const bone = mat('#e8e0c8', { roughness: 0.5 })
    const p = v(-sW, sY + 0.05, 0)
    sphere(0.075, bone, p, group, [1, 0.95, 1.05])
    for (const s of [-1, 1]) sphere(0.018, mat('#101010'), p.clone().add(v(s * 0.025, 0.005, 0.065)), group)
    box(0.06, 0.03, 0.04, bone, p.clone().add(v(0, -0.05, 0.04)), group)
  }

  if (ex.has('tabard')) {
    box(0.18 * Math.min(a.w, 1.3), 0.62, 0.012, accent, v(0, hipY - 0.06, 0.14 * a.w * (0.72 + a.fat * 0.14) + 0.02), group)
    sphere(0.035, gold, v(0, hipY + 0.12, 0.14 * a.w * (0.72 + a.fat * 0.14) + 0.03), group, [1, 1, 0.3])
  }

  if (ex.has('cape') || ex.has('cloak') || ex.has('shortCape') || o.cape) {
    const color = o.cape || (ex.has('cloak') ? shade(o.main, -0.08) : o.accent)
    const len = ex.has('shortCape') && !o.cape ? 0.5 : sY - 0.05
    const capeMat = mat(color, { roughness: 0.9, side: THREE.DoubleSide })
    // Theta 0 faces +z (front), so centre the open cylinder on PI (the back).
    const cape = new THREE.Mesh(new THREE.CylinderGeometry(sW * 0.95, sW * 1.25 + 0.06, len, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76), capeMat)
    cape.position.set(0, sY - len / 2 + 0.02, -0.02)
    cape.scale.z = 0.75
    group.add(cape)
  }

  if (ex.has('hood')) {
    const hm = mat(shade(o.cape || o.main, -0.05), { roughness: 0.9, side: THREE.DoubleSide })
    const h = shell(headR * 1.28, hm, head.clone().add(v(0, 0.012, -0.012)), group, { bottom: Math.PI * 0.68, frontGap: Math.PI * 0.6 })
    h.scale.set(1, 1.12, 1.05)
    aim(cone(0.05, 0.1, hm, head.clone().add(v(0, headR * 0.7, -headR * 1.2)), group), v(0, 0.4, -1))
  }

  if (ex.has('mask')) {
    const mask = shell(headR * 1.02, mat('#1a1a1e', { roughness: 0.9 }), head, group, { top: Math.PI * 0.55, bottom: Math.PI * 0.72 })
    mask.scale.set(1, 1.08, 1.02)
  }

  if (ex.has('wizardHat')) {
    const hm = mat(o.main, { roughness: 0.85 })
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(headR * 2.2, headR * 2.2, 0.012, 28), hm)
    brim.position.copy(head).add(v(0, headR * 0.72, -0.01))
    group.add(brim)
    const tip = cone(headR * 1.05, headR * 3.4, hm, head.clone().add(v(0, headR * 2.35, -0.03)), group, 20)
    tip.rotation.x = -0.15
    const band = new THREE.Mesh(new THREE.CylinderGeometry(headR * 1.02, headR * 1.05, 0.03, 24), accent)
    band.position.copy(head).add(v(0, headR * 0.8, -0.01))
    group.add(band)
  }

  if (ex.has('featherHat')) {
    const hm = mat(o.main, { roughness: 0.85 })
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(headR * 1.75, headR * 1.75, 0.012, 28), hm)
    brim.position.copy(head).add(v(0, headR * 0.72, 0))
    brim.rotation.z = 0.12
    group.add(brim)
    sphere(headR * 1.08, hm, head.clone().add(v(0, headR * 0.78, 0)), group, [1, 0.55, 1])
    taper([head.clone().add(v(headR * 0.7, headR * 0.9, -0.02)), head.clone().add(v(headR * 1.5, headR * 1.8, -0.1)), head.clone().add(v(headR * 2.1, headR * 2.3, -0.3))], 0.02, 0.004, mat(o.accent), group, 6)
  }

  if (ex.has('jesterHat')) {
    for (const [s, col] of [[-1, o.main], [0, o.accent], [1, o.main]]) {
      const tip = head.clone().add(v(s * headR * 1.7, headR * (s ? 1.4 : 2.3), -headR * 0.3))
      taper([head.clone().add(v(s * headR * 0.4, headR * 0.8, 0)), head.clone().add(v(s * headR * 1.1, headR * 1.6, -0.02)), tip], headR * 0.45, headR * 0.1, mat(col), group, 6)
      sphere(0.022, gold, tip, group)
    }
  }

  if (ex.has('antlers')) {
    const wood = mat('#8a6a4a', { roughness: 0.8 })
    for (const s of [-1, 1]) {
      const o0 = head.clone().add(v(s * headR * 0.55, headR * 0.75, 0))
      const mid = o0.clone().add(v(s * 0.1, 0.14, -0.02))
      taper([o0, mid, o0.clone().add(v(s * 0.16, 0.3, -0.06))], 0.016, 0.005, wood, group, 6)
      taper([mid, mid.clone().add(v(s * 0.1, 0.06, 0.04))], 0.01, 0.004, wood, group, 3)
      taper([mid.clone().add(v(s * 0.03, 0.08, -0.02)), mid.clone().add(v(-s * 0.02, 0.18, 0))], 0.009, 0.004, wood, group, 3)
    }
  }

  if (ex.has('halo')) {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.95, 0.008, 8, 32), glowMat('#fff0a0', 2.5))
    halo.position.copy(head).add(v(0, headR * 1.5, -0.03))
    halo.rotation.x = Math.PI / 2 - 0.25
    group.add(halo)
  }

  if (ex.has('leafMantle') || ex.has('furMantle')) {
    const leafy = ex.has('leafMantle') && !ex.has('furMantle')
    const mm = leafy ? mat('#4a8a3a', { roughness: 0.8, flat: true }) : mat('#8a8a90', { roughness: 1 })
    const mm2 = leafy ? mat('#6aa84a', { roughness: 0.8, flat: true }) : mat('#a8a0a0', { roughness: 1 })
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * Math.PI * 2
      sphere(0.055, i % 2 ? mm : mm2, v(Math.cos(t) * sW * 0.85, sY + 0.02, Math.sin(t) * sW * 0.6), group, leafy ? [1.3, 0.4, 0.8] : [1, 0.8, 1], leafy ? 6 : 10)
    }
  }

  if (ex.has('beads')) for (let i = 0; i < 9; i++) {
    const t = Math.PI * 0.15 + (i / 8) * Math.PI * 0.7
    sphere(0.016, i % 3 ? mat('#c84a2a') : mat('#e8e0c8'), v(Math.cos(t) * 0.09, sY - 0.06 - Math.sin(t) * 0.07, 0.1 + Math.sin(t) * 0.02), group, null, 8)
  }

  if (ex.has('sash')) {
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.15 * a.w, 0.03, 8, 28), accent)
    sash.position.y = hipY + 0.05
    sash.rotation.x = Math.PI / 2
    sash.scale.y = 0.75 + a.fat * 0.12
    group.add(sash)
    box(0.05, 0.25, 0.015, accent, v(0.08, hipY - 0.08, 0.14 * a.w * (0.75 + a.fat * 0.12)), group)
  }

  if (ex.has('highCollar')) {
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.16, 20, 1, true, Math.PI * 0.25, Math.PI * 1.5), mat(o.accent, { side: THREE.DoubleSide }))
    collar.position.y = sY + 0.08
    group.add(collar)
  }

  if (ex.has('quiver')) {
    const q = limb(v(-0.08, sY - 0.35, -0.16 * a.w), v(0.1, sY + 0.05, -0.17 * a.w), 0.045, leather, group, { capsule: false })
    q.name = 'quiver'
    for (const dx of [0, 0.02, -0.02]) limb(v(0.1 + dx, sY + 0.05, -0.17 * a.w), v(0.14 + dx, sY + 0.17, -0.18 * a.w), 0.005, mat('#c8b080'), group, { capsule: false })
  }

  if (ex.has('shield')) {
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 28), accentMetal)
    sh.position.copy(a.leftHand).add(v(-0.06, 0.12, 0.02))
    sh.rotation.z = Math.PI / 2
    sh.rotation.y = 0.2
    group.add(sh)
    const boss = sphere(0.05, metalMat(o.main), sh.position.clone().add(v(-0.02, 0, 0)), group)
    boss.scale.x = 0.5
  }

  // Bare-chested monks still get some skin showing.
  if (o.style === 'gi') {
    const skinMat = mat(look.skin)
    box(0.04, 0.2, 0.01, skinMat, v(0, sY - 0.12, 0.13 * a.w * (0.72 + a.fat * 0.12) + 0.008), group)
  }
}
