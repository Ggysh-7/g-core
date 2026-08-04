import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Scene01_Identity } from '../scenes/Scene01_Identity'
import { SceneRouter } from '../hooks/useScene'
import { PostProcessing } from '../effects'

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
      <SceneRouter>
        <Scene01_Identity />
      </SceneRouter>

      {/* Environment — studio preset for controlled reflections */}
      <Environment preset="studio" background={false} blur={0.6} />

      {/* Key Light — front-right-top, warm white */}
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.2}
        color="#FFF5E6"
        castShadow={false}
      />

      {/* Rim Light — back-left, cool blue for edge definition */}
      <directionalLight
        position={[-4, 3, -5]}
        intensity={0.8}
        color="#B8D4FF"
      />

      {/* Fill Light — soft, from opposite side of key */}
      <pointLight
        position={[3, -2, 3]}
        intensity={0.3}
        color="#FFE8CC"
      />

      {/* Cinematic Post-Processing */}
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
