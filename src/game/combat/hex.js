// Axial hex coordinates (q, r). See redblobgames.com/grids/hexagons.

export const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]

export const key = (q, r) => `${q},${r}`
export const parse = (k) => k.split(',').map(Number)

export function distance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2
}

export function neighbors(q, r) {
  return DIRS.map(([dq, dr]) => ({ q: q + dq, r: r + dr }))
}

function round(fq, fr) {
  const fs = -fq - fr
  let q = Math.round(fq)
  let r = Math.round(fr)
  const s = Math.round(fs)
  const dq = Math.abs(q - fq)
  const dr = Math.abs(r - fr)
  const ds = Math.abs(s - fs)
  if (dq > dr && dq > ds) q = -r - s
  else if (dr > ds) r = -q - s
  return { q, r }
}

export function line(a, b) {
  const n = distance(a, b)
  const out = []
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n
    out.push(round(a.q + (b.q - a.q) * t + 1e-6, a.r + (b.r - a.r) * t + 1e-6))
  }
  return out
}

export function within(center, radius) {
  const out = []
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) out.push({ q: center.q + q, r: center.r + r })
  }
  return out
}

// World position of a hex center (pointy-top), for the 3D board.
export function toWorld(q, r, size = 1) {
  return { x: size * Math.sqrt(3) * (q + r / 2), z: size * 1.5 * r }
}

// Small seeded RNG so a level's map is the same for everyone.
export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}
