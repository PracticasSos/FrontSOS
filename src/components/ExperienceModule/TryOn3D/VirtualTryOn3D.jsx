import React, { useRef, useEffect, useState } from 'react';
import { JEELIZVTOWIDGET } from 'jeelizvtowidget';
import { supabase } from '../../../api/supabase';
import './VirtualTryOn3D.css';

export default function VirtualTryOn3D() {
  const placeholderRef = useRef(null);
  const canvasRef = useRef(null);

  const [models, setModels] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);

  // Obtener modelos activos desde Supabase
  useEffect(() => {
    const fetchModels = async () => {
      setLoadingModels(true);
      const { data, error } = await supabase
        .from('glasses_models')
        .select('sku, label')
        .eq('is_active', true) // ✅ corregido
        .order('label', { ascending: true });

      if (error) {
        console.error('Error cargando modelos:', error.message);
      } else {
        setModels(data);
        if (data.length > 0) {
          setSelectedSKU(data[0].sku); // Selecciona el primero por defecto
        }
      }

      setLoadingModels(false);
    };

    fetchModels();
  }, []);

  // Inicializar el widget al cargar por primera vez
  useEffect(() => {
    if (!selectedSKU) return;

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
  }, [selectedSKU]);

  // Cargar nuevo modelo al cambiar el SKU
  useEffect(() => {
    if (selectedSKU) {
      JEELIZVTOWIDGET.load(selectedSKU);
    }
  }, [selectedSKU]);

  return (
    <div className="vto-container">
      <div className="vto-view" ref={placeholderRef}>
        <canvas ref={canvasRef} className="vto-canvas" />
        {isLoading && <div className="vto-loading">CARGANDO...</div>}
      </div>

      <div className="vto-selector">
        {loadingModels ? (
          <div className="vto-loading">Cargando modelos...</div>
        ) : (
          <div className="vto-model-list">
            {models.map(({ sku, label }) => (
              <button
                key={sku}
                className={`vto-btn ${sku === selectedSKU ? 'active' : ''}`}
                onClick={() => setSelectedSKU(sku)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
