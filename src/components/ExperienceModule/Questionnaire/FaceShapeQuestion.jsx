import React, { useState, useEffect, useRef } from 'react'
// Import WebGL backend before face-api
import '@tensorflow/tfjs-backend-webgl'
import * as faceapi from '@vladmandic/face-api'
import '../Questionnaire/questionsStyles.css'
import './FaceShapeQuestion.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'

export default function FaceShapeQuestion({ step, total, onAnswer }) {
  const videoRef = useRef(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState('') // '', 'loading-models', 'detecting-face', 'detecting-shape'
  const [error, setError] = useState('')

  // Cargar y preparar modelos
  useEffect(() => {
    async function loadModels() {
      setStatus('loading-models')
      try {
        await faceapi.tf.setBackend('webgl')
        await faceapi.tf.ready()
        const MODEL_URL = '/models'
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        setModelsLoaded(true)
        setStatus('')
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los modelos de detección.')
      }
    }
    loadModels()
  }, [])

  // Arrancar detección continua y análisis de forma
  useEffect(() => {
    let stream
    let animationId
    async function startAndDetect() {
      if (!modelsLoaded) return
      setError('')
      setStatus('detecting-face')
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        const video = videoRef.current
        video.srcObject = stream
        video.style.transform = 'scaleX(-1)'
        await video.play()

        // loop de detección
        async function detectLoop() {
          if (video.paused || video.ended) return
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()

          if (detection && detection.landmarks) {
            cancelAnimationFrame(animationId)
            setStatus('detecting-shape')
            const faceShape = analyzeFaceShape(detection.landmarks)
            onAnswer(faceShape)
          } else {
            animationId = requestAnimationFrame(detectLoop)
          }
        }

        animationId = requestAnimationFrame(detectLoop)
      } catch (err) {
        console.error(err)
        setError('No se pudo acceder a la cámara.')
      }
    }

    startAndDetect()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [modelsLoaded, onAnswer])

  // Determinar forma de rostro usando landmarks
  const analyzeFaceShape = (landmarks) => {
    const pts = landmarks.positions
    // Medidas básicas: anchuras y largo
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
    const jawWidth = dist(pts[0], pts[16])            // ancho mandíbula
    const cheekWidth = dist(pts[2], pts[14])         // ancho mejillas
    const foreheadWidth = dist(pts[17], pts[26])     // ancho frente
    const faceLength = dist(pts[8], {                // largo desde punta barbilla a entrecejo
      x: (pts[19].x + pts[24].x) / 2,
      y: (pts[19].y + pts[24].y) / 2,
    })

    const ratios = {
      lengthToCheek: faceLength / cheekWidth,
      cheekToJaw: cheekWidth / jawWidth,
      cheekToForehead: cheekWidth / foreheadWidth,
    }

    // Clasificar según umbrales empíricos
    if (ratios.lengthToCheek > 1.5) {
      return 'oblongo'
    }
    if (Math.abs(jawWidth - cheekWidth) / cheekWidth < 0.05 && Math.abs(foreheadWidth - cheekWidth) / cheekWidth < 0.05) {
      return 'cuadrado'
    }
    if (ratios.cheekToJaw > 1.15 && ratios.cheekToForehead > 1.1) {
      // mejillas más anchas que mandíbula y frente
      return 'diamante'
    }
    if (ratios.cheekToJaw > 1.05 && foreheadWidth > jawWidth) {
      return 'corazón'
    }
    if (ratios.cheekToJaw < 1.05 && ratios.lengthToCheek < 1.25) {
      return 'redondo'
    }
    return 'ovalado'
  }

  return (
    <div className="question-card FaceShapeQuestion--container">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">Necesitamos conocer la forma de tu rostro</h2>
      <p className="question-subtitle">
        Permite tu cámara para detectar tu rostro automáticamente.
      </p>

      <div className="camera-preview">
        <video
          ref={videoRef}
          className="preview-video"
          playsInline
          muted
          webkit-playsinline="true"
        />
      </div>

      <div className="status-area">
        {status === 'loading-models' && <p>Cargando modelos...</p>}
        {status === 'detecting-face' && <p>Detectando tu cara...</p>}
        {status === 'detecting-shape' && <div className="loader"></div>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}
