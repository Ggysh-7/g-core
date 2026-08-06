import { useRef, useLayoutEffect, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import gsap from 'gsap'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { MATERIAL_PRESETS, type MaterialMode } from './materials/types'
import { playEntrance } from '../../animations'
import type { ScenePhase } from '../../scenes/types'

const G_SVG_URL = new URL('../../assets/logo/g.svg', import.meta.url).href

const INITIAL_OFFSET_Y = -0.6
const INITIAL_OFFSET_Z = -1.8
const SVG_SCALE = 0.03

export interface GCoreProps {
  extrudeDepth?: number
  materialMode?: MaterialMode
  materialProps?: Partial<THREE.MeshPhysicalMaterialParameters>
  animationEnabled?: boolean
  phase?: ScenePhase
}

export function GCore({
  extrudeDepth = 0.6,
  materialMode = 'glass',
  materialProps = {},
  animationEnabled = true,
  phase = 'active',
}: GCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const cleanupRef = useRef<(() => void) | null>(null)
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null)

  const svgData = useLoader(SVGLoader, G_SVG_URL)
  const geometry = useMemo(() => {
    const shapes: THREE.Shape[] = []
    for (const path of svgData.paths) {
      shapes.push(...path.toShapes())
    }

    if (shapes.length === 0) {
      const fallbackShapes: THREE.Shape[] = []
      for (const path of svgData.paths) {
        for (const subPath of path.subPaths) {
          fallbackShapes.push(new THREE.Shape(subPath.getPoints()))
        }
      }
      shapes.push(...fallbackShapes)
    }

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: extrudeDepth,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.05,
      bevelSegments: 8,
      curveSegments: 32,
    }

    const geom = new THREE.ExtrudeGeometry(shapes, extrudeSettings)
    geom.center()
    geom.scale(SVG_SCALE, SVG_SCALE, SVG_SCALE)
    geom.computeVertexNormals()
    return geom
  }, [svgData, extrudeDepth])

  const preset = MATERIAL_PRESETS[materialMode]

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !mesh.material) return

    const material = mesh.material as THREE.MeshPhysicalMaterial
    const baseColor = new THREE.Color(preset.color)

    material.color.copy(baseColor)
    if (preset.metalness !== undefined) material.metalness = preset.metalness
    if (preset.roughness !== undefined) material.roughness = preset.roughness
    if (preset.envMapIntensity !== undefined) material.envMapIntensity = preset.envMapIntensity
    material.clearcoat = preset.clearcoat ?? 0
    material.clearcoatRoughness = preset.clearcoatRoughness ?? 0
    material.ior = preset.ior ?? 1.5
    material.reflectivity = preset.reflectivity ?? 0.5

    if ('transmission' in preset) material.transmission = preset.transmission as number
    if ('thickness' in preset) material.thickness = preset.thickness as number

    if (preset.iridescence !== undefined) {
      material.iridescence = preset.iridescence
      material.iridescenceIOR = preset.iridescenceIOR ?? 1.5
      if (preset.iridescenceThicknessRange) {
        material.iridescenceThicknessRange = preset.iridescenceThicknessRange
      }
    }

    if (preset.specularIntensity !== undefined) {
      material.specularIntensity = preset.specularIntensity
    }
    if (preset.specularColor) {
      material.specularColor.set(preset.specularColor)
    }

    Object.entries(materialProps).forEach(([key, value]) => {
      if (value === undefined) return
      const materialKey = key as keyof THREE.MeshPhysicalMaterialParameters
      const prop = material[materialKey]
      if (prop instanceof THREE.Color) {
        prop.set(value as string | number)
      } else {
        ;(material as unknown as Record<string, unknown>)[materialKey] = value
      }
    })
  }, [preset, materialProps])

  useEffect(() => {
    if (!animationEnabled || !groupRef.current) return

    const group = groupRef.current
    cleanupRef.current?.()
    exitTimelineRef.current?.kill()

    group.scale.set(0, 0, 0)
    group.position.set(0, INITIAL_OFFSET_Y, INITIAL_OFFSET_Z)
    group.rotation.set(0, 0, 0)
    group.updateMatrixWorld(true)
    console.log('[GCore] scheduling entrance', {
      animationEnabled,
      scale: group.scale.toArray(),
      position: group.position.toArray(),
    })

    const timer = setTimeout(() => {
      cleanupRef.current = playEntrance(group, () => {
        console.log('[GCore] entrance finished', group.scale.toArray(), group.position.toArray(), group.rotation.toArray())
      })
    }, 300)

    const monitor = setTimeout(() => {
      console.log('[GCore] post-animation check', {
        scale: group.scale.toArray(),
        position: group.position.toArray(),
        rotation: group.rotation.toArray(),
      })
    }, 2200)

    return () => {
      clearTimeout(timer)
      clearTimeout(monitor)
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [animationEnabled])

  useEffect(() => {
    if (phase !== 'exiting' || !groupRef.current) return

    const group = groupRef.current
    cleanupRef.current?.()
    exitTimelineRef.current?.kill()

    const material = meshRef.current?.material as THREE.MeshPhysicalMaterial | null
    if (material) {
      material.transparent = true
    }

    const tl = gsap.timeline()
      .to(group.scale, {
        x: 0.14,
        y: 0.14,
        z: 0.14,
        duration: 0.75,
        ease: 'power2.in',
      }, 0)
      .to(group.position, {
        x: 0,
        y: INITIAL_OFFSET_Y - 0.7,
        z: INITIAL_OFFSET_Z - 1.4,
        duration: 0.85,
        ease: 'power2.in',
      }, 0)
      .to(group.rotation, {
        x: 0.25,
        y: Math.PI * 0.32,
        z: 0.08,
        duration: 0.85,
        ease: 'power2.in',
      }, 0)

    if (material) {
      tl.to(material, {
        opacity: 0,
        duration: 0.7,
        ease: 'power1.in',
      }, 0)
    }

    exitTimelineRef.current = tl

    return () => {
      tl.kill()
      exitTimelineRef.current = null
    }
  }, [phase])

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        geometry={geometry}
        material={new THREE.MeshPhysicalMaterial({
          color: preset.color,
          metalness: preset.metalness,
          roughness: preset.roughness,
          envMapIntensity: preset.envMapIntensity,
          transmission: preset.transmission ?? 0.9,
          thickness: preset.thickness ?? 1.6,
          clearcoat: preset.clearcoat ?? 0.95,
          clearcoatRoughness: preset.clearcoatRoughness ?? 0.02,
          ior: preset.ior ?? 1.55,
          reflectivity: preset.reflectivity ?? 0.6,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide,
        })}
      />
    </group>
  )
}

export default GCore
