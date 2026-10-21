import * as THREE from 'three'
import { cone, limb, mat, shell, sphere, taper, v, aim } from './kit'

// Hairstyles and beards, built around the head anchor.

export function buildHair(group, style, color, a, { hidden } = {}) {
  if (style === 'bald' || hidden) return
  const m = mat(color, { roughness: 0.85, side: THREE.DoubleSide })
  const R = a.headR
  const c = a.head
  const at = (x, y, z) => v(c.x + x * R, c.y + y * R, c.z + z * R)
  const cap = (r = 1.08, bottom = 0.5, gap = 0) => {
    const s = shell(R * r, m, c, group, { bottom: Math.PI * bottom, frontGap: gap })
    s.rotation.x = -0.42
    return s
  }
  const back = (len, width = 1.6, depth = 0.55) => {
    const p = limb(at(0, 0.1, -0.55), at(0, 0.1 - len, -0.7), R * 0.55, m, group)
    p.scale.set(width, 1, depth)
    return p
  }

  switch (style) {
    case 'buzz': cap(1.03, 0.48); break
    case 'short': cap(1.09, 0.52); break
    case 'sidepart':
      cap(1.1, 0.52)
      sphere(R * 0.45, m, at(0.35, 0.72, 0.62), group, [1.4, 0.55, 0.7])
      break
    case 'spiky':
      cap(1.05, 0.48)
      for (let i = 0; i < 14; i++) {
        const t = (i / 14) * Math.PI * 2
        const dir = v(Math.cos(t) * 0.6, 0.8, Math.sin(t) * 0.6 - 0.15)
        aim(cone(R * 0.14, R * 0.55, m, at(dir.x * 0.85, dir.y * 0.95, dir.z * 0.85), group, 6), dir)
      }
      aim(cone(R * 0.16, R * 0.6, m, at(0, 1.05, 0), group, 6), v(0, 1, -0.2))
      break
    case 'mohawk':
      for (let i = 0; i < 7; i++) {
        const t = -0.5 + i * 0.32
        aim(cone(R * 0.16, R * 0.6, m, at(0, Math.cos(t) * 1.0, Math.sin(-t) * 1.0 - 0.1), group, 6), v(0, Math.cos(t), -Math.sin(t)))
      }
      break
    case 'pompadour':
      cap(1.08, 0.5)
      sphere(R * 0.55, m, at(0, 0.95, 0.45), group, [1.3, 0.8, 1.2])
      break
    case 'curly':
      for (let i = 0; i < 40; i++) {
        const y = 0.25 + (i % 8) * 0.1
        const t = i * 2.4
        const r = Math.sqrt(1 - y * y)
        const z = Math.sin(t) * r
        if (z > 0.55 && y < 0.7) continue
        sphere(R * 0.24, m, at(Math.cos(t) * r * 1.02, y * 1.05, z * 1.02), group, null, 8)
      }
      break
    case 'afro':
      sphere(R * 1.62, m, at(0, 0.45, -0.25), group, [1, 0.95, 1], 18)
      break
    case 'bob':
      shell(R * 1.13, m, c, group, { bottom: Math.PI * 0.72, frontGap: Math.PI * 0.6 })
      break
    case 'long':
      shell(R * 1.12, m, c, group, { bottom: Math.PI * 0.68, frontGap: Math.PI * 0.62 })
      back(2.6)
      break
    case 'wavy':
      shell(R * 1.14, m, c, group, { bottom: Math.PI * 0.7, frontGap: Math.PI * 0.62 })
      for (const x of [-0.7, -0.25, 0.25, 0.7]) taper([at(x, 0, -0.75), at(x * 1.1 + 0.1, -1.2, -0.8), at(x * 1.1 - 0.1, -2.3, -0.75), at(x * 1.1, -3, -0.7)], R * 0.28, R * 0.2, m, group, 8)
      break
    case 'ponytail':
      cap(1.09, 0.55)
      sphere(R * 0.2, m, at(0, 0.15, -1.05), group)
      taper([at(0, 0.15, -1.1), at(0, -0.6, -1.35), at(0, -1.6, -1.2), at(0, -2.3, -1.0)], R * 0.25, R * 0.1, m, group)
      break
    case 'highpony':
      cap(1.09, 0.52)
      taper([at(0, 0.9, -0.6), at(0, 1.4, -0.9), at(0, 0.6, -1.5), at(0, -0.6, -1.4), at(0, -1.4, -1.2)], R * 0.25, R * 0.08, m, group)
      break
    case 'twintails':
      cap(1.09, 0.52)
      for (const s of [-1, 1]) taper([at(s * 0.85, 0.55, -0.3), at(s * 1.3, 0.3, -0.4), at(s * 1.25, -1.0, -0.3), at(s * 1.1, -2.2, -0.2)], R * 0.25, R * 0.1, m, group)
      break
    case 'bun':
      cap(1.08, 0.55)
      sphere(R * 0.45, m, at(0, 0.6, -0.95), group)
      break
    case 'topknot':
      cap(1.06, 0.52)
      sphere(R * 0.32, m, at(0, 1.18, -0.15), group)
      break
    case 'pigtails':
      cap(1.08, 0.52)
      for (const s of [-1, 1]) sphere(R * 0.38, m, at(s * 0.65, 0.95, -0.2), group)
      break
    case 'braids':
      cap(1.09, 0.6, Math.PI * 0.5)
      for (const s of [-1, 1]) for (let i = 0; i < 9; i++) sphere(R * 0.17, m, at(s * (0.95 - i * 0.02), -0.2 - i * 0.32, 0.05 + i * 0.05), group, null, 8)
      break
    case 'braid':
      cap(1.09, 0.58)
      for (let i = 0; i < 10; i++) sphere(R * 0.19, m, at(0, 0.0 - i * 0.3, -1.05 - (i < 3 ? i * 0.08 : 0.24)), group, null, 8)
      break
    case 'dreads':
      cap(1.1, 0.55)
      for (let i = 0; i < 16; i++) {
        const t = Math.PI * 0.2 + (i / 15) * Math.PI * 1.6 + Math.PI / 2
        const x = Math.cos(t)
        const z = -Math.abs(Math.sin(t)) * 0.9 - 0.1
        if (z > -0.2 && Math.abs(x) < 0.5) continue
        taper([at(x * 0.95, 0.4, z), at(x * 1.15, -0.6, z * 1.1), at(x * 1.15, -1.8, z * 1.1)], R * 0.1, R * 0.08, m, group, 4)
      }
      break
    case 'mullet':
      cap(1.08, 0.52)
      back(1.6, 1.4, 0.5)
      break
    case 'undercut': {
      const half = new THREE.Mesh(new THREE.SphereGeometry(R * 1.1, 20, 14, Math.PI, Math.PI, 0, Math.PI * 0.55), m)
      half.position.copy(c)
      half.rotation.y = Math.PI / 2
      group.add(half)
      sphere(R * 0.5, m, at(-0.45, 0.85, 0.35), group, [1.2, 0.5, 1.2])
      break
    }
    case 'wild':
      shell(R * 1.3, m, c, group, { bottom: Math.PI * 0.75, frontGap: Math.PI * 0.55 })
      for (let i = 0; i < 10; i++) {
        const t = Math.PI / 2 + Math.PI * 0.35 + (i / 9) * Math.PI * 1.3
        const dir = v(Math.cos(t), (i % 3) * 0.3 - 0.2, -Math.abs(Math.sin(t)))
        aim(cone(R * 0.22, R * 0.8, m, at(dir.x * 1.2, dir.y * 1.2, dir.z * 1.2), group, 6), dir)
      }
      break
  }
}

export function buildBeard(group, style, color, a) {
  if (style === 'none') return
  const R = a.headR
  const c = a.head
  const at = (x, y, z) => v(c.x + x * R, c.y + y * R, c.z + z * R)
  const m = mat(color, { roughness: 0.9, side: THREE.DoubleSide, opacity: style === 'stubble' ? 0.55 : 1 })
  const jaw = (r) => {
    // Front half of a sphere (phi 0..PI faces +z), lower part only.
    const s = new THREE.Mesh(new THREE.SphereGeometry(R * r, 20, 12, 0, Math.PI, Math.PI * 0.62, Math.PI * 0.34), m)
    s.position.copy(c)
    group.add(s)
    return s
  }
  const stache = () => {
    for (const s of [-1, 1]) aim(limb(at(s * 0.05, -0.38, 0.95), at(s * 0.38, -0.5, 0.82), R * 0.07, m, group), v(s, -0.3, 0))
  }
  switch (style) {
    case 'stubble': jaw(1.015); break
    case 'mustache': stache(); break
    case 'goatee':
      stache()
      aim(cone(R * 0.16, R * 0.45, m, at(0, -0.95, 0.72), group), v(0, -1, 0.2))
      break
    case 'short':
      jaw(1.08)
      stache()
      sphere(R * 0.32, m, at(0, -0.92, 0.6), group)
      break
    case 'long':
      jaw(1.08)
      stache()
      aim(cone(R * 0.42, R * 1.8, m, at(0, -1.55, 0.62), group), v(0, -1, 0.1))
      break
    case 'braided':
      jaw(1.08)
      stache()
      for (let i = 0; i < 6; i++) sphere(R * (0.2 - i * 0.015), m, at(0, -1.0 - i * 0.25, 0.68), group, null, 8)
      break
    case 'chops':
      for (const s of [-1, 1]) limb(at(s * 0.9, 0.15, 0.25), at(s * 0.75, -0.55, 0.55), R * 0.18, m, group)
      stache()
      break
  }
}
