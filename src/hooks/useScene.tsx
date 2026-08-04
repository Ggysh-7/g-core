import { createContext, useContext, useState, ReactNode } from 'react'
import { SCENE_COUNT } from '../constants/design'

export type SceneIndex = 0 | 1 | 2 | 3

interface SceneContextType {
  currentScene: SceneIndex
  activeScene: SceneIndex
  goToScene: (index: SceneIndex) => void
  isTransitioning: boolean
}

const SceneContext = createContext<SceneContextType>({
  currentScene: 0,
  activeScene: 0,
  goToScene: () => {},
  isTransitioning: false,
})

export function SceneProvider({ children }: { children: ReactNode }) {
  const [currentScene, setCurrentScene] = useState<SceneIndex>(0)
  const [activeScene, setActiveScene] = useState<SceneIndex>(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToScene = (index: SceneIndex) => {
    if (index === currentScene || index >= SCENE_COUNT || isTransitioning) return
    setIsTransitioning(true)
    setActiveScene(index)
    setTimeout(() => {
      setCurrentScene(index)
      setIsTransitioning(false)
    }, 4000)
  }

  return (
    <SceneContext.Provider value={{ currentScene, activeScene, goToScene, isTransitioning }}>
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
