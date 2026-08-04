import { useRef, useLayoutEffect, useEffect } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { MATERIAL_PRESETS, type MaterialMode } from './materials/types'
import { playEntrance, killEntrance } from '../../animations'

const G_SVG_URL = new URL('../../assets/logo/g.svg', import.meta.url).href

const INITIAL_OFFSET_Y = -0.6
const INITIAL_OFFSET_Z = -1.8

export interface GCoreProps {
  extrudeDepth?: number
  materialMode?: MaterialMode
  materialProps?: Partial<THREE.MeshPhysicalMaterialParameters>
  animationEnabled?: boolean
}

export function GCore({
  extrudeDepth = 0.6,
  materialMode = 'glass',
  materialProps = {},
  animationEnabled = true,
}: GCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)

  const geometry = useLoader<
    typeof SVGLoader,
    THREE.ExtrudeGeometry
  >(
    SVGLoader,
    G_SVG_URL,
    async (loader) => {
      const data = await loader.loadAsync(G_SVG_URL)
      const parsed = data as {
        paths: Array<{ subPaths: Array<{ getPoints: () => THREE.Vector2[] }> }>
      }

      const shapes: THREE.Shape[] = []
      for (const path of parsed.paths) {
        for (const subPath of path.subPaths) {
          const points = subPath.getPoints()
          const shape = new THREE.Shape(points)
          shapes.push(shape)
        }
      }

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: extrudeDepth,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.04,
        bevelSegments: 4,
      }

      return new THREE.ExtrudeGeometry(shapes, extrudeSettings)
    }
  )

  const preset = MATERIAL_PRESETS[materialMode]

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !mesh.material) return

    const material = mesh.material as THREE.MeshPhysicalMaterial
    const baseColor = new THREE.Color(preset.color)

    material.color.copy(baseColor)
    material.metalness = preset.metalness
    material.roughness = preset.roughness
    material.envMapIntensity = preset.envMapIntensity
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
      } else if (typeof prop === 'number' || typeof value === 'number') {
        (material as Record<string, unknown>)[materialKey] = value
      }
    })
  }, [preset, materialProps])

  useEffect(() => {
    if (!animationEnabled || !groupRef.current) return

    const group = groupRef.current
    // Set initial hidden state
    group.scale.set(0, 0, 0)
    group.position.set(0, INITIAL_OFFSET_Y, INITIAL_OFFSET_Z)
    // Force r3f to render the initial state
    group.updateMatrixWorld(true)

    // Trigger entrance animation after a brief delay
    const timer = setTimeout(() => {
      playEntrance(group, () => {})
    }, 300)

    return () => {
      clearTimeout(timer)
      killEntrance()
    }
  }, [animationEnabled])

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
        })}
      />
    </group>
  )
}

export default GCore
