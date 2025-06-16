import { useState, useEffect } from 'react'
import './Loader.css'

export default function Loader({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const totalDuration = 15000 // 15 segundos
    const intervalMs = 100
    const step = 100 / (totalDuration / intervalMs)

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step
        if (next >= 100) {
          clearInterval(timer)
          setProgress(100)
          setReady(true)
        }
        return next >= 100 ? 100 : next
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="loader-container">
      {/* Aquí podrías poner tu imagen animada */}
      <div className="loader-title">Estamos creando tus lentes perfectos</div>
      <div className="loader-bar-bg">
        <div
          className="loader-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="loader-subtitle">
        Esto puede tomar algunos segundos.
      </div>
      <button
        className="loader-btn"
        disabled={!ready}
        onClick={() => ready && onFinish()}
      >
        Ver mis Lentes
      </button>
    </div>
  )
}
