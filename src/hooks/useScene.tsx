import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SCENE_COUNT } from '../constants/design'

export type SceneIndex = 0 | 1 | 2 | 3

interface SceneContextType {
  currentScene: SceneIndex
  activeScene: SceneIndex
  goToScene: (index: SceneIndex) => void
  isTransitioning: boolean
  transitionProgress: number
}

const SceneContext = createContext<SceneContextType>({
  currentScene: 0,
  activeScene: 0,
  goToScene: () => {},
  isTransitioning: false,
  transitionProgress: 0,
})

export function SceneProvider({ children }: { children: ReactNode }) {
  const [currentScene, setCurrentScene] = useState<SceneIndex>(0)
  const [activeScene, setActiveScene] = useState<SceneIndex>(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const transitionTimer = useRef<number | null>(null)
  const transitionFrame = useRef<number | null>(null)
  const TRANSITION_DURATION = 2800

  const clearTransition = () => {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current)
      transitionTimer.current = null
    }
    if (transitionFrame.current !== null) {
      window.cancelAnimationFrame(transitionFrame.current)
      transitionFrame.current = null
    }
  }

  const goToScene = (index: SceneIndex) => {
    if (index === currentScene || index >= SCENE_COUNT || isTransitioning) {
      console.log('[SceneRouter] goToScene ignored', { index, currentScene, activeScene, isTransitioning })
      return
    }

    console.log('[SceneRouter] begin transition', { from: currentScene, to: index })
    setIsTransitioning(true)
    setActiveScene(index)
    setTransitionProgress(0)

    const startTime = performance.now()
    const step = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(1, elapsed / TRANSITION_DURATION)
      setTransitionProgress(progress)
      if (progress < 1) {
        transitionFrame.current = window.requestAnimationFrame(step)
      }
    }
    transitionFrame.current = window.requestAnimationFrame(step)

    transitionTimer.current = window.setTimeout(() => {
      setCurrentScene(index)
      setIsTransitioning(false)
      setTransitionProgress(0)
      clearTransition()
      console.log('[SceneRouter] finished transition', { currentScene: index, activeScene: index })
    }, TRANSITION_DURATION)
  }

  useEffect(() => {
    return () => {
      clearTransition()
    }
  }, [])

  return (
    <SceneContext.Provider value={{ currentScene, activeScene, goToScene, isTransitioning, transitionProgress }}>
      {children}
    </SceneContext.Provider>
  )
}

export function SceneRouter({ children }: { children: ReactNode }) {
  return <SceneProvider>{children}</SceneProvider>
}

export function useScene() {
  return useContext(SceneContext)
}
