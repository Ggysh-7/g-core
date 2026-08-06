import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import gsap from 'gsap'
import type { ScenePhase } from '../../scenes/types'

const G_SVG_URL = new URL('../../assets/logo/g.svg', import.meta.url).href
const SVG_SCALE = 0.03
const PARTICLE_SAMPLE_STEP = 6
const PARTICLE_BASE_RADIUS = 0.18

function createParticleTexture(): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(180,220,255,0.85)')
  gradient.addColorStop(1, 'rgba(180,220,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

export function GCoreParticles({ phase = 'active' }: { phase?: ScenePhase }) {
  const svgData = useLoader(SVGLoader, G_SVG_URL)
  const pointsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.PointsMaterial>(null!)
  const texture = useMemo(() => createParticleTexture(), [])
  const entranceTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null)

  const { basePositions, directions, positions } = useMemo(() => {
    const shapes: THREE.Shape[] = []
    for (const path of svgData.paths) {
      shapes.push(...path.toShapes())
    }

    if (shapes.length === 0) {
      for (const path of svgData.paths) {
        for (const subPath of path.subPaths) {
          shapes.push(new THREE.Shape(subPath.getPoints()))
        }
      }
    }

    const geom = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.6,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.04,
      bevelSegments: 8,
      curveSegments: 32,
    })
    geom.center()
    geom.scale(SVG_SCALE, SVG_SCALE, SVG_SCALE)

    const src = geom.getAttribute('position') as THREE.BufferAttribute
    const base: number[] = []
    for (let i = 0; i < src.count; i += PARTICLE_SAMPLE_STEP) {
      base.push(src.getX(i), src.getY(i), src.getZ(i))
    }

    const count = base.length / 3
    const positionsArray = new Float32Array(base)
    const directionsArray = new Float32Array(base.length)
    for (let i = 0; i < count; i += 1) {
      const x = positionsArray[i * 3]
      const y = positionsArray[i * 3 + 1]
      const z = positionsArray[i * 3 + 2]
      const dir = new THREE.Vector3(x, y, z)
      if (dir.lengthSq() < 0.0001) {
        dir.set(0, 0, 1)
      } else {
        dir.normalize()
      }
      directionsArray[i * 3] = dir.x * (0.7 + Math.random() * 0.3)
      directionsArray[i * 3 + 1] = dir.y * (0.7 + Math.random() * 0.3)
      directionsArray[i * 3 + 2] = dir.z * (0.7 + Math.random() * 0.3)
    }

    return {
      basePositions: new Float32Array(positionsArray),
      directions: directionsArray,
      positions: positionsArray,
    }
  }, [svgData])

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [positions])

  useEffect(() => {
    const material = materialRef.current
    const geom = geometry
    if (!material || !geom) return

    const updatePositions = (radius: number) => {
      const attr = geom.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < basePositions.length / 3; i += 1) {
        attr.setXYZ(
          i,
          basePositions[i * 3] + directions[i * 3] * radius,
          basePositions[i * 3 + 1] + directions[i * 3 + 1] * radius,
          basePositions[i * 3 + 2] + directions[i * 3 + 2] * radius,
        )
      }
      attr.needsUpdate = true
    }

    const particleState = {
      radius: PARTICLE_BASE_RADIUS,
      opacity: 0,
      size: 0.08,
    }

    const tl = gsap.timeline({ delay: 1.3 })
      .to(particleState, {
        opacity: 1,
        size: 0.18,
        duration: 0.45,
        ease: 'power2.out',
        onUpdate: () => {
          material.opacity = particleState.opacity
          material.size = particleState.size
        },
      })
      .to(particleState, {
        radius: 1.05,
        duration: 1.0,
        ease: 'power2.out',
        onUpdate: () => updatePositions(particleState.radius),
      })
      .to(particleState, {
        radius: 0.28,
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => updatePositions(particleState.radius),
      }, '+=0.08')
      .to(particleState, {
        opacity: 0,
        duration: 0.55,
        ease: 'power1.in',
        onUpdate: () => {
          material.opacity = particleState.opacity
        },
      }, '-=0.3')

    entranceTimelineRef.current = tl

    return () => {
      tl.kill()
      entranceTimelineRef.current = null
    }
  }, [basePositions, directions, geometry])

  useEffect(() => {
    if (phase !== 'exiting') return
    const material = materialRef.current
    const geom = geometry
    if (!material || !geom) return

    entranceTimelineRef.current?.kill()
    exitTimelineRef.current?.kill()

    const escapeState = {
      radius: 0.28,
      opacity: material.opacity,
      size: material.size,
    }

    const updatePositions = (radius: number) => {
      const attr = geom.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < basePositions.length / 3; i += 1) {
        attr.setXYZ(
          i,
          basePositions[i * 3] + directions[i * 3] * radius,
          basePositions[i * 3 + 1] + directions[i * 3 + 1] * radius,
          basePositions[i * 3 + 2] + directions[i * 3 + 2] * radius,
        )
      }
      attr.needsUpdate = true
    }

    const tl = gsap.timeline()
      .to(escapeState, {
        radius: 1.8,
        size: 0.08,
        opacity: 0,
        duration: 1.0,
        ease: 'power2.in',
        onUpdate: () => {
          updatePositions(escapeState.radius)
          material.opacity = escapeState.opacity
          material.size = escapeState.size
        },
      })

    exitTimelineRef.current = tl

    return () => {
      tl.kill()
      exitTimelineRef.current = null
    }
  }, [phase, basePositions, directions, geometry])

  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={materialRef}
        map={texture}
        color="#85C5FF"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  )
}

export default GCoreParticles
