import { useScene } from '../hooks/useScene'

const SCENE_LABELS = [
  'IDENTITY CORE',
  'PROJECT ARCHIVE',
  'TECHNOLOGY MATRIX',
  'FINAL MESSAGE',
]

export function HUD() {
  const { currentScene, isTransitioning, transitionProgress } = useScene()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 10,
      padding: '24px 32px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Top-left: Scene label */}
      <div style={{ position: 'absolute', top: 24, left: 32, minWidth: 220 }}>
        <p className="hud-label">
          SCENE 0{currentScene + 1}
        </p>
        <p className="hud-label" style={{ marginTop: 4, color: 'rgba(206,206,206,0.7)', fontSize: '11px' }}>
          {SCENE_LABELS[currentScene]}
        </p>
        {isTransitioning && (
          <>
            <p className="hud-label" style={{ marginTop: 8, color: '#5B8CFF' }}>
              TRANSITIONING...
            </p>
            <div style={{ position: 'relative', marginTop: 10, width: 180, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <div style={{ width: `${Math.round(transitionProgress * 100)}%`, height: '100%', background: '#5B8CFF', borderRadius: 2, transition: 'width 0.1s linear' }} />
            </div>
          </>
        )}
      </div>

      {/* Top-right: System status */}
      <div style={{ position: 'absolute', top: 24, right: 32, textAlign: 'right' }}>
        <p className="hud-label">SYSTEM ACTIVE</p>
        <p className="hud-label" style={{ marginTop: 4, opacity: 0.5 }}>G-CORE v0.1.0</p>
      </div>

      {/* Bottom-left: Navigation hint */}
      <div style={{ position: 'absolute', bottom: 24, left: 32 }}>
        <p className="hud-label" style={{ opacity: 0.4 }}>
          SCROLL OR CLICK TO EXPLORE
        </p>
      </div>

      {/* Bottom-right: Scene dots */}
      <div style={{ position: 'absolute', bottom: 24, right: 32, display: 'flex', gap: 8 }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: i === currentScene ? 24 : 8,
              height: 4,
              background: i === currentScene ? '#5B8CFF' : 'rgba(206,206,206,0.3)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Horizontal HUD line */}
      <div
        className="hud-line"
        style={{ position: 'absolute', bottom: 60, left: 32, right: 32 }}
      />
    </div>
  )
}
