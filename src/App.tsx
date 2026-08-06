import { useEffect } from 'react'
import Canvas from './entry/Canvas'
import { HUD } from './components'
import { SceneRouter } from './hooks/useScene'
import './styles/global.css'

export default function App() {
  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.background = '#000000'
  }, [])

  return (
    <SceneRouter>
      <div id="app" style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000000' }}>
        <Canvas />
        <HUD />
      </div>
    </SceneRouter>
  )
}
