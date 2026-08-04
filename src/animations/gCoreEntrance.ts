import gsap from 'gsap'

// ─── Animation constants ───────────────────────────────────────────
const INITIAL_OFFSET_Y = -0.6
const INITIAL_OFFSET_Z = -1.8
const SETTLE_DURATION = 2.4
const SETTLE_EASE = 'power2.out'
const REVERSE_EASE = 'power2.in'

// ─── State ─────────────────────────────────────────────────────────
let timeline: gsap.core.Timeline | null = null
let isAnimating = false

// ─── Three.js GSAP bridge ──────────────────────────────────────────

/**
 * Create a proxy object that GSAP can tween, with onUpdate
 * syncing the values back to the Three.js Object3D.
 */
function createJSProxy(
  target: THREE.Object3D
): {
  _scale: { x: number; y: number; z: number }
  _position: { x: number; y: number; z: number }
  _rotationY: number
  _rotationX: number
} {
  const s = target.scale
  const p = target.position
  const r = target.rotation

  return {
    _scale: { x: s.x, y: s.y, z: s.z },
    _position: { x: p.x, y: p.y, z: p.z },
    _rotationY: r.y,
    _rotationX: r.x,
  }
}

/**
 * Sync a GSAP proxy back to the Three.js Object3D.
 */
function syncProxyToJS(
  proxy: {
    _scale: { x: number; y: number; z: number }
    _position: { x: number; y: number; z: number }
    _rotationY: number
    _rotationX: number
  },
  target: THREE.Object3D
): void {
  target.scale.set(proxy._scale.x, proxy._scale.y, proxy._scale.z)
  target.position.set(proxy._position.x, proxy._position.y, proxy._position.z)
  target.rotation.y = proxy._rotationY
  target.rotation.x = proxy._rotationX
}

// ─── Public API ────────────────────────────────────────────────────

/**
 * Trigger the G Core entrance animation.
 * Uses a proxy object to avoid read-only property errors on Three.js Group.
 */
export function playEntrance(
  target: gsap.core.TweenTarget,
  onComplete?: () => void
): void {
  killEntrance()
  isAnimating = true

  const group = target as THREE.Object3D
  if (!group) return

  const proxy = createJSProxy(group)

  timeline = gsap.timeline({
    onStart: () => { isAnimating = true },
    onComplete: () => { isAnimating = false; onComplete?.() },
  })

  // ── Phase 1: Appear (scale 0→1, slide up to origin) ──
  const appearProxy = { ...proxy }
  timeline.to(appearProxy, {
    _scale: { x: 1, y: 1, z: 1 },
    _position: { x: 0, y: 0, z: 0 },
    duration: 1.6,
    ease: 'power3.inOut',
    onUpdate: () => syncProxyToJS(appearProxy, group),
  })

  // ── Phase 2: Settle (subtle rotation overshoot) ──
  const settleProxy = { ...appearProxy }
  timeline.to(settleProxy, {
    _rotationY: 3 * (Math.PI / 180),
    _rotationX: -1.5 * (Math.PI / 180),
    duration: SETTLE_DURATION,
    ease: SETTLE_EASE,
    onUpdate: () => syncProxyToJS(settleProxy, group),
  }, '-=0.3')

  // ── Phase 3: Gentle breathing rotation (loops) ──
  const breatheProxy = { ...settleProxy }
  timeline.to(breatheProxy, {
    _rotationY: -2 * (Math.PI / 180),
    _rotationX: 1 * (Math.PI / 180),
    duration: 3.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    onUpdate: () => syncProxyToJS(breatheProxy, group),
  }, '-=0.8')

  timeline?.play()
}

/**
 * Reverse the entrance: shrink back to initial hidden state.
 */
export function reverseEntrance(
  target: gsap.core.TweenTarget,
  onComplete?: () => void
): void {
  killEntrance()
  isAnimating = true

  const group = target as THREE.Object3D
  if (!group) return

  const proxy = createJSProxy(group)

  timeline = gsap.timeline({
    onComplete: () => { isAnimating = false; onComplete?.() },
  })

  const reverseProxy = { ...proxy }
  timeline.to(reverseProxy, {
    _scale: { x: 0, y: 0, z: 0 },
    _position: { x: 0, y: INITIAL_OFFSET_Y, z: INITIAL_OFFSET_Z },
    _rotationY: 0,
    _rotationX: 0,
    duration: 1.0,
    ease: REVERSE_EASE,
    onUpdate: () => syncProxyToJS(reverseProxy, group),
    onComplete: () => {
      group.scale.set(0, 0, 0)
      group.position.set(0, INITIAL_OFFSET_Y, INITIAL_OFFSET_Z)
      group.rotation.set(0, 0, 0)
    },
  })

  timeline?.play()
}

/**
 * Kill any running entrance timeline and reset flags.
 */
export function killEntrance(): void {
  timeline?.kill()
  timeline = null
  isAnimating = false
}

/**
 * Return the current animation state.
 */
export function isEntranceAnimating(): boolean {
  return isAnimating
}
