import * as THREE from 'three'
import gsap from 'gsap'

// ─── Constants ─────────────────────────────────────────────────────
const INITIAL_OFFSET_Y = -0.6
const INITIAL_OFFSET_Z = -1.8

// ─── GSAP ↔ Three.js proxy bridge ─────────────────────────────────

function createProxy(target: THREE.Object3D): {
  _scaleX: number
  _scaleY: number
  _scaleZ: number
  _posX: number
  _posY: number
  _posZ: number
  _rotationY: number
  _rotationX: number
} {
  const s = target.scale
  const p = target.position
  const r = target.rotation
  return {
    _scaleX: s.x,
    _scaleY: s.y,
    _scaleZ: s.z,
    _posX: p.x,
    _posY: p.y,
    _posZ: p.z,
    _rotationY: r.y,
    _rotationX: r.x,
  }
}

function cloneProxy(proxy: ReturnType<typeof createProxy>) {
  return { ...proxy }
}

function syncToJS(proxy: ReturnType<typeof createProxy>, target: THREE.Object3D): void {
  target.scale.set(proxy._scaleX, proxy._scaleY, proxy._scaleZ)
  target.position.set(proxy._posX, proxy._posY, proxy._posZ)
  target.rotation.y = proxy._rotationY
  target.rotation.x = proxy._rotationX
}

// ─── Public API ────────────────────────────────────────────────────

/**
 * Start the entrance animation on a target.
 * Returns a cleanup function — call it to kill the timeline.
 * Each call is fully independent; no shared global state.
 */
export function playEntrance(target: THREE.Object3D, onComplete?: () => void): () => void {
  if (!target) return () => {}

  const proxy = createProxy(target)
  const tl = gsap.timeline({
    onStart: () => {
      console.log('[gCoreEntrance] playEntrance start', {
        uuid: target.uuid,
        scale: target.scale.toArray(),
        position: target.position.toArray(),
      })
    },
    onComplete: () => {
      console.log('[gCoreEntrance] playEntrance complete', {
        uuid: target.uuid,
        scale: target.scale.toArray(),
        position: target.position.toArray(),
      })
      onComplete?.()
    },
  })

  // Single state object shared across the timeline
  const state = cloneProxy(proxy)
  let hasLoggedPhase1 = false
  tl.to(state, {
    _scaleX: 1,
    _scaleY: 1,
    _scaleZ: 1,
    _posX: 0,
    _posY: 0,
    _posZ: 0,
    duration: 1.2,
    ease: 'power3.out',
    onUpdate: () => {
      if (!hasLoggedPhase1) {
        hasLoggedPhase1 = true
        console.log('[gCoreEntrance] phase1 onUpdate', target.scale.toArray(), target.position.toArray())
      }
      syncToJS(state, target)
    },
  })

  // Phase 2: small settle rotation
  tl.to(state, {
    _rotationY: 2 * (Math.PI / 180),
    _rotationX: -1 * (Math.PI / 180),
    duration: 1.6,
    ease: 'power2.out',
    onUpdate: () => syncToJS(state, target),
  }, '-=0.4')

  // Phase 3: subtle breathing loop around center
  tl.to(state, {
    _rotationY: -1.4 * (Math.PI / 180),
    _rotationX: 0.8 * (Math.PI / 180),
    duration: 3.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    onUpdate: () => syncToJS(state, target),
  }, '-=1.2')

  return () => tl.kill()
}

/**
 * Reverse entrance: shrink back to hidden state.
 * Returns a cleanup function.
 */
export function reverseEntrance(target: THREE.Object3D, onComplete?: () => void): () => void {
  if (!target) return () => {}

  const proxy = createProxy(target)
  const tl = gsap.timeline({
    onComplete: () => {
      target.scale.set(0, 0, 0)
      target.position.set(0, INITIAL_OFFSET_Y, INITIAL_OFFSET_Z)
      target.rotation.set(0, 0, 0)
      onComplete?.()
    },
  })

  const p = { ...proxy }
  tl.to(p, {
    _scaleX: 0,
    _scaleY: 0,
    _scaleZ: 0,
    _posX: 0,
    _posY: INITIAL_OFFSET_Y,
    _posZ: INITIAL_OFFSET_Z,
    _rotationY: 0,
    _rotationX: 0,
    duration: 1.0,
    ease: 'power2.in',
    onUpdate: () => syncToJS(p, target),
  })

  return () => tl.kill()
}
