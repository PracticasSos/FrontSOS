import React, { useState, useEffect, useRef } from 'react'
import '@tensorflow/tfjs-backend-webgl'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import '../Questionnaire/questionsStyles.css'
import './FaceShapeQuestion.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'

export default function FaceShapeQuestion({ step, total, onAnswer }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [detector, setDetector] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDetector() {
      try {
        const det = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            refineLandmarks: true,
            maxFaces: 1,
          }
        )
        setDetector(det)
        console.log('✅ Modelo cargado correctamente')
      } catch (err) {
        console.error(err)
        setError('Error al cargar el modelo de detección facial.')
      }
    }
    loadDetector()
  }, [])

  useEffect(() => {
    let stream
    let animationId
    let analysisTimeout

    const startAndDetect = async () => {
      if (!detector) return
      setStatus('detecting-face')

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        })

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        video.srcObject = stream
        await video.play()

        video.onloadedmetadata = () => {
          console.log('🎥 Video dimensions:', video.videoWidth, video.videoHeight)

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          async function detectLoop() {
            if (video.paused || video.ended) return

            const faces = await detector.estimateFaces(video)
            console.log('Faces detected:', faces)

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (faces.length > 0) {
              const face = faces[0]
              const keypoints = face.keypoints

              // Dibuja puntos faciales
              ctx.fillStyle = 'lime'
              for (const point of keypoints) {
                ctx.beginPath()
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
                ctx.fill()
              }

              // Dibuja caja de detección
              if (face.box) {
                ctx.strokeStyle = 'red'
                ctx.lineWidth = 2
                ctx.strokeRect(face.box.xMin, face.box.yMin, face.box.width, face.box.height)
              }

              setStatus('detecting-shape')

              if (!analysisTimeout) {
                analysisTimeout = setTimeout(() => {
                  const shape = analyzeFaceShapeFromMesh(keypoints)
                  onAnswer(shape)
                }, 8000)
              }
            }

            animationId = requestAnimationFrame(detectLoop)
          }

          detectLoop()
        }
      } catch (err) {
        console.error('❌ Error al acceder a la cámara:', err)
        setError('No se pudo acceder a la cámara.')
      }
    }

    startAndDetect()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (analysisTimeout) clearTimeout(analysisTimeout)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [detector, onAnswer])

  const analyzeFaceShapeFromMesh = (keypoints) => {
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

    const jawWidth = dist(keypoints[234], keypoints[454])
    const cheekWidth = dist(keypoints[93], keypoints[323])
    const foreheadWidth = dist(keypoints[151], keypoints[378])
    const chin = keypoints[152]
    const midForehead = keypoints[10]
    const faceLength = dist(chin, midForehead)

    const ratios = {
      lengthToCheek: faceLength / cheekWidth,
      cheekToJaw: cheekWidth / jawWidth,
      cheekToForehead: cheekWidth / foreheadWidth,
    }

    if (ratios.lengthToCheek > 1.5) return 'oblongo'
    if (
      Math.abs(jawWidth - cheekWidth) / cheekWidth < 0.05 &&
      Math.abs(foreheadWidth - cheekWidth) / cheekWidth < 0.05
    ) return 'cuadrado'
    if (ratios.cheekToJaw > 1.15 && ratios.cheekToForehead > 1.1) return 'diamante'
    if (ratios.cheekToJaw > 1.05 && foreheadWidth > jawWidth) return 'corazón'
    if (ratios.cheekToJaw < 1.05 && ratios.lengthToCheek < 1.25) return 'redondo'
    return 'ovalado'
  }

  return (
    <div className="question-card FaceShapeQuestion--container">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">Necesitamos conocer la forma de tu rostro</h2>
      <p className="question-subtitle">
        Permite tu cámara para detectar tu rostro automáticamente.
      </p>

      <div className="camera-wrapper">
        <video
          ref={videoRef}
          className="video-only"
          playsInline
          muted
          autoPlay
        />
        <canvas
          ref={canvasRef}
          className="overlay-canvas"
        />
      </div>

      <div className="status-area">
        {status === 'detecting-face' && <p>Detectando tu cara...</p>}
        {status === 'detecting-shape' && (
          <div className="loader">
            <p>Analizando tu tipo de rostro...</p>
          </div>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}
