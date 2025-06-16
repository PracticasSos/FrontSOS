import React, { useRef, useEffect, useState } from 'react';
import { JEELIZVTOWIDGET } from 'jeelizvtowidget';
import './VirtualTryOn3D.css';

// Define categories and their corresponding SKUs
const GLASSES_CATEGORIES = [
  {
    name: 'Deportivos',
    models: [
      'rayban_aviator_or_vertFlash',
      'rayban_wayfarer_havane_vert',
      'rayban_wayfarer_denimOrange_orangeDegrade',
    ],
  },
  {
    name: 'Minimalistas',
    models: [
      'rayban_clubmaster_havaneNoir_bleuGris',
      'rayban_andy_havane_bleu_flash',
      'rayban_justin_noir_grisDegrade',
    ],
  },
  {
    name: 'Formales',
    models: [
      'rayban_boyfriend_noir_gris_clair_degrade',
      'rayban_justin_noir_vert',
      'rayban_clubround_havane_vertClassique_g15',
    ],
  },
];

export default function VirtualTryOn3D() {
  const placeholderRef = useRef(null);
  const canvasRef = useRef(null);
  const loadingRef = useRef(null);

  const [selectedSKU, setSelectedSKU] = useState(GLASSES_CATEGORIES[0].models[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize widget once
  useEffect(() => {
    JEELIZVTOWIDGET.start({
      placeHolder: placeholderRef.current,
      canvas: canvasRef.current,
      callbacks: {
        LOADING_START: () => setIsLoading(true),
        LOADING_END: () => setIsLoading(false),
      },
      sku: selectedSKU,
      callbackReady: () => console.log('Widget listo'),
      onError: (err) => console.error('Error VTO:', err),
    });

    return () => {
      JEELIZVTOWIDGET.destroy();
    };
  }, []);

  // Load new model when selectedSKU changes
  useEffect(() => {
    JEELIZVTOWIDGET.load(selectedSKU);
  }, [selectedSKU]);

  return (
    <div className="vto-container">
      <div className="vto-view" ref={placeholderRef}>
        <canvas ref={canvasRef} className="vto-canvas" />
        {isLoading && (
          <div className="vto-loading">
            CARGANDO...
          </div>
        )}
      </div>

      <div className="vto-selector">
        {GLASSES_CATEGORIES.map((category) => (
          <div key={category.name} className="vto-category">
            <div className="vto-category-title">{category.name}</div>
            <div className="vto-model-list">
              {category.models.map((sku) => (
                <button
                  key={sku}
                  className={`vto-btn ${sku === selectedSKU ? 'active' : ''}`}
                  onClick={() => setSelectedSKU(sku)}
                >
                  {sku.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
