import React, { useRef, useEffect, useState } from 'react';
import { JEELIZVTOWIDGET } from 'jeelizvtowidget';
import { supabase } from '../../../api/supabase';
import './VirtualTryOn3D.css';

export default function VirtualTryOn3D() {
  const placeholderRef = useRef(null);
  const canvasRef = useRef(null);

  const [models, setModels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [widgetStarted, setWidgetStarted] = useState(false);

  // Obtener modelos activos desde Supabase
  useEffect(() => {
    const fetchModels = async () => {
      setLoadingModels(true);
      const { data, error } = await supabase
        .from('glasses_models')
        .select('sku, label')
        .eq('is_active', true)
        .order('label', { ascending: true });

      if (error) {
        console.error('Error cargando modelos:', error.message);
      } else {
        setModels(data);
      }

      setLoadingModels(false);
    };

    fetchModels();
  }, []);

  // Inicializar JEELIZ una sola vez
  useEffect(() => {
    if (!widgetStarted && models.length > 0) {
      const sku = models[currentIndex]?.sku;
      JEELIZVTOWIDGET.start({
        placeHolder: placeholderRef.current,
        canvas: canvasRef.current,
        callbacks: {
          LOADING_START: () => setIsLoading(true),
          LOADING_END: () => setIsLoading(false),
        },
        sku,
        callbackReady: () => {
          console.log('Widget listo');
          setWidgetStarted(true);
        },
        onError: (err) => console.error('Error VTO:', err),
      });
    }

    return () => {
      JEELIZVTOWIDGET.destroy(); // Limpieza si el componente se desmonta
    };
  }, [models, widgetStarted]);

  // Cambiar modelo cuando cambia el índice
  useEffect(() => {
    const sku = models[currentIndex]?.sku;
    if (sku && widgetStarted) {
      JEELIZVTOWIDGET.load(sku);
    }
  }, [currentIndex, models, widgetStarted]);

  // Navegación
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % models.length);
  };

  return (
    <div className="vto-container">
      <div className="vto-view" ref={placeholderRef}>
        <canvas ref={canvasRef} className="vto-canvas" />
        {isLoading && <div className="vto-loading">CARGANDO...</div>}
      </div>

      <div className="vto-carousel">
        {loadingModels ? (
          <div className="vto-loading">Cargando modelos...</div>
        ) : (
          <>
            <button className="vto-nav left" onClick={handlePrev}>&larr;</button>
            <div className="vto-model">
              <span>{models[currentIndex]?.label}</span>
            </div>
            <button className="vto-nav right" onClick={handleNext}>&rarr;</button>
          </>
        )}
      </div>
    </div>
  );
}
