import * as THREE from 'three'

declare module 'three/examples/jsm/loaders/SVGLoader' {
  export class SVGLoader extends THREE.Loader {
    constructor(manager?: THREE.LoadingManager)
    parse(svgText: string | Document | Element): SVGLoaderResult
    loadAsync(url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void): Promise<SVGLoaderResult>
  }

  export interface SVGLoaderResult {
    paths: Array<{
      subPaths: Array<{
        getPoints(): THREE.Vector2[]
      }>
    }>
  }
}

declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
  import * as THREE from 'three'
  export class EffectComposer {
    constructor(renderer: THREE.WebGLRenderer)
    addPass(pass: any): void
    setSize(width: number, height: number): void
    render(deltaTime?: number): void
    dispose(): void
  }
}

declare module 'three/examples/jsm/postprocessing/RenderPass.js' {
  import * as THREE from 'three'
  export class RenderPass {
    constructor(scene: THREE.Scene, camera: THREE.Camera)
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass.js' {
  import * as THREE from 'three'
  export class UnrealBloomPass {
    constructor(resolution: THREE.Vector2, strength?: number, radius?: number, threshold?: number)
    threshold: number
    strength: number
    radius: number
    renderToScreen: boolean
    setSize(width: number, height: number): void
  }
}

declare module 'three/examples/jsm/postprocessing/ShaderPass.js' {
  import { Shader } from 'three'
  export class ShaderPass {
    constructor(shader: Shader)
    uniforms: Record<string, { value: any }>
    renderToScreen: boolean
  }
}
