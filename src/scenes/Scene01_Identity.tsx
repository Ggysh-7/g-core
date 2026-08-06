import { Suspense } from 'react'
import { GCore, GCoreParticles, GOutline } from '../objects/GCore'
import type { ScenePhase } from './types'

export function Scene01_Identity({ phase = 'active' }: { phase?: ScenePhase }) {
  return (
    <group>
      {/* G Core — entrance animation handled internally */}
      <Suspense fallback={null}>
        <GCore animationEnabled={true} phase={phase} />
        <GCoreParticles phase={phase} />
        {/* G Outline — light-trace glow edge effect */}
        <GOutline animationEnabled={true} phase={phase} />
      </Suspense>
      {/* Floor grid */}
      <gridHelper args={[40, 40, 0x1A1F26, 0x0D1114]} position={[0, -3, 0]} />
    </group>
  )
}
