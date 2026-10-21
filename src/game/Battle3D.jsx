import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildHero } from '../three/buildHero'
import { buildMonster } from '../three/creatures'
import { box, cone, glowMat, limb, mat, sphere, v } from '../three/kit'
import { distance, key, toWorld } from './combat/hex'
import { ENEMIES } from './combat/enemies'
import { STATUS_INFO } from './combat/skills'
import { heroSpec } from './engine'

// The 3D hex battlefield. Rendering only: the parent decides what clicks mean.

const THEMES = {
  forest: { floor: ['#55762f', '#4d6c2b', '#5d7f35'], rough: '#43602a', side: '#3a2c1c', water: '#3a7aa0', sky: '#1e3024', light: '#fff0cc', wall: 'tree', roughProp: 'bush' },
  crypt: { floor: ['#5e5a55', '#55514c', '#67625c'], rough: '#4e4a45', side: '#26222a', water: '#2a2a3a', sky: '#13111c', light: '#cfd6ff', wall: 'pillar', roughProp: 'rubble' },
  cave: { floor: ['#6a5d50', '#625548', '#73665a'], rough: '#5e5246', side: '#1e1915', water: '#050508', sky: '#0d0b10', light: '#d8c8ff', wall: 'stalagmite', roughProp: 'web' },
  warcamp: { floor: ['#80653f', '#745a38', '#8a6e48'], rough: '#5a4228', side: '#3a2a1a', water: '#3a2a1a', sky: '#2a1814', light: '#ffd0a0', wall: 'tent', roughProp: 'mud' },
  lair: { floor: ['#5e4a42', '#56433b', '#68534a'], rough: '#5e4a42', side: '#1e1412', water: '#ff5a10', sky: '#1c0907', light: '#ffc090', wall: 'rock', roughProp: 'gold' },
}

const HL = {
  move: '#5ab0ff', attack: '#ff4a3a', ally: '#5aff8a', hex: '#c080ff', aoe: '#ffb040', hover: '#ffffff', path: '#5ab0ff',
}

const SIDE_RING = { mine: '#ffd860', hero: '#e2b448', summon: '#6aff9a', enemy: '#ff4a3a' }

function disposeTree(object) {
  object.traverse((o) => {
    o.geometry?.dispose()
    if (o.material) [].concat(o.material).forEach((m) => m.dispose())
  })
}

function prop(type, theme, seed, tileColor) {
  const g = new THREE.Group()
  const turn = (seed % 360) * (Math.PI / 180)
  g.rotation.y = turn
  const s = 0.85 + (seed % 7) / 20
  switch (type) {
    case 'tree': {
      limb(v(0, 0, 0), v(0, 0.55, 0), 0.07, mat('#5a3e26', { roughness: 1 }), g, { capsule: false })
      const leaf = mat(['#2f5a24', '#3a6a2a', '#28501f'][seed % 3], { roughness: 0.9, flat: true })
      cone(0.42, 0.7, leaf, v(0, 0.75, 0), g, 7)
      cone(0.34, 0.6, leaf, v(0, 1.08, 0), g, 7)
      cone(0.24, 0.5, leaf, v(0, 1.38, 0), g, 7)
      break
    }
    case 'bush': {
      const leaf = mat('#3d6a2a', { roughness: 0.95, flat: true })
      sphere(0.2, leaf, v(-0.18, 0.12, 0.05), g, null, 7)
      sphere(0.16, leaf, v(0.15, 0.1, -0.12), g, null, 7)
      sphere(0.12, leaf, v(0.1, 0.08, 0.22), g, null, 7)
      if (seed % 3 === 0) sphere(0.035, mat('#d83a5a'), v(0.12, 0.2, 0.25), g, null, 6)
      break
    }
    case 'pillar': {
      const stone = mat('#8a847a', { roughness: 0.85 })
      if (seed % 3 === 0) {
        box(0.75, 0.42, 0.42, stone, v(0, 0.21, 0), g)
        box(0.8, 0.08, 0.48, mat('#9a948a'), v(0, 0.46, 0), g)
        box(0.08, 0.3, 0.04, stone, v(0, 0.65, 0), g)
        box(0.24, 0.06, 0.04, stone, v(0, 0.72, 0), g)
      } else {
        box(0.5, 0.12, 0.5, stone, v(0, 0.06, 0), g)
        limb(v(0, 0.1, 0), v(0, seed % 2 ? 1.6 : 0.9, 0), 0.17, stone, g, { capsule: false, segs: 8 })
        if (seed % 2) box(0.5, 0.12, 0.5, stone, v(0, 1.62, 0), g)
        else for (let i = 0; i < 3; i++) box(0.16, 0.1, 0.14, stone, v(Math.cos(i * 2) * 0.3, 0.05, Math.sin(i * 2) * 0.3), g).rotation.y = i
      }
      break
    }
    case 'rubble': {
      const stone = mat('#76706a', { roughness: 1, flat: true })
      for (let i = 0; i < 5; i++) {
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 + ((seed + i) % 4) * 0.03, 0), stone)
        r.position.set(Math.cos(i * 1.7 + seed) * 0.3, 0.05, Math.sin(i * 1.7 + seed) * 0.3)
        g.add(r)
      }
      break
    }
    case 'stalagmite': {
      const rock = mat('#6a5e52', { roughness: 0.9, flat: true })
      cone(0.3, 1.3 * s, rock, v(0, 0.65 * s, 0), g, 6)
      cone(0.18, 0.7, rock, v(0.28, 0.35, 0.12), g, 6)
      cone(0.14, 0.5, rock, v(-0.22, 0.25, -0.18), g, 6)
      if (seed % 2) sphere(0.06, glowMat('#7ad0ff', 2), v(0.1, 0.9, 0.18), g, [1, 1.6, 1], 6)
      break
    }
    case 'web': {
      const silk = new THREE.MeshBasicMaterial({ color: '#e8e8f0', transparent: true, opacity: 0.55, side: THREE.DoubleSide })
      for (let i = 0; i < 4; i++) box(0.9, 0.01, 0.015, silk, v(0, 0.03, 0), g).rotation.y = (i * Math.PI) / 4
      for (const r of [0.15, 0.3, 0.42]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 4, 8), silk)
        ring.rotation.x = Math.PI / 2
        ring.position.y = 0.03
        g.add(ring)
      }
      break
    }
    case 'tent': {
      const canvas = mat(seed % 2 ? '#a8885a' : '#8a3a2a', { roughness: 1, flat: true })
      const t = cone(0.6, 1.0, canvas, v(0, 0.5, 0), g, 4)
      t.rotation.y = Math.PI / 4
      limb(v(0, 0.9, 0), v(0, 1.4, 0), 0.02, mat('#4a3420'), g, { capsule: false })
      box(0.22, 0.14, 0.01, mat('#a02020', { side: THREE.DoubleSide }), v(0.11, 1.32, 0), g)
      break
    }
    case 'mud': {
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.55, 9), mat('#3e2c1a', { roughness: 0.3 }))
      m.rotation.x = -Math.PI / 2
      m.position.y = 0.012
      g.add(m)
      break
    }
    case 'rock': {
      const rock = mat('#3e3230', { roughness: 0.9, flat: true })
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 * s, 0), rock)
      r.position.y = 0.32
      r.scale.y = 1.3
      g.add(r)
      const r2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), rock)
      r2.position.set(0.35, 0.15, 0.2)
      g.add(r2)
      break
    }
    case 'gold': {
      const gold = mat('#e8b830', { metalness: 0.85, roughness: 0.3 })
      sphere(0.32, gold, v(0, -0.08, 0), g, [1, 0.5, 1], 10)
      for (let i = 0; i < 6; i++) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 10), gold)
        c.position.set(Math.cos(i * 1.3 + seed) * 0.38, 0.01, Math.sin(i * 1.3 + seed) * 0.38)
        c.rotation.x = (i % 3) * 0.3
        g.add(c)
      }
      if (seed % 3 === 0) box(0.22, 0.14, 0.15, mat('#6a3a1a'), v(0.25, 0.12, -0.2), g)
      break
    }
    case 'campfire': {
      for (let i = 0; i < 4; i++) limb(v(Math.cos(i * 1.6) * 0.3, 0.04, Math.sin(i * 1.6) * 0.3), v(0, 0.2, 0), 0.04, mat('#4a3020'), g, { capsule: false })
      const fire = cone(0.2, 0.45, glowMat('#ff8a20', 3), v(0, 0.28, 0), g, 6)
      fire.name = 'flame'
      for (let i = 0; i < 7; i++) box(0.14, 0.1, 0.12, mat('#6a6460', { flat: true }), v(Math.cos(i * 0.9) * 0.45, 0.05, Math.sin(i * 0.9) * 0.45), g)
      break
    }
    default:
      break
  }
  return g
}

function buildBoard(map) {
  const theme = THEMES[map.theme] || THEMES.forest
  const g = new THREE.Group()
  const tiles = {}
  const geo = new THREE.CylinderGeometry(0.95, 0.95, 0.4, 6)
  const side = mat(theme.side, { roughness: 1 })
  const tops = theme.floor.map((c) => mat(c, { roughness: 0.95, flat: true }))
  const roughTop = mat(theme.rough, { roughness: 1, flat: true })
  const water = map.theme === 'lair'
    ? mat(theme.water, { glow: '#ff4a00', glowIntensity: 1.6, roughness: 0.4 })
    : map.theme === 'cave'
      ? mat(theme.water, { roughness: 1 })
      : mat(theme.water, { roughness: 0.15, metalness: 0.1, opacity: 0.85 })
  for (const t of Object.values(map.tiles)) {
    const { x, z } = toWorld(t.q, t.r)
    const isWater = t.t === 'water'
    const top = isWater ? (map.theme === 'warcamp' ? tops[0] : water) : t.t === 'rough' ? roughTop : tops[t.v % tops.length]
    const m = new THREE.Mesh(geo, [side, top, side])
    const h = isWater && map.theme !== 'warcamp' ? -0.18 : (t.v % 5) * 0.012
    m.position.set(x, h - 0.2, z)
    m.userData.hex = { q: t.q, r: t.r }
    g.add(m)
    tiles[key(t.q, t.r)] = m
    let p = null
    if (t.t === 'wall') p = prop(theme.wall === 'tent' && t.v % 3 === 0 ? 'rock' : theme.wall, map.theme, t.v)
    if (t.t === 'rough') p = prop(theme.roughProp, map.theme, t.v)
    if (isWater && map.theme === 'warcamp') p = prop('campfire', map.theme, t.v)
    if (t.t === 'floor' && t.v % 9 === 0 && map.theme === 'forest') p = prop('bush', map.theme, t.v)
    if (p) {
      p.position.set(x, h, z)
      g.add(p)
    }
  }
  // Ground below the board
  const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 48), mat(theme.side, { roughness: 1 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.45
  g.add(ground)
  return { group: g, tiles, theme }
}

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(0,0,0,0.6)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function unitModel(u, run) {
  if (u.kind === 'hero') {
    const built = buildHero(heroSpec(run.heroes[u.id] || {}))
    return { ...built, scale: 0.75 }
  }
  const model = ENEMIES[u.type].model
  if (model.kind === 'creature') {
    const built = buildMonster(model)
    return { ...built, scale: model.type === 'dragonBoss' ? 0.62 : 1.3 }
  }
  const built = buildHero({ race: model.race, raceDef: model.raceDef, look: model.look, outfit: model.outfit, weapon: model.weapon, size: model.size })
  return { ...built, scale: 0.75 }
}

const easeTo = (a, b, k) => a + (b - a) * k

// battle: the battle state. run: the run state (for hero looks).
// highlights: { keys: {hexKey: kind}, aoe: {center, radius} }
export default function Battle3D({ battle, run, me, highlights, onHex, onHover }) {
  const holder = useRef(null)
  const overlay = useRef(null)
  const stage = useRef(null)
  const callbacks = useRef({})
  callbacks.current = { onHex, onHover }

  // Renderer, camera and the loop.
  useEffect(() => {
    const el = holder.current
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.prepend(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200)
    const hemi = new THREE.HemisphereLight('#ffe8d0', '#3a3050', 1.7)
    scene.add(hemi)
    const sun = new THREE.DirectionalLight('#fff0d0', 2.6)
    sun.position.set(6, 12, 8)
    scene.add(sun)
    const rim = new THREE.DirectionalLight('#8ab0ff', 0.9)
    rim.position.set(-6, 5, -8)
    scene.add(rim)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.minPolarAngle = 0.25
    controls.maxPolarAngle = 1.15
    controls.minDistance = 6
    controls.maxDistance = 60
    controls.target.set(0, 0, 0.6)

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(1, height)
      camera.updateProjectionMatrix()
      if (!stage.current?.framed) {
        const dist = 23 * Math.max(1, 1.25 / Math.max(0.4, camera.aspect)) ** 0.55
        camera.position.set(0, dist * 0.8, dist * 0.6)
        controls.update()
      }
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const pick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const s = stage.current
      const targets = [...Object.values(s.units).filter((x) => !x.dying).map((x) => x.hit), ...(s.board ? Object.values(s.board.tiles) : [])]
      const hit = raycaster.intersectObjects(targets, false)[0]
      return hit?.object.userData.hex ? { ...hit.object.userData.hex } : hit?.object.userData.unit ? { ...s.units[hit.object.userData.unit].hex } : null
    }
    let down = null
    const onDown = (e) => (down = { x: e.clientX, y: e.clientY })
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return
      down = null
      const h = pick(e)
      if (h) callbacks.current.onHex?.(h.q, h.r)
    }
    let lastHover = ''
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const h = pick(e)
      const k = h ? key(h.q, h.r) : ''
      if (k !== lastHover) {
        lastHover = k
        callbacks.current.onHover?.(h)
      }
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointermove', onMove)

    const shadowMap = shadowTexture()
    const marks = new THREE.Group()
    scene.add(marks)
    const effects = new THREE.Group()
    scene.add(effects)

    if (import.meta.env.DEV) {
      window.__xakHex = (q, r) => {
        const { x, z } = toWorld(q, r)
        const p = new THREE.Vector3(x, 0.1, z).project(camera)
        const rect = renderer.domElement.getBoundingClientRect()
        return { x: rect.left + ((p.x + 1) / 2) * rect.width, y: rect.top + ((1 - p.y) / 2) * rect.height }
      }
    }
    stage.current = { renderer, scene, camera, controls, units: {}, board: null, boardKey: null, marks, effects, anims: [], shadowMap, lastFx: 0, framed: false }
    resize()
    stage.current.framed = el.getBoundingClientRect().width > 0

    const clock = new THREE.Clock()
    let frame
    let last = 0
    const tmp = new THREE.Vector3()
    const loop = (now) => {
      frame = requestAnimationFrame(loop)
      if (now - last < 33) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const t = clock.getElapsedTime()
      const s = stage.current
      s.clockT = t
      for (const view of Object.values(s.units)) {
        // Walk along any queued path.
        const goal = view.path[0]
        if (goal) {
          const dx = goal.x - view.root.position.x
          const dz = goal.z - view.root.position.z
          const d = Math.hypot(dx, dz)
          const step = 5 * dt
          if (d <= step) {
            view.root.position.x = goal.x
            view.root.position.z = goal.z
            view.path.shift()
          } else {
            view.root.position.x += (dx / d) * step
            view.root.position.z += (dz / d) * step
            view.facing = Math.atan2(dx, dz)
          }
        }
        view.body.rotation.y = easeTo(view.body.rotation.y, view.facing, 0.25)
        // Attack lunge
        if (view.lunge) {
          const k = (t - view.lunge.t0) / 0.35
          if (k >= 1) view.lunge = null
          else {
            const push = Math.sin(k * Math.PI) * 0.35
            view.body.position.x = view.lunge.dx * push
            view.body.position.z = view.lunge.dz * push
          }
        } else view.body.position.set(0, 0, 0)
        if (view.hurtT && t - view.hurtT < 0.25) view.body.position.x += Math.sin(t * 80) * 0.04
        view.model.update(t)
        // Fallen heroes lie down; the dead sink away.
        view.model.root.rotation.x = easeTo(view.model.root.rotation.x, view.down ? -Math.PI / 2 : 0, 0.15)
        view.model.root.position.y = easeTo(view.model.root.position.y, view.down ? 0.12 : 0, 0.15)
        if (view.dying) {
          view.fade = Math.max(0, view.fade - dt * 1.5)
          view.root.scale.setScalar(view.fade)
          view.root.position.y = -(1 - view.fade) * 0.5
        }
        view.ring.material.opacity = view.active ? 0.6 + Math.sin(t * 5) * 0.35 : view.dim ? 0.25 : 0.7
        // Screen position for the name tag
        if (!view.tag || !view.tag.isConnected) view.tag = overlay.current?.querySelector(`[data-unit="${view.id}"]`)
        const tag = view.tag
        if (tag) {
          tmp.copy(view.root.position)
          tmp.y += view.height + 0.25
          tmp.project(camera)
          const rect = el.getBoundingClientRect()
          const behind = tmp.z > 1
          tag.style.transform = `translate(${((tmp.x + 1) / 2) * rect.width}px, ${((1 - tmp.y) / 2) * rect.height}px) translate(-50%, -100%)`
          tag.style.display = behind || view.dying ? 'none' : ''
          view.screen = { x: ((tmp.x + 1) / 2) * rect.width, y: ((1 - tmp.y) / 2) * rect.height }
        }
      }
      s.anims = s.anims.filter((a) => a(t, dt) !== false)
      s.marks.children.forEach((m) => m.userData.pulse && (m.material.opacity = 0.35 + Math.sin(t * 4) * 0.12))
      if (s.board) s.board.group.traverse((o) => o.name === 'flame' && (o.scale.y = 1 + Math.sin(t * 12 + o.id) * 0.15))
      controls.update()
      renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      for (const view of Object.values(stage.current.units)) disposeTree(view.root)
      disposeTree(scene)
      shadowMap.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      stage.current = null
    }
  }, [])

  // Board (rebuilt for each new level).
  useEffect(() => {
    const s = stage.current
    const boardKey = `${battle.stage}:${Object.keys(battle.map.tiles).length}:${battle.map.theme}`
    if (s.boardKey === boardKey) return
    if (s.board) {
      s.scene.remove(s.board.group)
      disposeTree(s.board.group)
    }
    for (const view of Object.values(s.units)) {
      s.scene.remove(view.root)
      disposeTree(view.root)
      view.tag = null
    }
    s.units = {}
    s.lastFx = battle.fxId
    s.board = buildBoard(battle.map)
    s.boardKey = boardKey
    s.scene.add(s.board.group)
    s.scene.background = new THREE.Color(s.board.theme.sky)
    s.scene.fog = new THREE.Fog(s.board.theme.sky, 22, 45)
  }, [battle.stage, battle.map])

  // Units and effects.
  useEffect(() => {
    const s = stage.current
    const fresh = battle.fx.filter((f) => f.id > s.lastFx)
    s.lastFx = Math.max(s.lastFx, battle.fxId || 0)

    for (const u of Object.values(battle.units)) {
      let view = s.units[u.id]
      const { x, z } = toWorld(u.q, u.r)
      if (!view) {
        if (u.dead) continue
        const model = unitModel(u, run)
        const root = new THREE.Group()
        const body = new THREE.Group()
        body.scale.setScalar(model.scale)
        body.add(model.root)
        root.add(body)
        const color = u.id === me ? SIDE_RING.mine : SIDE_RING[u.kind] || SIDE_RING.enemy
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.58, 0.72, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false }))
        ring.geometry.rotateZ(Math.PI / 6)
        ring.rotation.x = -Math.PI / 2
        ring.position.y = 0.03
        root.add(ring)
        const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: s.shadowMap, transparent: true, depthWrite: false }))
        blob.rotation.x = -Math.PI / 2
        blob.position.y = 0.02
        root.add(blob)
        // An invisible column so units are easy to click.
        const height = model.height * model.scale
        const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, height + 0.2, 6), new THREE.MeshBasicMaterial({ visible: false }))
        hit.position.y = height / 2
        hit.userData.unit = u.id
        root.add(hit)
        root.position.set(x, 0, z)
        s.scene.add(root)
        view = { id: u.id, root, body, ring, hit, model, height, path: [], facing: u.side === 'enemy' ? 0 : Math.PI, fade: 1, hex: { q: u.q, r: u.r } }
        s.units[u.id] = view
      }
      view.hex = { q: u.q, r: u.r }
      view.down = !!u.down
      view.active = battle.turn === 'party' && u.id === me && !u.done && !u.down
      view.dim = battle.turn === 'party' && u.kind === 'hero' && u.done
      if (u.dead && !view.dying) view.dying = true
      const moved = fresh.filter((f) => f.kind === 'move' && f.unit === u.id).pop()
      if (moved) view.path = moved.path.slice(1).map((p) => toWorld(p.q, p.r))
      const end = view.path[view.path.length - 1]
      if (!end || end.x !== x || end.z !== z) {
        if (Math.hypot(view.root.position.x - x, view.root.position.z - z) > 0.01) view.path.push({ x, z })
      }
      // Face the closest foe when standing still.
      const near = Object.values(battle.units)
        .filter((o) => !o.dead && o.side !== u.side)
        .sort((a, c) => distance(a, u) - distance(c, u))[0]
      if (near && !view.path.length) {
        const w = toWorld(near.q, near.r)
        view.facing = Math.atan2(w.x - x, w.z - z)
      }
    }
    // Remove views whose dying animation finished.
    for (const [id, view] of Object.entries(s.units)) {
      if (view.dying && view.fade <= 0) {
        s.scene.remove(view.root)
        disposeTree(view.root)
        delete s.units[id]
      }
    }

    for (const f of fresh) playFx(s, f, overlay.current)
  }, [battle, run, me])

  // Tile highlights.
  useEffect(() => {
    const s = stage.current
    for (const m of [...s.marks.children]) {
      s.marks.remove(m)
      m.geometry.dispose()
      m.material.dispose()
    }
    if (!s.board) return
    const add = (k, kind, inner = 0) => {
      const tile = s.board.tiles[k]
      if (!tile) return
      const geo = inner ? new THREE.RingGeometry(0.62, 0.86, 6) : new THREE.CircleGeometry(0.86, 6)
      geo.rotateZ(Math.PI / 6)
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: HL[kind], transparent: true, opacity: 0.38, depthWrite: false }))
      m.rotation.x = -Math.PI / 2
      m.position.set(tile.position.x, tile.position.y + 0.215, tile.position.z)
      m.userData.pulse = kind !== 'hover'
      s.marks.add(m)
    }
    for (const [k, kind] of Object.entries(highlights?.keys || {})) add(k, kind, kind === 'attack' || kind === 'ally' ? 1 : 0)
    for (const k of highlights?.aoe || []) add(k, 'aoe')
  }, [highlights, battle.stage])

  return (
    <div className="battle3d" ref={holder}>
      <div className="battle-overlay" ref={overlay}>
        {Object.values(battle.units).filter((u) => !u.dead).map((u) => (
          <UnitTag key={u.id} u={u} me={me} />
        ))}
      </div>
    </div>
  )
}

function UnitTag({ u, me }) {
  const pct = Math.max(0, (u.hp / u.maxHp) * 100)
  const statuses = Object.keys(u.statuses || {})
  return (
    <div data-unit={u.id} className={`unit-tag ${u.side} ${u.id === me ? 'mine' : ''} ${u.down ? 'down' : ''} ${u.boss ? 'boss' : ''}`}>
      {(u.kind === 'hero' || u.boss) && <span className="unit-name">{u.name}</span>}
      <span className="hp-bar">
        <span className="hp-fill" style={{ width: `${pct}%` }} />
        {u.shield > 0 && <span className="hp-shield" style={{ width: `${Math.min(100, (u.shield / u.maxHp) * 100)}%` }} />}
      </span>
      {statuses.length > 0 && (
        <span className="unit-statuses">
          {statuses.map((s) => <span key={s} className="status-dot" title={STATUS_INFO[s].name} style={{ background: STATUS_INFO[s].color }} />)}
        </span>
      )}
    </div>
  )
}

function playFx(s, f, overlay) {
  if (f.kind === 'pop') {
    const view = s.units[f.unit]
    if (!view || !overlay) return
    const el = document.createElement('div')
    el.className = `pop ${f.big ? 'big' : ''}`
    el.textContent = f.text
    el.style.color = f.color
    const jitter = (Math.random() - 0.5) * 30
    const place = () => {
      const p = view.screen
      if (p) el.style.transform = `translate(${p.x + jitter}px, ${p.y - 6}px) translate(-50%, -100%)`
    }
    place()
    overlay.appendChild(el)
    const timer = setInterval(place, 50)
    setTimeout(() => {
      clearInterval(timer)
      el.remove()
    }, 1300)
    if (/^\d/.test(f.text)) view.hurtT = s.clockT || 0
    return
  }
  if (f.kind === 'lunge') {
    const view = s.units[f.unit]
    if (!view) return
    const a = toWorld(f.from.q, f.from.r)
    const b = toWorld(f.to.q, f.to.r)
    const d = Math.hypot(b.x - a.x, b.z - a.z) || 1
    view.facing = Math.atan2(b.x - a.x, b.z - a.z)
    let start = null
    s.anims.push((t) => {
      if (start === null) {
        start = t
        view.lunge = { dx: (b.x - a.x) / d, dz: (b.z - a.z) / d, t0: t }
      }
      return false
    })
    return
  }
  if (f.kind === 'bolt') {
    const view = s.units[f.unit]
    const a = toWorld(f.from.q, f.from.r)
    const b = toWorld(f.to.q, f.to.r)
    if (view) view.facing = Math.atan2(b.x - a.x, b.z - a.z)
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: f.color }))
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), new THREE.MeshBasicMaterial({ color: f.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }))
    orb.add(glow)
    s.effects.add(orb)
    let start = null
    const dur = Math.max(0.2, Math.hypot(b.x - a.x, b.z - a.z) * 0.06)
    s.anims.push((t) => {
      if (start === null) start = t
      const k = Math.min(1, (t - start) / dur)
      orb.position.set(a.x + (b.x - a.x) * k, 0.7 + Math.sin(k * Math.PI) * 0.6, a.z + (b.z - a.z) * k)
      if (k >= 1) {
        s.effects.remove(orb)
        disposeTree(orb)
        return false
      }
    })
    return
  }
  if (f.kind === 'burst') {
    const c = toWorld(f.at.q, f.at.r)
    const size = 0.9 + f.radius * 1.6
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 32), new THREE.MeshBasicMaterial({ color: f.color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }))
    ring.rotation.x = -Math.PI / 2
    ring.position.set(c.x, 0.1, c.z)
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: f.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }))
    dome.position.set(c.x, 0, c.z)
    s.effects.add(ring)
    s.effects.add(dome)
    let start = null
    s.anims.push((t) => {
      if (start === null) start = t
      const k = Math.min(1, (t - start) / 0.6)
      ring.scale.setScalar(0.2 + k * size)
      dome.scale.set(0.2 + k * size, (0.2 + k * size) * 0.6, 0.2 + k * size)
      ring.material.opacity = 0.9 * (1 - k)
      dome.material.opacity = 0.35 * (1 - k)
      if (k >= 1) {
        s.effects.remove(ring)
        s.effects.remove(dome)
        disposeTree(ring)
        disposeTree(dome)
        return false
      }
    })
  }
}
