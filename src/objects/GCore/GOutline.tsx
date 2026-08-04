import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { playEntrance, killEntrance } from '../../animations'

const ACCENT_COLOR = '#5B8CFF'
const EDGE_WIDTH = 1.5
const OPACITY = 0.85

export interface GOutlineProps {
  scale?: number
  color?: string
  animationEnabled?: boolean
  linewidth?: number
}

export function GOutline({
  scale = 1.0,
  color = ACCENT_COLOR,
  animationEnabled = true,
  linewidth = EDGE_WIDTH,
}: GOutlineProps = {}) {
  const groupRef = useRef<THREE.Group>(null!)

  // Build outline geometry once on mount
  const geometry = useMemo(() => {
    const loader = new SVGLoader()
    const svgResult = loader.parse([
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">',
      '  <path d="M 100,15 A 85,85 0 1,1 15,100 L 55,100 A 45,45 0 1,0 100,55',
      '  L 100,85 L 55,85 L 55,115 L 100,115 A 70,70 0 1,0 100,25 Z"',
      '  fill-rule="evenodd" />',
      '</svg>',
    ].join(''))

    const shapes: THREE.Shape[] = []
    for (const path of svgResult.paths) {
      for (const subPath of path.subPaths) {
        const pts = subPath.getPoints()
        shapes.push(new THREE.Shape(pts))
      }
    }

    const edgeGeom = new THREE.EdgesGeometry(
      new THREE.ExtrudeGeometry(shapes, {
        depth: 0.6,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.04,
        bevelSegments: 4,
      })
    )

    if (scale !== 1.0) edgeGeom.scale(scale, scale, scale)
    return edgeGeom
  }, [])

  useEffect(() => {
    if (!animationEnabled || !groupRef.current) return

    const group = groupRef.current
    group.scale.set(0, 0, 0)
    group.position.set(0, -0.6, -1.8)
    group.updateMatrixWorld(true)

    const timer = setTimeout(() => {
      playEntrance(group, () => {})
    }, 600)

    return () => {
      clearTimeout(timer)
      killEntrance()
    }
  }, [animationEnabled])

  return (
    <group ref={groupRef} renderOrder={-1}>
      <lineSegments geometry={geometry} material={
        new THREE.LineBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: OPACITY,
          linewidth,
          depthWrite: false,
        })
      } />
    </group>
  )
}

export default GOutline
