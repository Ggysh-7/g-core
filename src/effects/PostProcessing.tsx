import { useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import VignetteShader from './VignetteShader'

interface PostProcessingProps {
  bloomStrength?: number
  bloomRadius?: number
  bloomThreshold?: number
  vignetteDarkness?: number
  vignetteOffset?: number
}

export function PostProcessing({
  bloomStrength = 0.35,
  bloomRadius = 0.4,
  bloomThreshold = 0.15,
  vignetteDarkness = 0.5,
  vignetteOffset = 1.0,
}: PostProcessingProps = {}) {
  const { gl, scene, camera } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)

  useLayoutEffect(() => {
    if (!gl || !(gl instanceof THREE.WebGLRenderer)) return

    composerRef.current?.dispose()

    const composer = new EffectComposer(gl)

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const w = gl.domElement.clientWidth || 1
    const h = gl.domElement.clientHeight || 1

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    )
    composer.addPass(bloomPass)

    const vignettePass = new ShaderPass(VignetteShader)
    vignettePass.uniforms.darkness.value = vignetteDarkness
    vignettePass.uniforms.offset.value = vignetteOffset
    composer.addPass(vignettePass)

    composerRef.current = composer

    const handleResize = () => {
      const cw = gl.domElement.clientWidth
      const ch = gl.domElement.clientHeight
      if (cw > 0 && ch > 0) composer.setSize(cw, ch)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      composer.dispose()
      composerRef.current = null
    }
  }, [])

  useFrame((_state, _delta) => {
    if (!composerRef.current) return
    composerRef.current.render()
  })

  return null
}

export default PostProcessing
