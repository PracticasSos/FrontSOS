import React, { useState, useEffect, useRef } from 'react'
// Import WebGL backend before face-api
import '@tensorflow/tfjs-backend-webgl'
import * as faceapi from '@vladmandic/face-api'
import '../Questionnaire/questionsStyles.css'
import './FaceShapeQuestion.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'

export default function FaceShapeQuestion({ step, total, onAnswer }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [shape, setShape] = useState('')
  const [error, setError] = useState('')

  // Cargar modelos
  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.tf.setBackend('webgl')
        await faceapi.tf.ready()
        const MODEL_URL = '/models'
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        setModelsLoaded(true)
      } catch (err) {
        setError('No se pudieron cargar los modelos de detección.')
      }
    }
    loadModels()
  }, [])

  // Iniciar cámara
  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoEl = videoRef.current
      videoEl.srcObject = stream
      videoEl.play()
    } catch (err) {
      setError('No se pudo acceder a la cámara.')
    }
  }

  // Capturar foto del video
  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/png')
    setCapturedImage(dataUrl)

    const detection = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()

    if (detection && detection.landmarks) {
      const faceShape = analyzeFaceShape(detection.landmarks)
      setShape(faceShape)
      onAnswer(faceShape)
    } else {
      setError('No se detectó ningún rostro en la imagen.')
    }

    // Detener cámara
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      video.srcObject = null
    }
  }

  // Analizar forma del rostro (demo)
  const analyzeFaceShape = (landmarks) => {
    // Aquí pondrías tu lógica real. Retorno temporal:
    return 'ovalado'
  }

  // Subir foto manual
  const handleUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const img = new Image()
    const reader = new FileReader()

    reader.onload = async (e) => {
      img.src = e.target.result
      img.onload = async () => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)

        setCapturedImage(canvas.toDataURL('image/png'))

        const detection = await faceapi
          .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()

        if (detection && detection.landmarks) {
          const faceShape = analyzeFaceShape(detection.landmarks)
          setShape(faceShape)
          onAnswer(faceShape)
        } else {
          setError('No se detectó ningún rostro en la imagen.')
        }
      }
    }

    reader.readAsDataURL(file)
  }

  return (
    <div className="question-card">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">Necesitamos conocer la forma de tu rostro</h2>
      <p className="question-subtitle">
        Enciende tu cámara o sube una foto para que podamos detectarla automáticamente.
      </p>

      {!capturedImage && (
        <>
          <div className="camera-preview">
            <video
              ref={videoRef}
              className="preview-video"
              playsInline
              muted
              webkit-playsinline="true"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div className="actions">
            <button
              className="btn-secondary"
              onClick={startCamera}
              disabled={!modelsLoaded}
            >
              Iniciar cámara
            </button>
            <button
              className="btn-primary"
              onClick={capture}
              disabled={!modelsLoaded}
            >
              Tomar foto
            </button>
            <label className="btn-secondary file-upload-btn">
              Subir foto
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
              />
            </label>
          </div>

          {error && <p className="error-text">{error}</p>}
        </>
      )}

      {capturedImage && (
        <div className="photo-result">
          <img src={capturedImage} alt="Rostro capturado" />
          <p className="question-subtitle">Forma detectada: {shape}</p>
          <div className="actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setCapturedImage(null)
                setShape('')
                setError('')
              }}
            >
              Volver a intentar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
