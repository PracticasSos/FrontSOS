import React, { useRef, useEffect, useState } from 'react';
import './LensCustomizer.css';
import lensImage from '../../../assets/luna.png'; // Asegúrate de que la imagen esté aquí

// Colores oficiales aproximados de Transitions (Signature Gen 8)
const COLORS = [
  { hex: '#3C2A1E', name: 'Brown' },       // Marrón
  { hex: '#1A3D6D', name: 'Blue' },        // Azul
  { hex: '#004225', name: 'Green' },       // Verde
  { hex: '#5A2A2A', name: 'Graphite Green' }, // Marrón rojizo profundo
  { hex: '#3A3A3A', name: 'Gray' },        // Gris
  { hex: '#B1624E', name: 'Amber' },       // Ámbar
  { hex: '#282828', name: 'Sapphire' },    // Zafiro (gris azulado oscuro)
];

function LensCustomizer() {
  const canvasRef = useRef(null);
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState(COLORS[0].hex);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = lensImage;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      // Dibuja la imagen base
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.beginPath();

      // Creamos la máscara basada en alpha
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const alpha = imgData.data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 150) {
            ctx.rect(x, y, 1, 1);
          }
        }
      }

      ctx.clip();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
  }, [opacity, color]);

  return (
    <div className="app-wrapper">
      <div className="lens-container">
        {/* Vista del Lente */}
        <div className="lens-preview">
          <h3 className="section-title">Lente</h3>
          <canvas ref={canvasRef} />
        </div>

        {/* Control de Opacidad */}
        <div className="control-box">
          <h3 className="section-title">Nivel de opacidad</h3>
          <div className="opacity-slider-container">
            <input
              type="range"
              min={0}
              max={100}
              value={(opacity / 0.7) * 100}
              onChange={(e) => {
                const userValue = parseInt(e.target.value, 10);
                setOpacity((userValue / 100) * 0.7);
              }}
              className="vertical-slider"
            />
            <div className="opacity-label">
              {Math.round((opacity / 0.7) * 100)}%
            </div>
          </div>
        </div>

        {/* Selector de Color */}
        <div className="control-box">
          <h3 className="section-title">Color del lente</h3>
          <div className="color-options">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                className={`color-button ${color === c.hex ? 'selected' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColor(c.hex)}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LensCustomizer;
