import * as THREE from 'three'

// Small helpers shared by the procedural model builders.

const UP = new THREE.Vector3(0, 1, 0)

export function v(x, y, z) {
  return new THREE.Vector3(x, y, z)
}

export function mat(color, opts = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.7,
    metalness: opts.metalness ?? 0,
    flatShading: opts.flat ?? false,
    transparent: opts.opacity !== undefined && opts.opacity < 1,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  })
  if (opts.glow) {
    m.emissive = new THREE.Color(opts.glow)
    m.emissiveIntensity = opts.glowIntensity ?? 1.2
  }
  return m
}

export function glowMat(color, intensity = 2) {
  return mat(color, { glow: color, glowIntensity: intensity, roughness: 0.3 })
}

export function metalMat(color) {
  return mat(color, { metalness: 0.75, roughness: 0.32 })
}

export function mesh(geometry, material, pos, parent) {
  const m = new THREE.Mesh(geometry, material)
  if (pos) m.position.copy(pos)
  if (parent) parent.add(m)
  return m
}

export function sphere(r, material, pos, parent, scale, segs = 16) {
  const m = mesh(new THREE.SphereGeometry(r, segs, Math.round(segs * 0.75)), material, pos, parent)
  if (scale) m.scale.set(...scale)
  return m
}

export function box(w, h, d, material, pos, parent) {
  return mesh(new THREE.BoxGeometry(w, h, d), material, pos, parent)
}

// A capsule (or cylinder) spanning two points.
export function limb(a, b, r, material, parent, { r2, capsule = true, segs = 12 } = {}) {
  const dir = b.clone().sub(a)
  const len = dir.length()
  const geo = capsule && !r2
    ? new THREE.CapsuleGeometry(r, Math.max(0.0001, len), 4, segs)
    : new THREE.CylinderGeometry(r2 ?? r, r, len, segs)
  const m = new THREE.Mesh(geo, material)
  m.position.copy(a).add(b).multiplyScalar(0.5)
  m.quaternion.setFromUnitVectors(UP, dir.normalize())
  parent.add(m)
  return m
}

// A tapering tube along points (horns, tails, braids...), built from segments.
export function taper(points, r0, r1, material, parent, segs = 10) {
  const curve = new THREE.CatmullRomCurve3(points)
  const pts = curve.getPoints(segs)
  const group = new THREE.Group()
  for (let i = 0; i < pts.length - 1; i++) {
    const t0 = i / (pts.length - 1)
    const t1 = (i + 1) / (pts.length - 1)
    const ra = r0 + (r1 - r0) * t0
    const rb = r0 + (r1 - r0) * t1
    limb(pts[i], pts[i + 1], ra, material, group, { r2: rb, segs: 8 })
    sphere(rb, material, pts[i + 1], group, null, 8)
  }
  parent.add(group)
  return group
}

export function cone(r, h, material, pos, parent, segs = 10) {
  return mesh(new THREE.ConeGeometry(r, h, segs), material, pos, parent)
}

// Points a mesh's +Y axis along a direction.
export function aim(object, dir) {
  object.quaternion.setFromUnitVectors(UP, dir.clone().normalize())
  return object
}

// Part of a sphere shell, with an optional opening at the front for the face.
export function shell(r, material, pos, parent, { top = 0, bottom = Math.PI / 2, frontGap = 0, scale } = {}) {
  const phiStart = Math.PI / 2 + frontGap / 2
  const geo = new THREE.SphereGeometry(r, 24, 16, phiStart, Math.PI * 2 - frontGap, top, bottom - top)
  const m = mesh(geo, material, pos, parent)
  m.material.side = THREE.DoubleSide
  if (scale) m.scale.set(...scale)
  return m
}

export function shade(hex, amount) {
  const c = new THREE.Color(hex)
  const hsl = {}
  c.getHSL(hsl)
  c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + amount)))
  return '#' + c.getHexString()
}
