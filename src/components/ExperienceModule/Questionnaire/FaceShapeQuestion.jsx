import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

import ProgressFlow from '../ExperienceUI/ProgressFlow';
import '../Questionnaire/questionsStyles.css';
import './FaceShapeQuestion.css';

export default function FaceShapeQuestion({ step, total, onAnswer, onPrev, answer }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDetectedRef = useRef(false);
  const latestLandmarksRef = useRef(null);

  const [faceShape, setFaceShape] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraInstance, setCameraInstance] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const loadMediaPipeScripts = () => {
    return new Promise((resolve, reject) => {
      if (
        window.FaceMesh &&
        window.drawConnectors &&
        window.drawLandmarks &&
        window.Camera
      ) {
        setIsLibraryLoaded(true);
        resolve();
        return;
      }

      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
      ];

      let loaded = 0;
      scripts.forEach((src) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loaded++;
          if (loaded === scripts.length) {
            setIsLibraryLoaded(true);
            resolve();
          }
        };
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
    });
  };

  useEffect(() => {
    loadMediaPipeScripts().catch(console.error);
    return () => {
      if (cameraInstance) cameraInstance.stop();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const distance = (a, b) =>
    Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const determineFaceShape = (landmarks) => {
    const forehead = landmarks[10];
    const chin = landmarks[152];
    const leftJaw = landmarks[234];
    const rightJaw = landmarks[454];
    const leftCheek = landmarks[93];
    const rightCheek = landmarks[323];
    const foreheadWidth = distance(landmarks[67], landmarks[297]);
    const faceHeight = distance(forehead, chin);
    const jawWidth = distance(leftJaw, rightJaw);
    const cheekWidth = distance(leftCheek, rightCheek);
    const ratio = cheekWidth / faceHeight;

    if (
      Math.abs(jawWidth - cheekWidth) < 0.03 &&
      Math.abs(cheekWidth - foreheadWidth) < 0.03 &&
      ratio > 0.9
    ) {
      return 'Cuadrado';
    } else if (ratio > 0.9) {
      return 'Redondo';
    } else if (foreheadWidth > jawWidth && cheekWidth > jawWidth) {
      return 'Corazón';
    } else if (cheekWidth > foreheadWidth && cheekWidth > jawWidth) {
      return 'Diamante';
    } else if (jawWidth > foreheadWidth && jawWidth > cheekWidth) {
      return 'Triangular';
    } else {
      return 'Ovalado';
    }
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 640;
    canvas.height = 480;

    if (results.multiFaceLandmarks?.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      faceDetectedRef.current = true;
      setFaceDetected(true);
      latestLandmarksRef.current = landmarks;

      window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION || [], {
        color: '#6AB1CD',
        lineWidth: 0.5,
      });
      window.drawLandmarks(ctx, landmarks, { color: '#6AB1CD', radius: 1 });
    } else {
      faceDetectedRef.current = false;
      setFaceDetected(false);
    }
  };

  const initializeFaceMesh = async () => {
    const faceMesh = new window.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);
    return faceMesh;
  };

  const startCamera = (faceMesh) => {
    const videoElement = webcamRef.current?.video;
    if (!videoElement) return;

    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    setCameraInstance(camera);
    camera.start();
    setIsScanning(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);

          if (!faceShape && latestLandmarksRef.current) {
            const shape = determineFaceShape(latestLandmarksRef.current);
            setFaceShape(shape);
          }

          return 100;
        }

        return faceDetectedRef.current ? prev + 1.25 : prev;
      });
    }, 100);

    setIntervalId(interval);
  };

  const handleCameraReady = async () => {
    if (isCameraReady || !isLibraryLoaded) return;

    try {
      const faceMesh = await initializeFaceMesh();
      setIsCameraReady(true);
      startCamera(faceMesh);
    } catch (error) {
      console.error('Error al iniciar FaceMesh:', error);
    }
  };

  const handleRetry = () => {
    setFaceShape(null);
    setProgress(0);
    setIsScanning(true);
  };

  return (
    <div className="question-card FaceShapeQuestion--container">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">Necesitamos conocer la forma de tu rostro</h2>
      <p className="question-subtitle">
        Permite tu cámara para detectar tu rostro automáticamente.
      </p>

      <div className="camera-preview">
        {!isLibraryLoaded && (
          <div className="loading-camera-text">
            Cargando librerías de detección facial...
          </div>
        )}

        {isLibraryLoaded && !isCameraReady && (
          <div className="loading-camera-text">
            Iniciando cámara... por favor espera unos segundos.
          </div>
        )}

        <Webcam
          ref={webcamRef}
          className={`preview-video ${isCameraReady ? 'fade-in' : 'hidden'}`}
          onUserMedia={handleCameraReady}
        />

        {isCameraReady && <canvas ref={canvasRef} className="overlay-canvas fade-in" />}

        {isCameraReady && isScanning && (
          <div className="scanning-text">
            {faceDetected
              ? `Escaneando rostro... ${Math.floor(progress)}%`
              : 'No se detecta rostro'}
          </div>
        )}
      </div>

      {!isScanning && faceShape && (
        <div className="photo-result">
          <p className="question-subtitle">
            Forma detectada: <strong>{faceShape}</strong>
          </p>

          <div className="actions">
            {step > 0 && (
              <button className="btn-secondary" onClick={onPrev}>
                Anterior
              </button>
            )}
            {/* <button className="btn-secondary" onClick={handleRetry}>
              Volver a intentar
            </button> */}
            <button className="btn-primary" onClick={() => onAnswer(faceShape)}>
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
