import type { ScenePhase } from './types'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { Text } from '@react-three/drei'

const PROJECT_COUNT = 8
const ITEM_OFFSET = 1.35
const PARTICLE_COUNT = 220

interface ArchiveItem {
  label: string
  target: THREE.Vector3
  scale: number
  rotationSpeed: number
}

export function Scene02_Archive({ phase = 'active' }: { phase?: ScenePhase }) {
  const { camera } = useThree()
  const items = useMemo<ArchiveItem[]>(() => {
    return Array.from({ length: PROJECT_COUNT }, (_, index) => {
      const angle = (index / PROJECT_COUNT) * Math.PI * 2
      return {
        label: `PROJECT ${index + 1}`,
        target: new THREE.Vector3(
          Math.cos(angle) * ITEM_OFFSET * 2,
          (index - PROJECT_COUNT / 2) * 0.42,
          Math.sin(angle) * ITEM_OFFSET * 2 - 2.2,
        ),
        scale: 0.72 + (index % 2) * 0.16,
        rotationSpeed: 0.12 + index * 0.02,
      }
    })
  }, [])

  const particleGeometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const radius = 2.8 + Math.random() * 3.6
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 6.4
      const z = -2.5 - Math.random() * 4.2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [])

  const groupRef = useRef<THREE.Group>(null)
  const particleRef = useRef<THREE.Points>(null)
  const itemRefs = useRef<Array<THREE.Group | null>>([])
  const itemMaterials = useRef<Array<THREE.MeshStandardMaterial | null>>([])
  const entranceTimeline = useRef<gsap.core.Timeline | null>(null)
  const exitTimeline = useRef<gsap.core.Timeline | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const focusIndex = useRef(0)

  useEffect(() => {
    if (phase === 'entering') {
      entranceTimeline.current?.kill()
      const tl = gsap.timeline()

      if (camera) {
        camera.position.set(0, 1.6, 6.6)
        camera.lookAt(0, 0, 0)
        tl.to(camera.position, {
          y: 0.08,
          z: 5.8,
          duration: 1.4,
          ease: 'power3.out',
        }, 0)
      }

      if (groupRef.current) {
        groupRef.current.position.set(0, 1.2, 0)
        tl.to(groupRef.current.position, {
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
        }, 0)
      }

      items.forEach((item, index) => {
        const itemGroup = itemRefs.current[index]
        const itemMaterial = itemMaterials.current[index]
        if (!itemGroup || !itemMaterial) return

        itemGroup.position.set(item.target.x * 1.8, item.target.y + 1.3, item.target.z + 2.8)
        itemGroup.scale.set(0.14, 0.14, 0.14)
        itemMaterial.opacity = 0

        tl.to(itemGroup.position, {
          x: item.target.x,
          y: item.target.y,
          z: item.target.z,
          duration: 1.0,
          ease: 'expo.out',
        }, index * 0.05)

        tl.to(itemGroup.scale, {
          x: item.scale,
          y: item.scale,
          z: item.scale,
          duration: 1.0,
          ease: 'power2.out',
        }, index * 0.05)

        tl.to(itemMaterial, {
          opacity: 0.92,
          duration: 0.9,
          ease: 'power1.out',
        }, index * 0.05)
      })

      entranceTimeline.current = tl
      return () => {
        tl.kill()
        entranceTimeline.current = null
      }
    }

    if (phase === 'active') {
      if (camera) {
        camera.position.set(0, 0.08, 5.8)
        camera.lookAt(0, 0, 0)
      }

      items.forEach((item, index) => {
        const itemGroup = itemRefs.current[index]
        const itemMaterial = itemMaterials.current[index]
        if (!itemGroup || !itemMaterial) return

        itemGroup.position.set(item.target.x, item.target.y, item.target.z)
        itemGroup.scale.set(item.scale, item.scale, item.scale)
        itemMaterial.opacity = 0.92
      })
    }
  }, [camera, items, phase])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointerRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  useEffect(() => {
    if (phase !== 'exiting') return

    exitTimeline.current?.kill()
    entranceTimeline.current?.kill()

    const tl = gsap.timeline()
    if (camera) {
      tl.to(camera.position, {
        y: 1.2,
        z: 6.3,
        duration: 1.0,
        ease: 'power2.in',
      }, 0)
    }

    if (groupRef.current) {
      tl.to(groupRef.current.position, {
        y: 1.3,
        duration: 1.0,
        ease: 'power2.in',
      }, 0)
    }

    items.forEach((_, index) => {
      const itemGroup = itemRefs.current[index]
      const itemMaterial = itemMaterials.current[index]
      if (!itemGroup || !itemMaterial) return

      tl.to(itemGroup.scale, {
        x: 0.08,
        y: 0.08,
        z: 0.08,
        duration: 0.8,
        ease: 'power2.in',
      }, index * 0.04)

      tl.to(itemMaterial, {
        opacity: 0,
        duration: 0.7,
        ease: 'power1.in',
      }, index * 0.04)
    })

    exitTimeline.current = tl
    return () => {
      tl.kill()
      exitTimeline.current = null
    }
  }, [camera, items, phase])

  useFrame((state, delta) => {
    if (groupRef.current) {
      const pointer = pointerRef.current
      groupRef.current.rotation.y += delta * 0.05
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.15, 0.05)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, pointer.x * 0.08, 0.05)
      if (phase === 'active') {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.32) * 0.04
      }
    }

    let bestDistance = Infinity
    items.forEach((item, index) => {
      const dx = item.target.x - pointerRef.current.x * 1.1
      const dy = item.target.y - pointerRef.current.y * 0.75
      const dz = item.target.z + 1.8
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (distance < bestDistance) {
        bestDistance = distance
        focusIndex.current = index
      }
    })

    items.forEach((item, index) => {
      const itemGroup = itemRefs.current[index]
      const itemMaterial = itemMaterials.current[index]
      if (!itemGroup || !itemMaterial) return

      const targetScale = item.scale * (focusIndex.current === index ? 1.12 : 1)
      itemGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06)

      const targetColor = new THREE.Color(focusIndex.current === index ? '#D8FFFF' : index % 2 === 0 ? '#5B8CFF' : '#7AC6FF')
      itemMaterial.color.lerp(targetColor, 0.05)
    })

    if (particleRef.current) {
      particleRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 4, 4]} intensity={1.2} color="#9ED8FF" />
      <pointLight position={[-2.8, 1.5, -2]} intensity={0.68} color="#A7C7FF" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]}>
        <planeGeometry args={[20, 32]} />
        <meshStandardMaterial color="#070B14" metalness={0.0} roughness={0.98} />
      </mesh>

      <points ref={particleRef} geometry={particleGeometry}>
        <pointsMaterial
          color="#7ABFFF"
          size={0.06}
          transparent
          opacity={0.36}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <group position={[0, -0.4, 0]}>
        {items.map((item, index) => (
          <group
            key={item.label}
            ref={(el) => { itemRefs.current[index] = el }}
            position={[0, 0, 0]}
            scale={[0.16, 0.16, 0.16]}
          >
            <mesh rotation={[0.14, item.rotationSpeed * index, 0]}>
              <boxGeometry args={[0.92 * item.scale, 0.18, 1.24 * item.scale]} />
              <meshStandardMaterial
                ref={(material) => { itemMaterials.current[index] = material }}
                color={index % 2 === 0 ? '#5B8CFF' : '#7AC6FF'}
                metalness={0.72}
                roughness={0.18}
                transparent
                opacity={0}
              />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <planeGeometry args={[0.9 * item.scale, 0.24]} />
              <meshBasicMaterial color="rgba(232,240,255,0.08)" transparent />
            </mesh>
            <Text
              fontSize={0.14}
              position={[0, 0.28, 0]}
              color="#E8F0FF"
              anchorX="center"
              anchorY="middle"
            >
              {item.label}
            </Text>
          </group>
        ))}
      </group>
    </group>
  )
}
