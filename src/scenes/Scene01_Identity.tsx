import { Suspense } from 'react'
import { GCore, GOutline } from '../objects/GCore'

export function Scene01_Identity() {
  return (
    <group>
      {/* G Core — entrance animation handled internally */}
      <Suspense fallback={null}>
        <GCore animationEnabled={true} />
        {/* G Outline — light-trace glow edge effect */}
        <GOutline animationEnabled={true} />
      </Suspense>
      {/* Floor grid */}
      <gridHelper args={[40, 40, 0x1A1F26, 0x0D1114]} position={[0, -3, 0]} />
    </group>
  )
}
