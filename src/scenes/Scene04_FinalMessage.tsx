import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { ScenePhase } from './types'

export function Scene04_FinalMessage({ phase = 'active' }: { phase?: ScenePhase }) {
  const ringRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const entranceRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    if (phase === 'entering') {
      group.scale.set(0.4, 0.4, 0.4)
      group.position.set(0, -1.2, 0)
      const tl = gsap.timeline()
      tl.to(group.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'expo.out' }, 0)
      tl.to(group.position, { y: 0, duration: 1.1, ease: 'power3.out' }, 0)
      entranceRef.current = tl
      return () => {
        tl.kill()
      }
    }

    if (phase === 'active') {
      group.scale.set(1, 1, 1)
      group.position.set(0, 0, 0)
    }
  }, [phase])

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.1
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.04
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight position={[2.2, 3.2, 1.8]} intensity={0.95} color="#C8D9FF" />
      <pointLight position={[-2.4, -1.5, -2]} intensity={0.28} color="#7D8EFF" />

      <mesh position={[0, -0.12, -1.5]} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={[6.2, 4.2]} />
        <meshStandardMaterial color="#09101A" roughness={0.9} metalness={0.03} transparent opacity={0.9} />
      </mesh>

      <mesh ref={ringRef} rotation={[0, 0, 0]}> 
        <ringGeometry args={[1.25, 1.75, 96]} />
        <meshStandardMaterial color="#172030" metalness={0.6} roughness={0.28} emissive="#587AFF" emissiveIntensity={0.2} side={THREE.DoubleSide} transparent opacity={0.96} />
      </mesh>

      <Text
        fontSize={0.22}
        maxWidth={3.6}
        lineHeight={1.12}
        letterSpacing={0.04}
        color="#E6F0FF"
        position={[0, 0.18, 0]}
        anchorX="center"
        anchorY="middle"
      >
        I build digital experiences
        {'\n'}
        where technology meets imagination.
      </Text>
      <Text
        fontSize={0.12}
        maxWidth={4}
        lineHeight={1.4}
        letterSpacing={0.02}
        color="#A7B8FF"
        position={[0, -0.54, 0]}
        anchorX="center"
        anchorY="middle"
      >
        End the journey in a calm, focused space.
      </Text>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
        <planeGeometry args={[4.8, 0.14]} />
        <meshBasicMaterial color="rgba(91, 140, 255, 0.2)" transparent />
      </mesh>
    </group>
  )
}
