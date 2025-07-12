import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as cam from '@mediapipe/camera_utils';

import ProgressFlow from '../ExperienceUI/ProgressFlow';
import '../Questionnaire/questionsStyles.css';
import './FaceShapeQuestion.css';

export default function FaceShapeQuestion({ step, total, onAnswer }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceShape, setFaceShape] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [landmarkSnapshot, setLandmarkSnapshot] = useState(null);
  const [cameraInstance, setCameraInstance] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    return () => {
      if (cameraInstance) cameraInstance.stop();
    };
  }, [cameraInstance]);

  useEffect(() => {
    if (!isScanning && landmarkSnapshot) {
      const shape = determineFaceShape(landmarkSnapshot);
      setFaceShape(shape);
      onAnswer(shape);
    }
  }, [isScanning, landmarkSnapshot]);

  const startCamera = (faceMesh) => {
    const videoElement = webcamRef.current.video;

    const camera = new cam.Camera(videoElement, {
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
        }
        return prev + 1.25;
      });
    }, 100);
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks?.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION || [], {
        color: '#00FFAA',
        lineWidth: 0.5,
      });
      drawLandmarks(ctx, landmarks, { color: '#6AB1CD', radius: 1 });

      if (!landmarkSnapshot) {
        setLandmarkSnapshot(landmarks);
      }
    }
    ctx.restore();
  };

  const distance = (a, b) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  };

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

  const handleRetry = () => {
    setFaceShape(null);
    setLandmarkSnapshot(null);
    setProgress(0);
    setIsScanning(true);
  };

  const handleCameraReady = async () => {
    if (!isCameraReady) {
      const faceMeshModule = await import('@mediapipe/face_mesh');
      const faceMesh = new faceMeshModule.FaceMesh({
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

      // Guardamos referencias a constantes de MediaPipe si las necesitas
      window.FACEMESH_TESSELATION = faceMeshModule.FACEMESH_TESSELATION;

      setIsCameraReady(true);
      startCamera(faceMesh);
    }
  };

  return (
    <div className="question-card FaceShapeQuestion--container">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">Necesitamos conocer la forma de tu rostro</h2>
      <p className="question-subtitle">
        Permite tu cámara para detectar tu rostro automáticamente.
      </p>

      <div className="camera-preview">
        {!isCameraReady && (
          <div className="loading-camera-text">
            Iniciando cámara... por favor espera unos segundos hasta que tu rostro aparezca correctamente.
          </div>
        )}

        <Webcam
          ref={webcamRef}
          className={`preview-video ${isCameraReady ? 'fade-in' : 'hidden'}`}
          onUserMedia={handleCameraReady}
        />

        {isCameraReady && <canvas ref={canvasRef} className="overlay-canvas fade-in" />}

        {isCameraReady && isScanning && (
          <div className="scanning-text">Escaneando rostro... {Math.floor(progress)}%</div>
        )}
      </div>

      {!isScanning && faceShape && (
        <div className="photo-result">
          <p className="question-subtitle">
            Forma detectada: <strong>{faceShape}</strong>
          </p>
          <div className="actions">
            <button className="btn-secondary" onClick={handleRetry}>
              Volver a intentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
