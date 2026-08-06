import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { ScenePhase } from './types'

const NODES = ['React', 'GSAP', 'Three.js', 'WebGL', 'Remotion', 'AI']

export function Scene03_TechMatrix({ phase = 'active' }: { phase?: ScenePhase }) {
  const nodePositions = useMemo(() => {
    return NODES.map((label, index) => {
      const angle = (index / NODES.length) * Math.PI * 2
      return {
        label,
        position: new THREE.Vector3(Math.cos(angle) * 2.6, Math.sin(angle) * 1.1, Math.sin(angle) * 1.7),
        pulse: 0.9 + (index % 3) * 0.1,
      }
    })
  }, [])

  const groupRef = useRef<THREE.Group>(null)
  const entranceRef = useRef<gsap.core.Timeline | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    if (phase === 'entering') {
      entranceRef.current?.kill()
      group.scale.set(0.35, 0.35, 0.35)
      group.position.set(0, -0.8, 0)
      const tl = gsap.timeline()
      tl.to(group.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'expo.out' }, 0)
      tl.to(group.position, { y: 0, duration: 1.2, ease: 'power3.out' }, 0)
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

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointerRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      const pointer = pointerRef.current
      groupRef.current.rotation.y += delta * 0.08
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.06
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, pointer.x * 0.4, 0.05)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, pointer.y * 0.2, 0.05)
    }
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.22} />
      <pointLight position={[3, 3, 2]} intensity={1.05} color="#A1BFFF" />
      <pointLight position={[-3, -1, -2]} intensity={0.48} color="#98D4FF" />
      <pointLight position={[0, 2, -3]} intensity={0.35} color="#D1E4FF" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <circleGeometry args={[4.6, 64]} />
        <meshStandardMaterial color="#0A1018" metalness={0.1} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      <group>
        {nodePositions.map((source) => (
          <line key={`line-${source.label}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, 0, 0, source.position.x, source.position.y, source.position.z]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#7DAEFF" transparent opacity={0.45} />
          </line>
        ))}
      </group>
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
          <circleGeometry args={[4.8, 128]} />
          <meshStandardMaterial color="#080D16" metalness={0.06} roughness={0.98} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.5, 0.05]}>
          <ringGeometry args={[1.2, 2.9, 120]} />
          <meshBasicMaterial color="rgba(91,140,255,0.16)" transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh scale={[0.4, 0.4, 0.4]}> 
          <torusGeometry args={[0.9, 0.05, 28, 120]} />
          <meshStandardMaterial color="#6EAAFF" metalness={0.8} roughness={0.18} emissive="#4B7EFF" emissiveIntensity={0.15} />
        </mesh>
      </group>

      {nodePositions.map((node) => (
        <group key={node.label} position={node.position}>
          <mesh scale={[node.pulse, node.pulse, node.pulse]}>
            <sphereGeometry args={[0.27, 32, 32]} />
            <meshStandardMaterial
              color="#B7D8FF"
              metalness={0.7}
              roughness={0.16}
              emissive="#5378FF"
              emissiveIntensity={0.18}
            />
          </mesh>
          <Text
            position={[0, 0.42, 0]}
            fontSize={0.18}
            color="#E8F0FF"
            maxWidth={1.2}
            anchorX="center"
            anchorY="middle"
          >
            {node.label}
          </Text>
        </group>
      ))}
    </group>
  )
}
