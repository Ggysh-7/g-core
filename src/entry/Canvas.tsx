import { useEffect, type ReactElement } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useScene } from '../hooks/useScene'
import { PostProcessing } from '../effects'
import { Scene01_Identity } from '../scenes/Scene01_Identity'
import { Scene02_Archive } from '../scenes/Scene02_Archive'
import { Scene03_TechMatrix } from '../scenes/Scene03_TechMatrix'
import { Scene04_FinalMessage } from '../scenes/Scene04_FinalMessage'
import type { ScenePhase } from '../scenes/types'

type SceneComponentType = (props: { phase?: ScenePhase }) => ReactElement

const SCENE_COMPONENTS: SceneComponentType[] = [
  Scene01_Identity,
  Scene02_Archive,
  Scene03_TechMatrix,
  Scene04_FinalMessage,
]

export default function R3FCanvas() {
  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.8,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <SceneSelector />

      <Environment preset="studio" background={false} blur={0.6} />

      <directionalLight
        position={[5, 6, 4]}
        intensity={1.2}
        color="#FFF5E6"
        castShadow={false}
      />

      <directionalLight
        position={[-4, 3, -5]}
        intensity={0.8}
        color="#B8D4FF"
      />

      <pointLight
        position={[3, -2, 3]}
        intensity={0.3}
        color="#FFE8CC"
      />

      <PostProcessing
        bloomStrength={0.35}
        bloomRadius={0.4}
        bloomThreshold={0.15}
        vignetteDarkness={0.5}
        vignetteOffset={1.0}
      />
    </Canvas>
  )
}

function SceneSelector() {
  const { currentScene, activeScene, isTransitioning, transitionProgress } = useScene()
  const CurrentSceneComponent = SCENE_COMPONENTS[currentScene]
  const NextSceneComponent = SCENE_COMPONENTS[activeScene]

  console.log('[SceneSelector]', { currentScene, activeScene, isTransitioning, transitionProgress })

  return (
    <group>
      {isTransitioning && currentScene !== activeScene ? (
        <>
          <CurrentSceneComponent phase="exiting" />
          <NextSceneComponent phase="entering" />
          <SceneTransitionOverlay progress={transitionProgress} />
        </>
      ) : (
        <CurrentSceneComponent phase="active" />
      )}
      <SceneInputHandler />
    </group>
  )
}

function SceneInputHandler() {
  const { currentScene, goToScene, isTransitioning } = useScene()

  useEffect(() => {
    console.log('[SceneInputHandler] mounted', { currentScene, isTransitioning })

    const handleWheel = (event: WheelEvent) => {
      console.log('[SceneInputHandler] wheel', { deltaY: event.deltaY, currentScene, isTransitioning })
      if (isTransitioning) return
      if (event.deltaY > 0 && currentScene < 3) {
        goToScene((currentScene + 1) as any)
      } else if (event.deltaY < 0 && currentScene > 0) {
        goToScene((currentScene - 1) as any)
      }
    }

    const handleClick = () => {
      console.log('[SceneInputHandler] click', { currentScene, isTransitioning })
      if (isTransitioning) return
      if (currentScene < 3) {
        goToScene((currentScene + 1) as any)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('click', handleClick)
    }
  }, [currentScene, goToScene, isTransitioning])

  return null
}

function SceneTransitionOverlay({ progress }: { progress: number }) {
  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[12, 6]} />
      <meshBasicMaterial color={`rgba(0,0,0,${0.35 * progress})`} transparent />
    </mesh>
  )
}
