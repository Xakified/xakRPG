import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildHero } from '../three/buildHero'

function groundTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(0,0,0,0.55)')
  grad.addColorStop(0.6, 'rgba(0,0,0,0.25)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function disposeTree(object) {
  object.traverse((o) => {
    o.geometry?.dispose()
    if (o.material) [].concat(o.material).forEach((m) => m.dispose())
  })
}

// A rotatable 3D view of a hero. `spec` is what buildHero() takes.
export default function HeroViewer({ spec, className, interactive = true, autoRotate = false, zoom = 1 }) {
  const holder = useRef(null)
  const stage = useRef(null)
  const key = useMemo(() => JSON.stringify(spec), [spec])

  useEffect(() => {
    const el = holder.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    // A soft studio environment so metal armor and weapons have something to reflect.
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.55
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50)
    scene.add(new THREE.HemisphereLight('#ffe8d0', '#3a2a50', 1.1))
    const key = new THREE.DirectionalLight('#fff2dc', 2.2)
    key.position.set(2, 4, 3)
    scene.add(key)
    const rim = new THREE.DirectionalLight('#8ab0ff', 1.8)
    rim.position.set(-3, 2, -3)
    scene.add(rim)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: groundTexture(), transparent: true, depthWrite: false }))
    shadow.rotation.x = -Math.PI / 2
    scene.add(shadow)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.minDistance = 1.2
    controls.maxDistance = 7
    controls.maxPolarAngle = Math.PI * 0.55
    controls.enabled = interactive
    controls.enableZoom = interactive
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 1.5

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(1, height)
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()

    // Render at up to 30fps, and not at all while scrolled out of view.
    let visible = true
    const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    seen.observe(el)
    const clock = new THREE.Clock()
    let frame
    let last = 0
    const loop = (now) => {
      frame = requestAnimationFrame(loop)
      if (!visible || now - last < 33) return
      last = now
      stage.current?.hero?.update(clock.getElapsedTime())
      controls.update()
      renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(loop)

    stage.current = { scene, camera, controls, framed: false, zoom }
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      seen.disconnect()
      controls.dispose()
      if (stage.current.hero) disposeTree(stage.current.hero.root)
      disposeTree(scene)
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      stage.current = null
    }
  }, [interactive, autoRotate, zoom])

  useEffect(() => {
    const s = stage.current
    if (!s) return
    if (s.hero) {
      s.scene.remove(s.hero.root)
      disposeTree(s.hero.root)
    }
    const hero = buildHero(JSON.parse(key))
    s.scene.add(hero.root)
    s.hero = hero
    // Frame the hero, keeping the user's orbit angle after the first time.
    const h = Math.max(hero.height, 1.1)
    s.controls.target.set(0, s.zoom > 1.5 ? h * 0.82 : h * 0.52, 0)
    if (!s.framed || Math.abs((s.lastHeight || h) - h) > 0.2) {
      const dist = (h * 1.9 + 0.6) / s.zoom
      s.camera.position.set(dist * 0.35, h * 0.62, dist)
      s.framed = true
    }
    s.lastHeight = h
    s.controls.update()
  }, [key, interactive, autoRotate, zoom])

  return <div ref={holder} className={`hero-viewer ${className || ''}`} />
}
